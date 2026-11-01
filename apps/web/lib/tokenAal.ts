// Reads the "aal" (authenticator assurance level) claim from a Supabase access token.
// Only call this AFTER auth.getUser(token) has verified the token: this reads, it does not verify.
export function tokenAal(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const aal = JSON.parse(json)?.aal;
    return typeof aal === "string" ? aal : null;
  } catch {
    return null;
  }
}
