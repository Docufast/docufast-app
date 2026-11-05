// Customer second step (#220), agreed 1 Nov 2026. Pure functions, no network: unit-tested.
// Customers need nothing before payment. A second step, valid 12 hours for that device session, is needed
// to open or download documents and to create share links. It is checked by the API
// (services/docufast-api, customerSecondStep); this file only issues and checks the emailed code.

/** 6-digit code with no modulo bias. */
export function newCode(rand = (b) => crypto.getRandomValues(b)) {
  const lim = Math.floor(0x1_0000_0000 / 1_000_000) * 1_000_000;
  const b = new Uint32Array(1);
  for (;;) {
    rand(b);
    if (b[0] < lim) return String(b[0] % 1_000_000).padStart(6, "0");
  }
}

/** HMAC-SHA-256 of user + session + code with a server-only secret (STEP_UP_CODE_PEPPER), hex. */
export async function hashCode(pepper, userId, sessionId, code) {
  if (!pepper || pepper.length < 32) throw new Error("STEP_UP_CODE_PEPPER missing or too short");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pepper), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${userId}|${sessionId}|${code}`));
  return [...new Uint8Array(mac)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

/** The 6 digits, or null. Spaces and dashes are allowed. */
export function cleanCode(input) {
  if (typeof input !== "string") return null;
  const d = input.replace(/[\s-]/g, "");
  return /^\d{6}$/.test(d) ? d : null;
}

/** Authenticator used within maxAgeSec (default 5 minutes) in this session: lets us record a fresh app step-up. */
export function freshTotp(c, nowSec, maxAgeSec = 300) {
  if (!c || c.aal !== "aal2") return false;
  return (c.amr ?? []).some((a) => a.method === "totp" && nowSec - a.timestamp >= -60 && nowSec - a.timestamp <= maxAgeSec);
}

export const EMAIL = {
  subject: "Your Docufast sign-in code",
  text: (code) =>
    `Your Docufast code is ${code}. It expires in 10 minutes.\n\n` +
    `Use it only on docufast.ng. Docufast will never ask you for this code by phone, SMS, email or WhatsApp.\n` +
    `If you did not ask for it, you can ignore this email, and consider changing your password.`,
};
