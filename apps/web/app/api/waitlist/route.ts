import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Waitlist (#38, JSB 21 Oct 2026): entries go to Docufast's own database, not Formspree.
// Server only: the service role key never reaches the browser, and the table has RLS on
// with no public policies (supabase/migrations/20261022_waitlist.sql).

// Bump this when the wording on the form changes, so each entry records what the person saw.
// Wording approved by Sheriff, 21 Oct 2026 (NDPA 2023).
const CONSENT_WORDING_VERSION = "waitlist-2026-10-21";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ALLOWED_SOURCES = new Set(["home", "notarization", "services", "faq", "other"]);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please try again." }, { status: 400 });
  }

  // Honeypot: real people never fill this hidden field. Pretend success so bots learn nothing.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const sourceRaw = typeof body.source === "string" ? body.source : "other";
  const source = ALLOWED_SOURCES.has(sourceRaw) ? sourceRaw : "other";
  const marketingConsent = body.marketingConsent === true;

  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "The waitlist is not available right now." }, { status: 503 });
  }

  const supabaseAdmin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { error } = await supabaseAdmin.from("waitlist").insert({
    email,
    name: name || null,
    source,
    marketing_consent: marketingConsent,
    consent_wording_version: CONSENT_WORDING_VERSION,
  });

  // 23505 = already on the list. Treat as success so the form never reveals who has signed up.
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
