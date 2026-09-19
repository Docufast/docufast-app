import express from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET } from "../lib/r2Client.js";
import { verifyFounder, supabaseAdmin } from "../lib/verifyFounder.js";

const router = express.Router();

// GET /admin/orders/:id — full order detail for the admin view.
router.get("/:id", async (req, res) => {
  const user = await verifyFounder(req);
  if (!user) return res.status(403).json({ error: "Forbidden." });

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error || !order) {
    return res.status(404).json({ error: "Order not found." });
  }

  const { data: documents } = await supabaseAdmin
    .from("documents")
    .select("id, file_name, status, delivered_at, created_at, file_url")
    .eq("order_id", req.params.id)
    .order("created_at", { ascending: false });

  res.json({ order, documents: documents || [] });
});

// PATCH /admin/orders/:id — update status and/or quoted price.
router.patch("/:id", async (req, res) => {
  const user = await verifyFounder(req);
  if (!user) return res.status(403).json({ error: "Forbidden." });

  const { status, quoted_price } = req.body;
  const updates = {};
  if (status !== undefined) updates.status = status;
  if (quoted_price !== undefined) updates.quoted_price = quoted_price;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Nothing to update." });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update(updates)
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ order: data });
});

// POST /admin/orders/:id/deliver — record a delivered document.
// Expects { r2_key, file_name } from a prior /upload call.
router.post("/:id/deliver", async (req, res) => {
  const user = await verifyFounder(req);
  if (!user) return res.status(403).json({ error: "Forbidden." });

  const { r2_key, file_name } = req.body;
  if (!r2_key || !file_name) {
    return res.status(400).json({ error: "r2_key and file_name are required." });
  }

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("user_id, entity_id")
    .eq("id", req.params.id)
    .single();

  if (!order) return res.status(404).json({ error: "Order not found." });

  const { data: document, error } = await supabaseAdmin
    .from("documents")
    .insert({
      order_id: req.params.id,
      user_id: order.user_id,
      entity_id: order.entity_id,
      file_url: r2_key,
      file_name,
      status: "active",
      delivered_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await supabaseAdmin
    .from("orders")
    .update({ status: "delivered" })
    .eq("id", req.params.id);

  res.json({ document });
});

// GET /admin/orders/documents/:documentId/download — generates a short-lived
// signed link to the actual file, valid for 5 minutes.
router.get("/documents/:documentId/download", async (req, res) => {
  const user = await verifyFounder(req);
  if (!user) return res.status(403).json({ error: "Forbidden." });

  const { data: document } = await supabaseAdmin
    .from("documents")
    .select("file_url, file_name")
    .eq("id", req.params.documentId)
    .single();

  if (!document) return res.status(404).json({ error: "Document not found." });

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: document.file_url,
  });

  const url = await getSignedUrl(r2Client, command, { expiresIn: 300 });
  res.json({ url, fileName: document.file_name });
});

export default router;
