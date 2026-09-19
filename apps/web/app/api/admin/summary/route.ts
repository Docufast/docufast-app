import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TERMINAL_STATUSES = ["delivered", "cancelled"];

export async function GET(request: Request) {
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

  if (profile?.role !== "founder") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
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

  const liveQueue = orders
    .filter((o) => !TERMINAL_STATUSES.includes(o.status))
    .slice(0, 10);

  return NextResponse.json({
    totalOrders: orders.length,
    ordersThisMonth,
    statusBreakdown,
    liveQueue,
  });
}