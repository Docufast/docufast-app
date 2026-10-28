// The caller's IP address, read in a way a client cannot fake.
//
// Railway's edge proxy APPENDS the address it saw to X-Forwarded-For, so the last entry is the
// one our own proxy wrote; anything to the left of it was sent by the client and can be forged.
// TRUSTED_PROXY_HOPS is how many proxies we run behind (1 on Railway). If Cloudflare or another
// proxy is put in front later, raise it to 2 so we read the address that proxy wrote.
//
// Used for partner key IP allowlists (#41), the access log (#153) and rate limits.
import net from "node:net";

const HOPS = Math.max(1, Number.parseInt(process.env.TRUSTED_PROXY_HOPS || "1", 10) || 1);

function normalise(ip) {
  if (!ip) return null;
  let value = ip.trim();
  if (value.startsWith("::ffff:")) value = value.slice(7); // IPv4 mapped into IPv6
  if (value.startsWith("[") && value.includes("]")) value = value.slice(1, value.indexOf("]"));
  else if (net.isIPv4(value.split(":")[0]) && value.includes(":")) value = value.split(":")[0]; // a.b.c.d:port
  return net.isIP(value) ? value : null;
}

export function clientIp(req) {
  const header = req.headers["x-forwarded-for"];
  if (typeof header === "string" && header.trim() !== "") {
    const parts = header.split(",").map((p) => p.trim()).filter(Boolean);
    const candidate = parts[parts.length - HOPS];
    const ip = normalise(candidate);
    if (ip) return ip;
  }
  return normalise(req.socket?.remoteAddress || "");
}
