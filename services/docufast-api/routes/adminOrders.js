import express from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET } from "../lib/r2Client.js";
import { verifyFounder, supabaseAdmin } from "../lib/verifyFounder.js";
import { sendQuoteEmail } from "../services/emailService.js";

const router = express.Router();

function orderTypeLabel(orderType) {
  return orderType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function shortRef(id) {
  return `DF-${id.slice(0, 8).toUpperCase()}`;
}

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

  // The customer's vault public key, needed to encrypt any document we
  // deliver to them. May be null for accounts created before vault
  // encryption existed.
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("vault_public_key")
    .eq("id", order.user_id)
    .single();

  res.json({
    order,
    documents: documents || [],
    recipientPublicKey: profile?.vault_public_key || null,
  });
});

router.patch("/:id", async (req, res) => {
  const user = await verifyFounder(req);
  if (!user) return res.status(403).json({ error: "Forbidden." });

  const { status, quote_amount } = req.body;
  const updates = {};
  if (status !== undefined) updates.status = status;
  if (quote_amount !== undefined) updates.quote_amount = quote_amount;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Nothing to update." });
  }

  const { data: existingOrder } = await supabaseAdmin
    .from("orders")
    .select("status, user_id, order_type, quote_amount")
    .eq("id", req.params.id)
    .single();

  const { data, error } = await supabaseAdmin
    .from("orders")
    .update(updates)
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const isNewlyQuoteSent =
    status === "quote_sent" && existingOrder?.status !== "quote_sent";
  const amountToEmail = data.quote_amount;

  if (isNewlyQuoteSent && amountToEmail) {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
      existingOrder.user_id
    );
    if (authUser?.user?.email) {
      await sendQuoteEmail(
        authUser.user.email,
        orderTypeLabel(existingOrder.order_type),
        amountToEmail,
        shortRef(req.params.id)
      );
    }
  }

  res.json({ order: data });
});

// POST /admin/orders/:id/deliver — records a delivered document. The
// file itself has already been encrypted in the ADMIN's browser for the
// specific customer before this is called; encryption_iv and
// sender_ephemeral_public_key are needed for the customer to decrypt it.
router.post("/:id/deliver", async (req, res) => {
  const user = await verifyFounder(req);
  if (!user) return res.status(403).json({ error: "Forbidden." });

  const { r2_key, file_name, encryption_iv, sender_ephemeral_public_key } = req.body;
  if (!r2_key || !file_name || !encryption_iv || !sender_ephemeral_public_key) {
    return res.status(400).json({
      error: "r2_key, file_name, encryption_iv, and sender_ephemeral_public_key are required.",
    });
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
      encryption_iv,
      sender_ephemeral_public_key,
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
