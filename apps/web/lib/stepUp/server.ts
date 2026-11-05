// Server helpers for the customer second step (#220). Same pattern as the admin routes:
// the browser sends its access token as "Authorization: Bearer ...", the server checks it with Supabase.
import { createClient } from "@supabase/supabase-js";

export interface StepUpUser {
  sub: string;
  email: string;
  session_id: string;
  aal?: string;
  amr?: { method: string; timestamp: number }[];
}

export function serviceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

/** The signed-in user (token verified by Supabase) with the device session and sign-in strength, or null. */
export async function getSignedIn(req: Request): Promise<StepUpUser | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const {
    data: { user },
    error,
  } = await serviceClient().auth.getUser(token);
  if (error || !user?.email) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
    );
    if (typeof payload.session_id !== "string") return null;
    return { sub: user.id, email: user.email, session_id: payload.session_id, aal: payload.aal, amr: payload.amr };
  } catch {
    return null;
  }
}

/** The server-only secret that protects stored codes. Fails closed: there is no default. */
export function pepper(): string {
  const p = process.env.STEP_UP_CODE_PEPPER ?? "";
  if (p.length < 32) throw new Error("STEP_UP_CODE_PEPPER is not set");
  return p;
}

/** Sends the code to the address already on the account, through SendGrid (same settings as the team alert). */
export async function sendCodeEmail(to: string, subject: string, text: string): Promise<void> {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) throw new Error("SENDGRID_API_KEY is not set");
  const from = process.env.EMAIL_FROM || "docufastng@gmail.com";
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      signal: ctrl.signal,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from, name: "Docufast" },
        subject,
        content: [{ type: "text/plain", value: text }],
      }),
    });
    if (!r.ok) throw new Error(`SendGrid ${r.status}`);
  } finally {
    clearTimeout(t);
  }
}
