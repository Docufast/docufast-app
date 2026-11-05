// POST { code: "123456" }: check the emailed code; on success this device session is stepped up for 12 hours. (#220)
import { NextRequest, NextResponse } from "next/server";
import { getSignedIn, serviceClient, pepper } from "@/lib/stepUp/server";
import { cleanCode, hashCode } from "@/lib/stepUp/policy.js";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(req: NextRequest) {
  const c = await getSignedIn(req);
  if (!c) return NextResponse.json({ error: "Please sign in." }, { status: 401, headers: NO_STORE });
  const body = await req.json().catch(() => null);
  const code = cleanCode(body?.code);
  if (!code) return NextResponse.json({ error: "Enter the 6-digit code from the email." }, { status: 400, headers: NO_STORE });
  try {
    const { data, error } = await serviceClient().rpc("step_up_verify_code", {
      p_user: c.sub,
      p_session: c.session_id,
      p_code_hash: await hashCode(pepper(), c.sub, c.session_id, code),
    });
    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: "That code is wrong or has expired. Check the latest email, or ask for a new code." },
        { status: 400, headers: NO_STORE },
      );
    }
    return NextResponse.json({ until: data }, { headers: NO_STORE });
  } catch (e) {
    console.error("step-up verify failed", e instanceof Error ? e.message : "unknown");
    return NextResponse.json({ error: "We could not check the code. Please try again." }, { status: 500, headers: NO_STORE });
  }
}
