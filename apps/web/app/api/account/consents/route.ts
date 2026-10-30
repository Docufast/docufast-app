import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { WORDING_VERSIONS, checkAdult, AGE_MESSAGES } from "@/lib/consent";

// Records the sign-up decisions on the server (#199 age check, #75 consent records).
// The browser sends its own access token; the server checks it, applies the 18+ rule again
// (never trusting the page), sets the age check fields on the profile and appends one row per
// decision to public.consent_records with the wording version the person saw.
// Service role only on the server: the key never reaches the browser.

type Body = {
  dateOfBirth?: unknown;
  ageConfirmed?: unknown;
  termsAccepted?: unknown;
  marketingConsent?: unknown;
};

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

  if (body.termsAccepted !== true || body.ageConfirmed !== true) {
    return NextResponse.json(
      { error: "You need to agree to the Terms and confirm you are 18 or over to continue." },
      { status: 400 },
    );
  }

  const dateOfBirth = typeof body.dateOfBirth === "string" ? body.dateOfBirth : "";
  const age = checkAdult(dateOfBirth);
  if (!age.ok) {
    return NextResponse.json({ error: AGE_MESSAGES[age.reason], reason: age.reason }, { status: 400 });
  }

  const marketingConsent = body.marketingConsent === true;
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || null;
  const userAgent = (request.headers.get("user-agent") ?? "").slice(0, 300) || null;

  // Age check on the profile. Customers cannot edit these columns themselves (migration 20261028).
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      date_of_birth: dateOfBirth,
      age_check_method: "declared",
      age_checked_at: new Date().toISOString(),
      marketing_consent: marketingConsent,
    })
    .eq("id", user.id);
  if (profileError) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  const common = { user_id: user.id, source: "sign_up", ip, user_agent: userAgent };
  const { error: consentError } = await admin.from("consent_records").insert([
    { ...common, kind: "terms_privacy", granted: true, wording_version: WORDING_VERSIONS.terms_privacy },
    { ...common, kind: "age_18_plus", granted: true, wording_version: WORDING_VERSIONS.age_18_plus },
    { ...common, kind: "marketing", granted: marketingConsent, wording_version: WORDING_VERSIONS.marketing },
  ]);
  if (consentError) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
