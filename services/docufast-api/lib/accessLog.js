// Document access log (#153). Call before releasing any client document. If the entry cannot
// be written, the caller must refuse access: no log, no document (fail closed).
import { supabaseAdmin } from "./verifyFounder.js";
// The first X-Forwarded-For entry is set by the caller and can be faked; clientIp reads the
// entry our own proxy wrote.
import { clientIp } from "./clientIp.js";

export async function logDocumentAccess(req, { documentId, orderId, ownerUserId, actorUserId, actorRole, action, channel }) {
  const userAgent = typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"].slice(0, 300) : null;
  const { error } = await supabaseAdmin.from("document_access_log").insert({
    document_id: documentId || null,
    order_id: orderId || null,
    owner_user_id: ownerUserId || null,
    actor_user_id: actorUserId || null,
    actor_role: actorRole,
    action,
    channel,
    ip: clientIp(req),
    user_agent: userAgent,
  });
  if (error) {
    console.error("Access log write failed:", error.message);
    return false;
  }
  return true;
}
