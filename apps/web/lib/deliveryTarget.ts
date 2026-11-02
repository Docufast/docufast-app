// Affidavit delivery target for the Founder Dashboard (#166; JSB 23 Oct 2026; Terms section 7).
//   Standard: within 2 to 3 working days of a confirmed (paid) order. On time = delivered by the end
//             of the 3rd working day after the day it was confirmed.
//   Express:  the same day when confirmed before 2 PM on a working day, else by the end of the next
//             working day. The API fixes this as orders.express_due_at when the order is paid
//             (services/docufast-api/lib/workingDays.js); this file uses that value when present.
// Working days are Monday to Friday in Lagos time (WAT, UTC+1), less public holidays. Keep the
// holiday list in step with the API's workingDays.js (a test checks they match).

export const STANDARD_WORKING_DAYS = 3;
const LAGOS_OFFSET_MS = 60 * 60 * 1000;
export const BUILT_IN_HOLIDAYS = ["2026-12-25", "2026-12-26", "2026-12-28", "2027-01-01"];

function holidaySet(extra = typeof process !== "undefined" ? process.env.PUBLIC_HOLIDAYS || "" : "") {
  const more = extra.split(",").map((d) => d.trim()).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  return new Set([...BUILT_IN_HOLIDAYS, ...more]);
}
const toWall = (d: Date) => new Date(d.getTime() + LAGOS_OFFSET_MS);
const isWorkingWall = (w: Date, h: Set<string>) => w.getUTCDay() !== 0 && w.getUTCDay() !== 6 && !h.has(w.toISOString().slice(0, 10));
const endOfWallDay = (w: Date) => new Date(Date.UTC(w.getUTCFullYear(), w.getUTCMonth(), w.getUTCDate(), 23, 59, 59, 999) - LAGOS_OFFSET_MS);

/** End of the Nth working day after the day the order was confirmed (Lagos time). */
export function standardDueAt(confirmedAt: Date | string, workingDays = STANDARD_WORKING_DAYS): Date {
  const h = holidaySet();
  const w = toWall(new Date(confirmedAt));
  let n = 0;
  while (n < workingDays) {
    w.setUTCDate(w.getUTCDate() + 1);
    if (isWorkingWall(w, h)) n += 1;
  }
  return endOfWallDay(w);
}

export type DeliveredOrder = { speed?: string | null; paid_at?: string | null; delivered_at?: string | null; express_due_at?: string | null };

/** Whether a delivered order met its promise; null when it cannot be judged (no payment time). */
export function onTime(o: DeliveredOrder): boolean | null {
  if (!o.delivered_at) return null;
  const delivered = new Date(o.delivered_at).getTime();
  if (o.speed === "express" && o.express_due_at) return delivered <= new Date(o.express_due_at).getTime();
  if (!o.paid_at) return null;
  return delivered <= standardDueAt(o.paid_at).getTime();
}

/** On-time share for the dashboard. Target is 100%: every late order is a broken promise. */
export function deliveryStats(orders: DeliveredOrder[]) {
  let judged = 0, met = 0, expressLate = 0, standardLate = 0;
  for (const o of orders) {
    const r = onTime(o);
    if (r === null) continue;
    judged += 1;
    if (r) met += 1;
    else if (o.speed === "express") expressLate += 1;
    else standardLate += 1;
  }
  return { judged, met, expressLate, standardLate, percent: judged ? Math.round((met / judged) * 100) : null };
}
