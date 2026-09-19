import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-only route. Uses the service role key (never exposed to the
// browser) so the Founder Dashboard can see orders across ALL users,
// bypassing the per-user Row Level Security that the rest of the app uses.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TERMINAL_STATUSES = ["delivered", "cancelled"];

export async function GET() {
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
