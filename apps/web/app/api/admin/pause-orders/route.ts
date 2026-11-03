import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { tokenAal } from "../../../../lib/tokenAal";

// Pause-orders switch. Founder only, checked here on the server, and the second step (aal2)
// is required. The database refuses new customer orders while the flag is on (migration
// 20261103_pause_orders.sql), so this route only flips the flag and the message.

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

async function requireFounder(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return { error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };

  const supabaseAdmin = adminClient();
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return { error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };

  const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "founder") return { error: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  if (tokenAal(token) !== "aal2") return { error: NextResponse.json({ error: "Two-factor sign-in required." }, { status: 403 }) };

  return { supabaseAdmin, user };
}

export async function GET(request: Request) {
  const auth = await requireFounder(request);
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabaseAdmin
    .from("site_flags")
    .select("value, message, updated_at")
    .eq("key", "orders_paused")
    .single();

  if (error) {
    console.error("pause-orders read failed", error.message);
    return NextResponse.json({ error: "Could not read the switch." }, { status: 500 });
  }
  return NextResponse.json(
    { paused: data.value === true, message: data.message ?? "", updatedAt: data.updated_at },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  const auth = await requireFounder(request);
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => ({}));
  if (typeof body.paused !== "boolean") {
    return NextResponse.json({ error: "paused must be true or false." }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 300) : "";

  const { error } = await auth.supabaseAdmin
    .from("site_flags")
    .update({
      value: body.paused,
      message: message || null,
      updated_at: new Date().toISOString(),
      updated_by: auth.user.id,
    })
    .eq("key", "orders_paused");

  if (error) {
    console.error("pause-orders update failed", error.message);
    return NextResponse.json({ error: "Could not change the switch." }, { status: 500 });
  }
  console.log("pause-orders set to", body.paused, "by", auth.user.id);
  return NextResponse.json({ ok: true, paused: body.paused }, { headers: { "Cache-Control": "no-store" } });
}
