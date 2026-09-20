import express from "express";
import { supabaseAdmin } from "../lib/verifyFounder.js";
import { initiatePayment } from "../services/paymentService.js";

const router = express.Router();

// POST /orders/:id/initiate-payment — any signed-in user can call this,
// but only for their own order. Returns the gateway's payment URL once
// a real provider is wired into paymentService.js.
router.post("/:id/initiate-payment", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Not authenticated." });

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: "Not authenticated." });
  }

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

export default router;
