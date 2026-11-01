import express from "express";
import { supabaseAdmin } from "../lib/verifyFounder.js";
import { initiatePayment, confirmPayment } from "../services/paymentService.js";
import { instantQuote } from "../services/pricing.js";
import { sendItemizedQuoteEmail } from "../services/emailService.js";

const QUOTE_VALID_HOURS = 48; // FACTS.pricing.quoteValidHours

function serviceLabel(orderType) {
  return String(orderType).split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const router = express.Router();

const CANCELLABLE_STATUSES = ["quote_pending", "quote_sent"];

async function verifyOwner(req, res) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ error: "Not authenticated." });
    return null;
  }

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    res.status(401).json({ error: "Not authenticated." });
    return null;
  }

  return user;
}

// POST /orders/:id/auto-quote (JSB, 1 Nov 2026). Called by the order form right after the order is
// saved. Prices fixed-price orders at once from services/pricing.js (never from the browser), marks
// the quote sent and emails it. Orders a person must price stay quote_pending and get the usual
// manual quote. Safe to call twice: only a quote_pending order with no amount is changed.
router.post("/:id/auto-quote", async (req, res) => {
  const user = await verifyOwner(req, res);
  if (!user) return;
  if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) return res.status(400).json({ error: "Bad order id." });

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, status, quote_amount, service_category, order_type, speed, form_data")
    .eq("id", req.params.id)
    .single();
  if (!order) return res.status(404).json({ error: "Order not found." });
  if (order.user_id !== user.id) return res.status(403).json({ error: "Forbidden." });

  const ref = `DF-${order.id.slice(0, 8).toUpperCase()}`;
  const quote = instantQuote(order);
  if (!quote) return res.json({ auto: false, ref });
  const appUrl = (process.env.APP_URL || "https://www.docufast.ng").replace(/\/$/, "");
  const emailBase = {
    serviceLabel: serviceLabel(order.order_type),
    orderRef: ref,
    lines: quote.lines,
    total: quote.total,
    validHours: QUOTE_VALID_HOURS,
    note: quote.note,
  };

  // Estimate only: a person confirms the final quote. Email the estimate now; status unchanged.
  if (!quote.final) {
    if (order.status === "quote_pending" && !order.quote_amount && user.email && !order.form_data?.estimate_emailed) {
      const sent = await sendItemizedQuoteEmail(user.email, { ...emailBase, final: false, payUrl: `${appUrl}/orders` });
      if (sent.success) {
        await supabaseAdmin.from("orders").update({ form_data: { ...order.form_data, estimate_emailed: true } }).eq("id", order.id);
      } else console.error("estimate email failed for", ref);
    }
    return res.json({ auto: false, ref, ...quote });
  }

  if (order.status !== "quote_pending" || order.quote_amount) {
    return res.json({ auto: true, ref, ...quote, alreadyQuoted: true });
  }

  const { data: updated, error } = await supabaseAdmin
    .from("orders")
    .update({ quote_amount: quote.total, status: "quote_sent" })
    .eq("id", order.id)
    .eq("status", "quote_pending") // no double quote if two calls race
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("auto-quote update failed", error.message);
    return res.status(500).json({ error: "Could not prepare your quote. We will send it shortly." });
  }
  if (!updated) return res.json({ auto: true, ref, ...quote, alreadyQuoted: true });

  if (user.email) {
    const sent = await sendItemizedQuoteEmail(user.email, { ...emailBase, final: true, payUrl: `${appUrl}/orders/${order.id}/pay` });
    if (!sent.success) console.error("auto-quote email failed for", ref);
  }
  res.json({ auto: true, ref, ...quote, validHours: QUOTE_VALID_HOURS });
});

// POST /orders/:id/initiate-payment
router.post("/:id/initiate-payment", async (req, res) => {
  const user = await verifyOwner(req, res);
  if (!user) return;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, status, quote_amount")
    .eq("id", req.params.id)
    .single();

  if (!order) return res.status(404).json({ error: "Order not found." });
  if (order.user_id !== user.id) {
    return res.status(403).json({ error: "Forbidden." });
  }
  if (!order.quote_amount) {
    return res.status(400).json({ error: "This order has no quote yet." });
  }

  const result = await initiatePayment(order, user.email);
  if (!result.success) {
    return res.status(result.status || 500).json({ error: result.error });
  }

  res.json({ paymentUrl: result.paymentUrl, reference: result.reference });
});

// GET /orders/:id/payment-status?reference=... — the pay page calls this when the customer
// returns from Paystack. It verifies the reference with Paystack (the webhook may not have
// arrived yet) and returns the order's current status. Only the order's owner can call it.
router.get("/:id/payment-status", async (req, res) => {
  const user = await verifyOwner(req, res);
  if (!user) return;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, status")
    .eq("id", req.params.id)
    .single();
  if (!order) return res.status(404).json({ error: "Order not found." });
  if (order.user_id !== user.id) return res.status(403).json({ error: "Forbidden." });

  const reference = typeof req.query.reference === "string" ? req.query.reference : null;
  let outcome = null;
  if (reference) {
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("order_id")
      .eq("reference", reference)
      .single();
    if (!payment || payment.order_id !== order.id) {
      return res.status(404).json({ error: "Payment not found for this order." });
    }
    ({ outcome } = await confirmPayment(reference));
  }

  const { data: fresh } = await supabaseAdmin
    .from("orders")
    .select("status")
    .eq("id", order.id)
    .single();
  res.json({ status: fresh?.status || order.status, outcome });
});

// POST /orders/:id/cancel — customer can cancel their own order, only while
// it's still in a cancellable state. Runs server-side with the service
// role since client-side UPDATE on orders is intentionally locked down.
router.post("/:id/cancel", async (req, res) => {
  const user = await verifyOwner(req, res);
  if (!user) return;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, user_id, status")
    .eq("id", req.params.id)
    .single();

  if (!order) return res.status(404).json({ error: "Order not found." });
  if (order.user_id !== user.id) {
    return res.status(403).json({ error: "Forbidden." });
  }
  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    return res.status(400).json({ error: "This order can no longer be cancelled." });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ order: data });
});

export default router;
