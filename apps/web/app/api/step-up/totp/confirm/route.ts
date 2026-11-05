// POST: after the browser completes supabase.auth.mfa.challengeAndVerify() and refreshes the session,
// record the authenticator step-up for 12 hours. Accepted only if the token shows an authenticator entry
// less than 5 minutes old. (#220)
import { NextRequest, NextResponse } from "next/server";
import { getSignedIn, serviceClient } from "@/lib/stepUp/server";
import { freshTotp } from "@/lib/stepUp/policy.js";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(req: NextRequest) {
  const c = await getSignedIn(req);
  if (!c) return NextResponse.json({ error: "Please sign in." }, { status: 401, headers: NO_STORE });
  if (!freshTotp(c, Math.floor(Date.now() / 1000))) {
    return NextResponse.json({ error: "Enter the code from your authenticator app first." }, { status: 403, headers: NO_STORE });
  }
  const { data, error } = await serviceClient().rpc("step_up_record_totp", { p_user: c.sub, p_session: c.session_id });
  if (error) return NextResponse.json({ error: "Please try again." }, { status: 500, headers: NO_STORE });
  return NextResponse.json({ until: data }, { headers: NO_STORE });
}
