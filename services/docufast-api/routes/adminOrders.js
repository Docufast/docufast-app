import express from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET } from "../lib/r2Client.js";
import { verifyFounder, supabaseAdmin } from "../lib/verifyFounder.js";
import { sendQuoteEmail } from "../services/emailService.js";
import { logDocumentAccess } from "../lib/accessLog.js";

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

  await logDocumentAccess(req, {
    documentId: document.id,
    orderId: req.params.id,
    ownerUserId: order.user_id,
    actorUserId: user.id,
    actorRole: "founder",
    action: "deliver",
    channel: "admin_panel",
  });

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
    .select("id, order_id, user_id, file_url, file_name")
    .eq("id", req.params.documentId)
    .single();

  if (!document) return res.status(404).json({ error: "Document not found." });

  // No exemptions: the Founder's own downloads are logged too (#153).
  const logged = await logDocumentAccess(req, {
    documentId: document.id,
    orderId: document.order_id,
    ownerUserId: document.user_id,
    actorUserId: user.id,
    actorRole: "founder",
    action: "download",
    channel: "admin_panel",
  });
  if (!logged) return res.status(503).json({ error: "Please try again in a moment." });

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: document.file_url,
  });

  const url = await getSignedUrl(r2Client, command, { expiresIn: 300 });
  res.json({ url, fileName: document.file_name });
});

// GET /admin/orders/:id/filing — the staff filing record for an affidavit order (#185).
router.get("/:id/filing", async (req, res) => {
  const user = await verifyFounder(req);
  if (!user) return res.status(403).json({ error: "Forbidden." });

  const { data, error } = await supabaseAdmin
    .from("affidavit_filings")
    .select("*")
    .eq("order_id", req.params.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ filing: data });
});

// PUT /admin/orders/:id/filing — create or update the filing record. Only the listed
// fields can be set; times are ISO strings or null.
const FILING_FIELDS = ["court_route", "court_form", "court_division", "filing_id", "filed_at", "commissioned_at", "video_requested", "notes"];
router.put("/:id/filing", async (req, res) => {
  const user = await verifyFounder(req);
  if (!user) return res.status(403).json({ error: "Forbidden." });

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, service_category")
    .eq("id", req.params.id)
    .single();
  if (!order) return res.status(404).json({ error: "Order not found." });
  if (order.service_category !== "affidavit") {
    return res.status(400).json({ error: "Filing records are for affidavit orders." });
  }

  const row = { order_id: req.params.id, updated_by: user.id };
  for (const field of FILING_FIELDS) {
    if (req.body[field] === undefined) continue;
    const value = req.body[field];
    if (field === "video_requested") row[field] = value === true;
    else if (field === "filed_at" || field === "commissioned_at") {
      if (value === null || value === "") row[field] = null;
      else if (Number.isNaN(Date.parse(value))) return res.status(400).json({ error: `${field} is not a valid date and time.` });
      else row[field] = new Date(value).toISOString();
    } else row[field] = value === "" ? null : String(value).trim();
  }

  const { data, error } = await supabaseAdmin
    .from("affidavit_filings")
    .upsert(row, { onConflict: "order_id" })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ filing: data });
});

// GET /admin/orders/:id/payments — every payment attempt for this order (#109).
router.get("/:id/payments", async (req, res) => {
  const user = await verifyFounder(req);
  if (!user) return res.status(403).json({ error: "Forbidden." });

  const { data, error } = await supabaseAdmin
    .from("payments")
    .select("reference, amount_kobo, currency, status, channel, paid_at, created_at")
    .eq("order_id", req.params.id)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ payments: data });
});

// GET /admin/orders/:id/access-log — every logged access to this order's documents,
// newest first, for the Founder Dashboard (#153).
router.get("/:id/access-log", async (req, res) => {
  const user = await verifyFounder(req);
  if (!user) return res.status(403).json({ error: "Forbidden." });

  const { data, error } = await supabaseAdmin
    .from("document_access_log")
    .select("id, occurred_at, document_id, actor_user_id, actor_role, action, channel, ip")
    .eq("order_id", req.params.id)
    .order("id", { ascending: false })
    .limit(500);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ entries: data });
});

export default router;
