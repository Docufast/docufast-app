// Share links (Terms section 10). See supabase/migrations/20261024_document_shares.sql for how a
// share stays zero-knowledge: the key to the shared copy lives only in the link after "#".
import crypto from "node:crypto";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET } from "../lib/r2Client.js";
import { supabaseAdmin } from "../lib/verifyFounder.js";

export const SHARE_DAY_CHOICES = [1, 7, 30];

export function newShareToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashShareToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export function isWellFormedToken(token) {
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);
}

async function deleteCopy(share) {
  try {
    await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: share.r2_key }));
    await supabaseAdmin
      .from("document_shares")
      .update({ copy_deleted_at: new Date().toISOString() })
      .eq("id", share.id)
      .is("copy_deleted_at", null);
    return true;
  } catch (err) {
    console.error(`Could not delete shared copy ${share.id}:`, err.message);
    return false; // the sweep tries again later
  }
}

// Cancels a share. The link stops working at once; the encrypted copy is deleted.
export async function revokeShare(shareId, ownerUserId) {
  const { data } = await supabaseAdmin
    .from("document_shares")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", shareId)
    .eq("owner_user_id", ownerUserId)
    .is("revoked_at", null)
    .select("id, r2_key")
    .maybeSingle();
  if (!data) return false;
  await deleteCopy(data);
  return true;
}

// Deletes the encrypted copies of shares that have expired or were cancelled.
export async function sweepExpiredShares() {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from("document_shares")
    .select("id, r2_key")
    .is("copy_deleted_at", null)
    .or(`expires_at.lt.${nowIso},revoked_at.not.is.null`)
    .limit(200);
  if (error) {
    console.error("Share sweep query failed:", error.message);
    return 0;
  }
  let deleted = 0;
  for (const share of data || []) if (await deleteCopy(share)) deleted += 1;
  return deleted;
}
