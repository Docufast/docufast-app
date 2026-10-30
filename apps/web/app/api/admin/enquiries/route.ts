import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Help chat questions for the admin dashboard (JSB, 27 Oct 2026). Founder only, checked here
// on the server; the dashboard's own check is not what protects the data.

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

async function requireFounder(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return { error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };

  const supabaseAdmin = adminClient();
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return { error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }) };

  const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "founder") return { error: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };

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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ enquiries: data });
}

// Mark a question answered once someone has replied.
export async function PATCH(request: Request) {
  const auth = await requireFounder(request);
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const { error } = await auth.supabaseAdmin
    .from("enquiries")
    .update({ status: "answered", answered_at: new Date().toISOString(), answered_by: auth.user.id })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
