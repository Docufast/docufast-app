import { isStaff } from "@/lib/staffRoles";
import { deliveryStats } from "@/lib/deliveryTarget";
import { tokenAal } from "../../../../lib/tokenAal";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Admin data is never prepared at build time.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// Created per request, not when the file loads: a missing key must never be able to fail the build.
function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    global: { fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }) },
  });
}

const TERMINAL_STATUSES = ["delivered", "cancelled"];

export async function GET(request: Request) {
  const supabaseAdmin = adminClient();
  // Verify the caller is a signed-in founder before returning anything.
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!isStaff(profile?.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  if (tokenAal(token) !== "aal2") {
    return NextResponse.json({ error: "Two-factor sign-in required. Set it up at /account/security/2fa, then sign in again." }, { status: 403 });
  }

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, service_category, order_type, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const ordersThisMonth = orders.filter(
    (o) => new Date(o.created_at) >= startOfMonth
  ).length;

  const statusBreakdown: Record<string, number> = {};
  for (const o of orders) {
    statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
  }

  // Orders waiting for a person's quote come first, so none drop off the list (#227).
  const liveQueue = orders
    .filter((o) => !TERMINAL_STATUSES.includes(o.status))
    .sort((a, b) => Number(b.status === "quote_pending") - Number(a.status === "quote_pending"))
    .slice(0, 20);

  // Affidavit delivery against the promise (#166): orders delivered in the last 30 days.
  const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: delivered } = await supabaseAdmin
    .from("orders")
    .select("id, speed, delivered_at, express_due_at")
    .eq("service_category", "affidavit")
    .gte("delivered_at", since);
  const ids = (delivered || []).map((o) => o.id);
  const { data: pays } = ids.length
    ? await supabaseAdmin.from("payments").select("order_id, paid_at").in("order_id", ids).not("paid_at", "is", null)
    : { data: [] as { order_id: string; paid_at: string }[] };
  const firstPaid = new Map<string, string>();
  for (const p of pays || []) {
    const prev = firstPaid.get(p.order_id);
    if (!prev || p.paid_at < prev) firstPaid.set(p.order_id, p.paid_at);
  }
  const delivery = deliveryStats((delivered || []).map((o) => ({ ...o, paid_at: firstPaid.get(o.id) ?? null })));

  return NextResponse.json({
    delivery,
    totalOrders: orders.length,
    ordersThisMonth,
    statusBreakdown,
    liveQueue,
  });
}