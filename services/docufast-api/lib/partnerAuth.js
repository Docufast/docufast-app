// Partner and agent API keys (#41, Playbook 10.1: "Partner API keys: IP-whitelisted in sandbox and
// production; no exceptions"). Every key:
//   - is shown once when issued and stored only as a SHA-256 hash (scripts/issue-partner-key.js);
//   - works only from the IP addresses or ranges listed for it (no allowlist = no access);
//   - carries scopes, an environment (sandbox or live), an optional expiry, and can be revoked;
//   - is rate limited, and every use updates last_used_at and last_used_ip.
// Header: Authorization: Bearer dfk_<env>_<id>_<secret>
import crypto from "node:crypto";
import net from "node:net";
import { supabaseAdmin } from "./verifyFounder.js";
import { clientIp } from "./clientIp.js";

const KEY_PATTERN = /^dfk_(sandbox|live)_([a-z0-9]{12})_([A-Za-z0-9_-]{43})$/;
const ENVIRONMENT = process.env.PARTNER_API_ENV === "live" ? "live" : "sandbox";

const WINDOW_MS = 60 * 1000;
const hits = new Map();
function overLimit(keyId, perMinute) {
  const now = Date.now();
  const entry = hits.get(keyId);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(keyId, { start: now, count: 1 });
    if (hits.size > 10000) hits.clear();
    return false;
  }
  entry.count += 1;
  return entry.count > perMinute;
}

export function hashSecret(secret) {
  return crypto.createHash("sha256").update(secret, "utf8").digest("hex");
}

/** True when ip is inside one of the allowlist entries (single addresses or CIDR ranges). */
export function ipAllowed(ip, allowlist) {
  if (!ip || !Array.isArray(allowlist) || allowlist.length === 0) return false;
  const list = new net.BlockList();
  for (const entry of allowlist) {
    const [addr, bits] = String(entry).trim().split("/");
    const type = net.isIPv6(addr) ? "ipv6" : net.isIPv4(addr) ? "ipv4" : null;
    if (!type) continue;
    if (bits === undefined) list.addAddress(addr, type);
    else list.addSubnet(addr, Number(bits), type);
  }
  return list.check(ip, net.isIPv6(ip) ? "ipv6" : "ipv4");
}

function refuse(res, status, message) {
  // Same short message for every failure that could reveal whether a key exists.
  return res.status(status).json({ type: "about:blank", title: message, status });
}

/**
 * Express middleware: requirePartnerKey("orders:write").
 * On success sets req.partner = { keyId, partnerName, scopes, environment }.
 */
export function requirePartnerKey(scope) {
  return async (req, res, next) => {
    const raw = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
    const match = KEY_PATTERN.exec(raw);
    if (!match) return refuse(res, 401, "A valid partner API key is required.");
    const [, keyEnv, keyId, secret] = match;
    if (keyEnv !== ENVIRONMENT) return refuse(res, 401, "A valid partner API key is required.");

    const { data: key, error } = await supabaseAdmin
      .from("partner_api_keys")
      .select("key_id, partner_name, secret_hash, scopes, allowed_ips, environment, expires_at, revoked_at, rate_limit_per_minute")
      .eq("key_id", keyId)
      .maybeSingle();
    if (error) {
      console.error("Partner key lookup failed:", error.message);
      return refuse(res, 503, "Please try again shortly.");
    }

    const givenHash = Buffer.from(hashSecret(secret), "hex");
    const storedHash = Buffer.from(key?.secret_hash || "0".repeat(64), "hex");
    const secretOk = key && givenHash.length === storedHash.length && crypto.timingSafeEqual(givenHash, storedHash);
    if (!secretOk || key.environment !== ENVIRONMENT || key.revoked_at || (key.expires_at && new Date(key.expires_at) <= new Date())) {
      return refuse(res, 401, "A valid partner API key is required.");
    }

    const ip = clientIp(req);
    if (!ipAllowed(ip, key.allowed_ips)) {
      console.warn(`Partner key ${keyId} (${key.partner_name}) refused from ${ip}: not on its allowlist`);
      return refuse(res, 403, "This key cannot be used from this address.");
    }
    if (scope && !(key.scopes || []).includes(scope)) {
      return refuse(res, 403, "This key does not allow this action.");
    }
    if (overLimit(keyId, key.rate_limit_per_minute || 60)) {
      res.set("Retry-After", "60");
      return refuse(res, 429, "Too many requests. Please slow down.");
    }

    supabaseAdmin
      .from("partner_api_keys")
      .update({ last_used_at: new Date().toISOString(), last_used_ip: ip })
      .eq("key_id", keyId)
      .then(({ error: e }) => e && console.error("Partner key last-used update failed:", e.message));

    req.partner = { keyId, partnerName: key.partner_name, scopes: key.scopes || [], environment: key.environment };
    next();
  };
}
