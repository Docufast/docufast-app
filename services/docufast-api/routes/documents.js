import express from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET } from "../lib/r2Client.js";
import { supabaseAdmin } from "../lib/verifyFounder.js";

const router = express.Router();

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
    .select("file_url, file_name, user_id, encryption_iv, sender_ephemeral_public_key")
    .eq("id", req.params.id)
    .single();

  if (!document) return res.status(404).json({ error: "Document not found." });
  if (document.user_id !== user.id) {
    return res.status(403).json({ error: "Forbidden." });
  }

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
