import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { WORDING_VERSIONS } from "@/lib/consent";

// Privacy choices: records a change to the marketing choice (#75, #201).
// The browser sends its own access token; the server checks it and appends one row to
// public.consent_records (a change of mind is a NEW row, never an edit), then keeps the
// profile flag in step. Service role only on the server.

type Body = { marketingConsent?: unknown };

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!token) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please try again." }, { status: 400 });
  }
  if (typeof body.marketingConsent !== "boolean") {
    return NextResponse.json({ error: "Please try again." }, { status: 400 });
  }
  const marketingConsent = body.marketingConsent;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "This is not available right now." }, { status: 503 });
  }
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const { data: latest } = await admin
    .from("current_consents")
    .select("granted")
    .eq("user_id", user.id)
    .eq("kind", "marketing")
    .maybeSingle();

  // Only add a record when the choice actually changes.
  if (!latest || latest.granted !== marketingConsent) {
    const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || null;
    const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 300) || null;
    const { error: consentError } = await admin.from("consent_records").insert({
      user_id: user.id,
      kind: "marketing",
      granted: marketingConsent,
      wording_version: WORDING_VERSIONS.marketing,
      source: "privacy_choices",
      ip,
      user_agent: userAgent,
    });
    if (consentError) {
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ marketing_consent: marketingConsent })
    .eq("id", user.id);
  if (profileError) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, marketingConsent });
}
