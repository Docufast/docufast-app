// Payments through Paystack (#109). Customers pay only on docufast.ng: we start a Paystack
// hosted checkout from the order's pay page, and an order is marked paid only after the
// server has verified the transaction with Paystack (from the webhook or the return page).
//
// Rules this file enforces:
// - The amount charged is always taken from the order's quote on the server, never the browser.
// - An order moves to "paid" once only, and only from "quote_sent".
// - A second successful payment for an already-paid order is refunded automatically
//   (FAQ and Terms: "if you are charged twice, the extra payment is refunded automatically").
// - Every attempt is recorded in public.payments with a unique reference.
import crypto from "node:crypto";
import { supabaseAdmin } from "../lib/verifyFounder.js";
import { initializeTransaction, verifyTransaction, createRefund } from "../lib/paystack.js";
import { sendPaymentReceiptEmail } from "./emailService.js";

const PAYABLE_STATUS = "quote_sent";

function shortRef(id) {
  return `DF-${id.slice(0, 8).toUpperCase()}`;
}

function newReference(orderId) {
  return `${shortRef(orderId)}-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
}

function webAppUrl() {
  return (process.env.WEB_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

export async function initiatePayment(order, customerEmail) {
  if (order.status !== PAYABLE_STATUS) {
    return { success: false, status: 409, error: "This order is not waiting for payment." };
  }
  const amountNaira = Number(order.quote_amount);
  if (!Number.isFinite(amountNaira) || amountNaira <= 0) {
    return { success: false, status: 400, error: "This order has no valid quote yet." };
  }
  if (!customerEmail) {
    return { success: false, status: 400, error: "Your account needs an email address to pay." };
  }

  const amountKobo = Math.round(amountNaira * 100);
  const reference = newReference(order.id);

  const { error: insertError } = await supabaseAdmin.from("payments").insert({
    order_id: order.id,
    user_id: order.user_id,
    provider: "paystack",
    reference,
    amount_kobo: amountKobo,
    currency: "NGN",
    status: "initialized",
  });
  if (insertError) {
    console.error("payments insert failed:", insertError.message);
    return { success: false, status: 500, error: "We could not start your payment. Please try again." };
  }

  try {
    const data = await initializeTransaction({
      email: customerEmail,
      amountKobo,
      reference,
      callbackUrl: `${webAppUrl()}/orders/${order.id}/pay?reference=${encodeURIComponent(reference)}`,
      metadata: { order_id: order.id, order_ref: shortRef(order.id) },
    });
    return { success: true, paymentUrl: data.authorization_url, reference };
  } catch (err) {
    console.error("Paystack initialize failed:", err.message);
    await supabaseAdmin.from("payments").update({ status: "failed" }).eq("reference", reference);
    return { success: false, status: 502, error: "The payment service is not responding. Please try again shortly." };
  }
}

// Verifies a reference with Paystack and settles it. Safe to call many times for the same
// reference (webhook retries, the return page, staff re-checks): the database updates are
// conditional, so an order is marked paid once and a receipt is sent once.
export async function confirmPayment(reference) {
  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("id, order_id, user_id, amount_kobo, currency, status")
    .eq("reference", reference)
    .single();
  if (!payment) return { outcome: "unknown_reference" };
  if (["success", "duplicate_refunded", "duplicate_refund_needed", "amount_mismatch"].includes(payment.status)) {
    return { outcome: payment.status, orderId: payment.order_id };
  }

  let tx;
  try {
    tx = await verifyTransaction(reference);
  } catch (err) {
    console.error("Paystack verify failed:", err.message);
    return { outcome: "verify_failed", orderId: payment.order_id };
  }

  if (tx.status !== "success") {
    if (["failed", "abandoned", "reversed"].includes(tx.status)) {
      await supabaseAdmin.from("payments").update({ status: "failed" }).eq("id", payment.id).neq("status", "success");
    }
    return { outcome: tx.status || "pending", orderId: payment.order_id };
  }

  const verified = {
    paystack_transaction_id: tx.id,
    channel: tx.channel || null,
    paid_at: tx.paid_at || new Date().toISOString(),
  };

  if (tx.currency !== "NGN" || Number(tx.amount) !== Number(payment.amount_kobo)) {
    await supabaseAdmin.from("payments").update({ ...verified, status: "amount_mismatch" }).eq("id", payment.id);
    console.error(`Payment ${reference}: amount or currency does not match the quote. Not marking the order paid.`);
    return { outcome: "amount_mismatch", orderId: payment.order_id };
  }

  // Claim this payment as successful (only one caller wins).
  const { data: claimed } = await supabaseAdmin
    .from("payments")
    .update({ ...verified, status: "success" })
    .eq("id", payment.id)
    .neq("status", "success")
    .select("id");
  if (!claimed || claimed.length === 0) return { outcome: "success", orderId: payment.order_id };

  // Move the order to paid, only if it is still waiting for payment.
  const { data: paidOrder } = await supabaseAdmin
    .from("orders")
    .update({ status: "paid" })
    .eq("id", payment.order_id)
    .eq("status", PAYABLE_STATUS)
    .select("id, user_id, order_type, quote_amount")
    .maybeSingle();

  if (!paidOrder) {
    // The order was already paid (or cancelled): this is an extra payment. Refund it.
    try {
      await createRefund(reference);
      await supabaseAdmin.from("payments").update({ status: "duplicate_refunded" }).eq("id", payment.id);
      return { outcome: "duplicate_refunded", orderId: payment.order_id };
    } catch (err) {
      console.error(`Refund for duplicate payment ${reference} failed:`, err.message);
      await supabaseAdmin.from("payments").update({ status: "duplicate_refund_needed" }).eq("id", payment.id);
      return { outcome: "duplicate_refund_needed", orderId: payment.order_id };
    }
  }

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(paidOrder.user_id);
  if (authUser?.user?.email) {
    await sendPaymentReceiptEmail(authUser.user.email, {
      orderRef: shortRef(paidOrder.id),
      orderType: paidOrder.order_type,
      amountNaira: Number(payment.amount_kobo) / 100,
      reference,
      paidAt: verified.paid_at,
    });
  }
  return { outcome: "paid", orderId: paidOrder.id };
}
