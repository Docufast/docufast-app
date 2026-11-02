// Retention for quotes and unpaid orders (#213; ROPA row 27, #202; JSB, 28 Oct 2026).
// A quote or order that was never paid is deleted 6 months after it was created, with the files the
// customer uploaded for it. Kept on purpose:
//   - any order with a payment record (paid, failed or refunded): payment records are financial
//     records and follow the financial retention period, not this one (Sheriff to confirm, #202);
//   - any order with a LagosCoMiS filing record;
//   - the access log and share records, which keep only the order id (Playbook 10.1: logs are kept).
// Off until RETENTION_SWEEP=on (turn on after a dry run on staging; RETENTION_SWEEP=dry logs what
// would be deleted and deletes nothing).
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET } from "../lib/r2Client.js";
import { supabaseAdmin } from "../lib/verifyFounder.js";

export const RETENTION_MONTHS = 6;
export const UNPAID_STATUSES = ["quote_pending", "quote_sent", "cancelled"];
const BATCH = 200;

/** The cut-off: orders created before this are due for deletion. */
export function cutoffDate(now = new Date(), months = RETENTION_MONTHS) {
  const d = new Date(now.getTime());
  d.setUTCMonth(d.getUTCMonth() - months);
  return d;
}

/** Storage keys the customer uploaded for an order (form fields ending in _r2_key). */
export function uploadKeysOf(formData) {
  if (!formData || typeof formData !== "object") return [];
  return Object.entries(formData)
    .filter(([k, v]) => k.endsWith("_r2_key") && typeof v === "string" && v.length > 0 && !v.includes(".."))
    .map(([, v]) => v);
}

/** Pure choice of what to delete, so it can be tested without a database. */
export function chooseStale(orders, { paidOrderIds = new Set(), filedOrderIds = new Set(), now = new Date() } = {}) {
  const cutoff = cutoffDate(now).getTime();
  return orders.filter(
    (o) =>
      UNPAID_STATUSES.includes(o.status) &&
      new Date(o.created_at).getTime() < cutoff &&
      !paidOrderIds.has(o.id) &&
      !filedOrderIds.has(o.id)
  );
}

/**
 * Deletes stale unpaid orders. `deps` lets tests pass a fake database and storage.
 * Files go first; the order row is deleted only when all its files are gone, so nothing is
 * left behind without a record pointing to it. A failure is retried on the next sweep.
 */
export async function sweepStaleOrders({ mode = process.env.RETENTION_SWEEP, now = new Date(), db = supabaseAdmin, storage = r2Client, bucket = R2_BUCKET, log = console } = {}) {
  if (mode !== "on" && mode !== "dry") return { skipped: true };
  const cutoff = cutoffDate(now).toISOString();

  const { data: candidates, error } = await db
    .from("orders")
    .select("id, status, created_at, form_data")
    .in("status", UNPAID_STATUSES)
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true })
    .limit(BATCH);
  if (error) throw new Error(`retention: could not list orders: ${error.message}`);
  if (!candidates?.length) return { deleted: 0, kept: 0 };

  const ids = candidates.map((o) => o.id);
  const { data: pays, error: payErr } = await db.from("payments").select("order_id").in("order_id", ids);
  if (payErr) throw new Error(`retention: could not check payments: ${payErr.message}`);
  const { data: filings, error: filErr } = await db.from("affidavit_filings").select("order_id").in("order_id", ids);
  if (filErr) throw new Error(`retention: could not check filings: ${filErr.message}`);

  const stale = chooseStale(candidates, {
    paidOrderIds: new Set((pays || []).map((p) => p.order_id)),
    filedOrderIds: new Set((filings || []).map((f) => f.order_id)),
    now,
  });

  let deleted = 0;
  for (const order of stale) {
    const keys = uploadKeysOf(order.form_data);
    if (mode === "dry") {
      log.log(`retention (dry run): would delete order ${order.id} and ${keys.length} file(s)`);
      continue;
    }
    try {
      for (const key of keys) await storage.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      const { error: delErr } = await db.from("orders").delete().eq("id", order.id).in("status", UNPAID_STATUSES);
      if (delErr) throw new Error(delErr.message);
      deleted += 1;
    } catch (err) {
      log.error(`retention: could not delete order ${order.id}: ${err.message}`);
    }
  }
  return { deleted, kept: candidates.length - stale.length, dryRun: mode === "dry" ? stale.length : 0 };
}
