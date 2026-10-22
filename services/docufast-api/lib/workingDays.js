// Working days and the Express deadline, in Lagos time (WAT, UTC+1, no daylight saving).
//
// Terms section 7: "Express affidavits are delivered the same day when the order is confirmed
// before 2 PM on a working day."
//
// Working day = Monday to Friday, not a Nigerian public holiday. Courts do not sit at weekends.
// Keep PUBLIC_HOLIDAYS up to date: the Federal Government declares some dates (Eid, Maulud)
// only days before. Add them here as soon as they are announced; extra dates can also be set
// without a code change in the PUBLIC_HOLIDAYS env var, as comma-separated YYYY-MM-DD.

const LAGOS_OFFSET_MS = 60 * 60 * 1000;
export const EXPRESS_CUTOFF_HOUR = 14;

const BUILT_IN_HOLIDAYS = [
  "2026-12-25", // Christmas Day
  "2026-12-26", // Boxing Day (Saturday)
  "2026-12-28", // Boxing Day holiday (Monday)
  "2027-01-01", // New Year's Day
];

function holidaySet() {
  const extra = (process.env.PUBLIC_HOLIDAYS || "")
    .split(",")
    .map((d) => d.trim())
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  return new Set([...BUILT_IN_HOLIDAYS, ...extra]);
}

// A Date whose UTC fields read as Lagos wall-clock time.
function toLagosWall(date) {
  return new Date(date.getTime() + LAGOS_OFFSET_MS);
}

function wallDateKey(wall) {
  return wall.toISOString().slice(0, 10);
}

export function isWorkingDayWall(wall, holidays = holidaySet()) {
  const dow = wall.getUTCDay(); // 0 Sunday .. 6 Saturday
  if (dow === 0 || dow === 6) return false;
  return !holidays.has(wallDateKey(wall));
}

// End of a Lagos day (23:59:59.999 WAT) as a real UTC instant.
function endOfLagosDay(wall) {
  const end = Date.UTC(wall.getUTCFullYear(), wall.getUTCMonth(), wall.getUTCDate(), 23, 59, 59, 999);
  return new Date(end - LAGOS_OFFSET_MS);
}

// When an Express order must be delivered, given when payment was confirmed.
// - Confirmed before 2 PM on a working day: by the end of that day.
// - Otherwise: by the end of the next working day. The Terms only promise same-day for orders
//   confirmed before 2 PM; this is the fair reading for later orders. [CONFIRM with Sheriff.]
export function expressDueAt(confirmedAt) {
  const holidays = holidaySet();
  const wall = toLagosWall(new Date(confirmedAt));
  const sameDay = isWorkingDayWall(wall, holidays) && wall.getUTCHours() < EXPRESS_CUTOFF_HOUR;
  if (sameDay) return { dueAt: endOfLagosDay(wall), sameDay: true };

  const next = new Date(wall);
  do {
    next.setUTCDate(next.getUTCDate() + 1);
  } while (!isWorkingDayWall(next, holidays));
  return { dueAt: endOfLagosDay(next), sameDay: false };
}
