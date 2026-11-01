// Team access (JSB, 1 Nov 2026, #224 steps 1 and 2, brought forward for launch).
// Three staff roles in profiles.role. Customers have no staff role and get nothing here.
//   founder: everything (JSB).
//   filer:   order queue, order details and filing sheet, filing and QA statuses, deliver and
//            check the finished document (every download is logged). No quotes, payments or refunds.
//   support: order queue (reference, service, status) and help chat questions. No order details,
//            uploads or documents.
// Rule kept: nobody, including the Founder, has standing access to customer files; every
// document download is logged with the person's role.
import { supabaseAdmin } from "./verifyFounder.js";

export const ROLE_PERMISSIONS = {
  founder: ["queue", "order", "order_status", "quote", "filing", "deliver", "download", "payments", "express", "access_log", "enquiries"],
  filer: ["queue", "order", "order_status", "filing", "deliver", "download", "access_log"],
  support: ["queue", "enquiries"],
};

/** Statuses a filer may set (work in progress after payment). */
export const FILER_STATUSES = ["sent_to_partner", "in_processing", "qa_review", "ready_for_delivery", "delivered", "name_rejected"];

export function can(role, permission) {
  return (ROLE_PERMISSIONS[role] || []).includes(permission);
}

/** The signed-in staff member and role if they hold `permission`, else null. */
export async function verifyStaff(req, permission) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role;
  if (!can(role, permission)) return null;
  return { user, role };
}
