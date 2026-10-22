// Express affidavits: the deadline and the late refund (Terms section 7).
//
// "If you paid for Express and the same-day time is missed for any reason other than a delay
// on your side (for example, an identification video we asked for and did not receive), we
// refund the Express fee automatically."
//
// - When an Express order is paid, the deadline (express_due_at) and the Express fee to refund
//   if we miss it (express_fee_kobo) are fixed on the order.
// - If the deadline passes and the order was not delivered in time, the Express fee is refunded
//   through Paystack, unless staff recorded first that the delay was on the customer's side.
// - The sweep runs inside the API every 15 minutes when EXPRESS_AUTO_REFUND=on. Staff can also
//   refund (or record a customer-side delay) from the admin order page at any time.
// - Every refund is claimed with a conditional update first, so it can only be paid once, even
//   if the sweep and a member of staff act at the same moment.
import { supabaseAdmin } from "../lib/verifyFounder.js";
import { createRefund } from "../lib/paystack.js";
import { expressDueAt } from "../lib/workingDays.js";
import { sendExpressRefundEmail } from "./emailService.js";

// Express (NGN 5,000) minus Standard (NGN 4,000), from lib/seo/facts.ts (JSB, 19 Oct 2026).
// Override with EXPRESS_FEE_NAIRA if the prices change.
const DEFAULT_EXPRESS_FEE_NAIRA = 1000;
const NOT_LATE_STATUSES = ["cancelled", "refunded"];

function shortRef(id) {
  return `DF-${id.slice(0, 8).toUpperCase()}`;
}

export function expressFeeKobo() {
  const naira = Number(process.env.EXPRESS_FEE_NAIRA || DEFAULT_EXPRESS_FEE_NAIRA);
  return Number.isFinite(naira) && naira > 0 ? Math.round(naira * 100) : DEFAULT_EXPRESS_FEE_NAIRA * 100;
}

// Called once, when an order is first marked paid. Fixes the deadline and the fee.
export async function startExpressClock(orderId, paidAt, amountPaidKobo) {
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, speed, express_due_at")
    .eq("id", orderId)
    .single();
  if (!order || order.speed !== "express" || order.express_due_at) return null;

  const { dueAt } = expressDueAt(paidAt);
  const fee = Math.min(expressFeeKobo(), Number(amountPaidKobo) || 0);
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ express_due_at: dueAt.toISOString(), express_fee_kobo: fee })
    .eq("id", orderId)
    .is("express_due_at", null);
  if (error) console.error(`Express clock for ${orderId} not set:`, error.message);
  return dueAt;
}

// True when an Express order's deadline has passed without an on-time delivery.
export function isExpressLate(order, now = new Date()) {
  if (order.speed !== "express" || !order.express_due_at) return false;
  if (NOT_LATE_STATUSES.includes(order.status)) return false;
  const due = new Date(order.express_due_at);
  if (now <= due) return false;
  return !order.delivered_at || new Date(order.delivered_at) > due;
}

// Refunds the Express fee for one order. Returns { outcome, ... }.
// outcome: refunded | refund_needed | not_express | not_late | already_handled | no_payment
export async function refundExpressFee(orderId, { force = false } = {}) {
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, status, speed, delivered_at, express_due_at, express_fee_kobo, express_refund_status")
    .eq("id", orderId)
    .single();
  if (!order || order.speed !== "express" || !order.express_due_at) return { outcome: "not_express" };
  if (order.express_refund_status && order.express_refund_status !== "refund_needed") {
    return { outcome: "already_handled", status: order.express_refund_status };
  }
  // Staff may refund before the deadline (force), for example when we already know we will miss it.
  if (!force && !isExpressLate(order)) return { outcome: "not_late" };

  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("reference, amount_kobo")
    .eq("order_id", orderId)
    .eq("status", "success")
    .order("paid_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!payment) return { outcome: "no_payment" };

  const amount = Math.min(Number(order.express_fee_kobo) || 0, Number(payment.amount_kobo));
  if (amount <= 0) return { outcome: "no_payment" };

  // Claim: only one caller moves the order to "processing".
  let claim = supabaseAdmin
    .from("orders")
    .update({ express_refund_status: "processing" })
    .eq("id", orderId);
  claim = order.express_refund_status === "refund_needed"
    ? claim.eq("express_refund_status", "refund_needed")
    : claim.is("express_refund_status", null);
  const { data: claimed } = await claim.select("id");
  if (!claimed || claimed.length === 0) return { outcome: "already_handled" };

  try {
    await createRefund(payment.reference, amount);
  } catch (err) {
    console.error(`Express refund for ${shortRef(orderId)} failed:`, err.message);
    await supabaseAdmin
      .from("orders")
      .update({ express_refund_status: "refund_needed", express_refund_note: `Paystack: ${err.message}`.slice(0, 500) })
      .eq("id", orderId);
    return { outcome: "refund_needed", error: err.message };
  }

  await supabaseAdmin
    .from("orders")
    .update({
      express_refund_status: "refunded",
      express_refund_reference: payment.reference,
      express_refunded_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
  if (authUser?.user?.email) {
    await sendExpressRefundEmail(authUser.user.email, { orderRef: shortRef(orderId), amountNaira: amount / 100 });
  }
  return { outcome: "refunded", amountKobo: amount };
}

// Staff record that the delay was on the customer's side, so no Express refund is due.
// Must be done before a refund is paid; a note is required.
export async function markExpressNotDue(orderId, note) {
  const clean = String(note || "").trim().slice(0, 500);
  if (!clean) return { outcome: "note_required" };
  const { data } = await supabaseAdmin
    .from("orders")
    .update({ express_refund_status: "not_due", express_refund_note: clean })
    .eq("id", orderId)
    .eq("speed", "express")
    .is("express_refund_status", null)
    .select("id");
  return { outcome: data && data.length ? "not_due" : "already_handled" };
}

// Finds every late Express order without a refund decision and refunds it.
export async function sweepLateExpressOrders() {
  const nowIso = new Date().toISOString();
  const { data: candidates, error } = await supabaseAdmin
    .from("orders")
    .select("id, status, speed, delivered_at, express_due_at")
    .eq("speed", "express")
    .is("express_refund_status", null)
    .lt("express_due_at", nowIso)
    .limit(100);
  if (error) {
    console.error("Express sweep query failed:", error.message);
    return [];
  }
  const results = [];
  for (const order of candidates || []) {
    if (!isExpressLate(order)) continue;
    const result = await refundExpressFee(order.id);
    results.push({ orderId: order.id, ...result });
  }
  if (results.length) console.log("Express sweep:", JSON.stringify(results));
  return results;
}
