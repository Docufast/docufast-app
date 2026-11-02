import express from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET } from "../lib/r2Client.js";
import { supabaseAdmin } from "../lib/verifyFounder.js";
import { logDocumentAccess } from "../lib/accessLog.js";
import { SHARE_DAY_CHOICES, newShareToken, hashShareToken, revokeShare } from "../services/shareService.js";

const router = express.Router();

const shareUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
});

async function signedInUser(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  return error || !user ? null : user;
}

// POST /documents/:id/shares — the owner creates a share link (Terms section 10).
// The body is the document already re-encrypted in the owner's browser with a new random key,
// plus its IV. The key itself never reaches us; it travels only in the link after "#".
router.post("/:id/shares", shareUpload.single("file"), async (req, res) => {
  const user = await signedInUser(req);
  if (!user) return res.status(401).json({ error: "Not authenticated." });

  const days = Number(req.body?.days);
  const iv = String(req.body?.iv || "");
  if (!SHARE_DAY_CHOICES.includes(days)) {
    return res.status(400).json({ error: `Choose how long the link lasts: ${SHARE_DAY_CHOICES.join(", ")} days.` });
  }
  if (!/^[A-Za-z0-9+/]{16}$/.test(iv)) return res.status(400).json({ error: "Invalid encryption data." });
  if (!req.file || req.file.size === 0) return res.status(400).json({ error: "No file provided." });

  const { data: document } = await supabaseAdmin
    .from("documents")
    .select("id, order_id, user_id, file_name, status")
    .eq("id", req.params.id)
    .single();
  if (!document) return res.status(404).json({ error: "Document not found." });
  if (document.user_id !== user.id) return res.status(403).json({ error: "Forbidden." });

  const logged = await logDocumentAccess(req, {
    documentId: document.id,
    orderId: document.order_id,
    ownerUserId: document.user_id,
    actorUserId: user.id,
    actorRole: "customer",
    action: "share",
    channel: "vault",
  });
  if (!logged) return res.status(503).json({ error: "Please try again in a moment." });

  const r2Key = `shares/${randomUUID()}`;
  try {
    await r2Client.send(
      new PutObjectCommand({ Bucket: R2_BUCKET, Key: r2Key, Body: req.file.buffer, ContentType: "application/octet-stream" })
    );
  } catch (err) {
    console.error("Share upload failed:", err.message);
    return res.status(500).json({ error: "We could not create the link. Please try again." });
  }

  const token = newShareToken();
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const { data: share, error } = await supabaseAdmin
    .from("document_shares")
    .insert({
      token_hash: hashShareToken(token),
      document_id: document.id,
      order_id: document.order_id,
      owner_user_id: user.id,
      r2_key: r2Key,
      encryption_iv: iv,
      file_name: document.file_name,
      expires_at: expiresAt,
    })
    .select("id, expires_at")
    .single();
  if (error) {
    console.error("Share insert failed:", error.message);
    return res.status(500).json({ error: "We could not create the link. Please try again." });
  }

  // The token is returned once and never stored in readable form.
  res.status(201).json({ shareId: share.id, token, expiresAt: share.expires_at });
});

// DELETE /documents/shares/:shareId — the owner cancels a link. It stops working at once.
router.delete("/shares/:shareId", async (req, res) => {
  const user = await signedInUser(req);
  if (!user) return res.status(401).json({ error: "Not authenticated." });
  const ok = await revokeShare(req.params.shareId, user.id);
  if (!ok) return res.status(404).json({ error: "Link not found or already cancelled." });
  res.json({ cancelled: true });
});

// GET /documents/:id/download — any signed-in user can download a document,
// but only if it's actually theirs. Returns a short-lived signed link plus
// the encryption metadata needed to decrypt it client-side.
router.get("/:id/download", async (req, res) => {
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

  const { data: document } = await supabaseAdmin
    .from("documents")
    .select("id, order_id, file_url, file_name, user_id, encryption_iv, sender_ephemeral_public_key")
    .eq("id", req.params.id)
    .single();

  if (!document) return res.status(404).json({ error: "Document not found." });
  if (document.user_id !== user.id) {
    return res.status(403).json({ error: "Forbidden." });
  }

  const logged = await logDocumentAccess(req, {
    documentId: document.id,
    orderId: document.order_id,
    ownerUserId: document.user_id,
    actorUserId: user.id,
    actorRole: "customer",
    action: "download",
    channel: "vault",
  });
  if (!logged) return res.status(503).json({ error: "Please try again in a moment." });

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: document.file_url,
  });

  const url = await getSignedUrl(r2Client, command, { expiresIn: 300 });
  res.json({
    url,
    fileName: document.file_name,
    encryptionIv: document.encryption_iv,
    senderEphemeralPublicKey: document.sender_ephemeral_public_key,
  });
});

export default router;
