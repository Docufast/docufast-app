#!/usr/bin/env node
// Issue a partner API key (#41). Run on a trusted machine with the service role key for the
// environment the key is for, then hand the key to the partner through the secure channel agreed
// in writing (never WhatsApp, email or chat). The full key is printed ONCE and never stored.
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/issue-partner-key.js \
//     --partner "TheNewspaperStand" --env sandbox --ips 203.0.113.10,203.0.113.11 \
//     --scopes ping,notices:write --expires 2027-04-30 --by "Olamide"
//
// Revoke: update partner_api_keys set revoked_at = now(), revoked_reason = '...' where key_id = '...';
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { hashSecret } from "../lib/partnerAuth.js";

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

const partner = arg("partner");
const env = arg("env");
const ips = (arg("ips") || "").split(",").map((s) => s.trim()).filter(Boolean);
const scopes = (arg("scopes") || "ping").split(",").map((s) => s.trim()).filter(Boolean);
const expires = arg("expires");
const by = arg("by");
const dpaSigned = process.argv.includes("--dpa-signed");

if (!partner || !["sandbox", "live"].includes(env) || ips.length === 0 || !by) {
  console.error("Usage: --partner NAME --env sandbox|live --ips IP[,IP|CIDR...] --by NAME [--scopes a,b] [--expires YYYY-MM-DD] [--dpa-signed]");
  process.exit(1);
}
if (env === "live" && !dpaSigned) {
  console.error("Live keys need a signed data processing agreement first (#20). Add --dpa-signed once it is signed.");
  process.exit(1);
}

const keyId = crypto.randomBytes(9).toString("base64url").toLowerCase().replace(/[^a-z0-9]/g, "").padEnd(12, "0").slice(0, 12);
const secret = crypto.randomBytes(32).toString("base64url"); // 43 characters
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const { error } = await supabase.from("partner_api_keys").insert({
  key_id: keyId,
  partner_name: partner,
  environment: env,
  secret_hash: hashSecret(secret),
  scopes,
  allowed_ips: ips,
  dpa_signed: dpaSigned,
  created_by: by,
  expires_at: expires ? new Date(`${expires}T23:59:59+01:00`).toISOString() : null,
});
if (error) {
  console.error("Could not issue the key:", error.message);
  process.exit(1);
}

console.log(`Key for ${partner} (${env}), allowed from ${ips.join(", ")}, scopes ${scopes.join(", ")}:`);
console.log(`\n  dfk_${env}_${keyId}_${secret}\n`);
console.log("Shown once. Hand it over through the agreed secure channel, then clear this terminal.");
