import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { tokenAal } from "../../../../lib/tokenAal";

// Help chat questions for the admin dashboard (JSB, 27 Oct 2026). Founder only, checked here
// on the server; the dashboard's own check is not what protects the data.
// Security review 31 Oct 2026 (#219): database errors are logged on the server and never sent
// to the browser, and the id is checked before it reaches the database.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  // Founder and Support answer customer questions (#224).
  if (profile?.role !== "founder" && profile?.role !== "support") return { error: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  if (tokenAal(token) !== "aal2") return { error: NextResponse.json({ error: "Two-factor sign-in required. Set it up at /account/security/2fa, then sign in again." }, { status: 403 }) };

  return { supabaseAdmin, user };
}

export async function GET(request: Request) {
  const auth = await requireFounder(request);
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.supabaseAdmin
    .from("enquiries")
    .select("id, name, email, phone, question, page, status, created_at, answered_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("admin enquiries list failed", error.message);
    return NextResponse.json({ error: "Could not load questions." }, { status: 500 });
  }
  return NextResponse.json({ enquiries: data }, { headers: { "Cache-Control": "no-store" } });
}

// Mark a question answered once someone has replied.
export async function PATCH(request: Request) {
  const auth = await requireFounder(request);
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!UUID.test(id)) return NextResponse.json({ error: "Missing or invalid id." }, { status: 400 });

  const { error } = await auth.supabaseAdmin
    .from("enquiries")
    .update({ status: "answered", answered_at: new Date().toISOString(), answered_by: auth.user.id })
    .eq("id", id);

  if (error) {
    console.error("admin enquiries update failed", error.message);
    return NextResponse.json({ error: "Could not update this question." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
