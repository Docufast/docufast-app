// GET /share/:token — opens a share link (Terms section 10). No sign-in: whoever holds the full
// link can open it until it expires or the owner cancels it. Every opening is logged first;
// if the log cannot be written, the file is not released.
import express from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET } from "../lib/r2Client.js";
import { supabaseAdmin } from "../lib/verifyFounder.js";
import { logDocumentAccess } from "../lib/accessLog.js";
import { hashShareToken, isWellFormedToken } from "../services/shareService.js";

const router = express.Router();

// Light per-IP limit. Tokens are 256-bit random, so guessing is not realistic; this only stops
// a link being hammered.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 30;
const hits = new Map();
function limited(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = (typeof forwarded === "string" && forwarded.split(",")[0].trim()) || req.socket?.remoteAddress || "?";
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    if (hits.size > 10000) hits.clear();
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

const GONE = "This link has expired or was cancelled. Ask the person who shared it for a new one.";

router.get("/:token", async (req, res) => {
  res.set("Cache-Control", "no-store");
  res.set("Referrer-Policy", "no-referrer");
  if (limited(req)) return res.status(429).json({ error: "Too many attempts. Please wait a few minutes." });
  if (!isWellFormedToken(req.params.token)) return res.status(404).json({ error: GONE });

  const tokenHash = hashShareToken(req.params.token);
  const { data: share } = await supabaseAdmin
    .from("document_shares")
    .select("id, document_id, order_id, owner_user_id, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (!share || share.revoked_at || new Date(share.expires_at) <= new Date()) {
    return res.status(410).json({ error: GONE });
  }

  const logged = await logDocumentAccess(req, {
    documentId: share.document_id,
    orderId: share.order_id,
    ownerUserId: share.owner_user_id,
    actorUserId: null,
    actorRole: "share_recipient",
    action: "download",
    channel: "share_link",
  });
  if (!logged) return res.status(503).json({ error: "Please try again in a moment." });

  // Counts the opening, and re-checks the link is still live at this instant.
  const { data: opened, error } = await supabaseAdmin.rpc("document_share_open", { p_token_hash: tokenHash });
  const row = Array.isArray(opened) ? opened[0] : opened;
  if (error || !row) return res.status(410).json({ error: GONE });

  const url = await getSignedUrl(r2Client, new GetObjectCommand({ Bucket: R2_BUCKET, Key: row.r2_key }), {
    expiresIn: 120,
  });
  res.json({ url, iv: row.encryption_iv, fileName: row.file_name, expiresAt: row.expires_at });
});

export default router;
