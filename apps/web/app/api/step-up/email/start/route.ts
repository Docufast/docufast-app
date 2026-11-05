// POST: email a 6-digit code to the address already on the account. No body. (#220)
// Needs the browser's access token in the Authorization header, so another site cannot call it for a customer.
import { NextRequest, NextResponse } from "next/server";
import { getSignedIn, serviceClient, pepper, sendCodeEmail } from "@/lib/stepUp/server";
import { newCode, hashCode, EMAIL } from "@/lib/stepUp/policy.js";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(req: NextRequest) {
  const c = await getSignedIn(req);
  if (!c) return NextResponse.json({ error: "Please sign in." }, { status: 401, headers: NO_STORE });
  const code = newCode();
  try {
    const { data, error } = await serviceClient().rpc("step_up_issue_code", {
      p_user: c.sub,
      p_session: c.session_id,
      p_code_hash: await hashCode(pepper(), c.sub, c.session_id, code),
    });
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Please wait a minute before asking for another code." }, { status: 429, headers: NO_STORE });
    }
    await sendCodeEmail(c.email, EMAIL.subject, EMAIL.text(code));
    return NextResponse.json({ sent: true }, { headers: NO_STORE });
  } catch (e) {
    console.error("step-up code failed", e instanceof Error ? e.message : "unknown");
    return NextResponse.json({ error: "We could not send a code. Please try again." }, { status: 500, headers: NO_STORE });
  }
}
