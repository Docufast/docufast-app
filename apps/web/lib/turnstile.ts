// Cloudflare Turnstile check for public forms (security review 31 Oct 2026, #219).
// Cloudflare is already a Docufast processor (#20), and Turnstile does not set tracking cookies.
// Set TURNSTILE_SECRET_KEY on the server and NEXT_PUBLIC_TURNSTILE_SITE_KEY for the widget.
// CSP: allow https://challenges.cloudflare.com in script-src and frame-src.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** True when the token is valid. Until TURNSTILE_SECRET_KEY is set the check is skipped (with a
 *  warning), so deploying this code cannot break the form; the flood caps still apply. Once the
 *  secret is set, a missing or bad token is refused. */
let warned = false;
export async function verifyTurnstile(token: unknown, remoteIp?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (!warned) { console.warn("TURNSTILE_SECRET_KEY not set: bot check skipped"); warned = true; }
    return true;
  }
  if (typeof token !== "string" || token.length < 10 || token.length > 2048) return false;
  const form = new URLSearchParams({ secret, response: token });
  if (remoteIp) form.set("remoteip", remoteIp);
  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body: form, cache: "no-store" });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
