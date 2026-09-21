import express from "express";
import { supabaseAdmin } from "../lib/verifyFounder.js";
import { initiatePayment } from "../services/paymentService.js";

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
    .select("id, user_id, quote_amount")
    .eq("id", req.params.id)
    .single();

  if (!order) return res.status(404).json({ error: "Order not found." });
  if (order.user_id !== user.id) {
    return res.status(403).json({ error: "Forbidden." });
  }
  if (!order.quote_amount) {
    return res.status(400).json({ error: "This order has no quote yet." });
  }

  const result = await initiatePayment(order);
  if (!result.success) {
    return res.status(501).json({ error: result.error });
  }

  res.json(result);
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
