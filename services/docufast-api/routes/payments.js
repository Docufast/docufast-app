import express from "express";
import { supabaseAdmin } from "../lib/verifyFounder.js";
import { initiatePayment, confirmPayment } from "../services/paymentService.js";

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
