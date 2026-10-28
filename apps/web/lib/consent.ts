// Consent wording versions and the 18+ rule, shared by the sign-up page and /api/account/consents
// (#75, #199; Playbook 10.1). If you change any wording a customer sees, bump its version here so
// every consent record says exactly what the person agreed to.

export const WORDING_VERSIONS = {
  // Terms of Service and Privacy Notice, final text of 21 Oct 2026.
  terms_privacy: "terms-privacy-2026-10-21",
  // Marketing checkbox and helper line approved by Sheriff, 21 Oct 2026 (NDPA 2023).
  marketing: "signup-marketing-2026-10-21",
  // "I am 18 or over" confirmation at sign-up, 28 Oct 2026.
  age_18_plus: "signup-age-18-2026-10-28",
} as const;

export const MINIMUM_AGE = 18;

/** Today's date in Lagos as YYYY-MM-DD, so a birthday counts from local midnight. */
export function lagosToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Parses a strict YYYY-MM-DD date. Returns null for anything else, including impossible dates. */
export function parseIsoDate(value: unknown): { y: number; m: number; d: number } | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const check = new Date(Date.UTC(y, m - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return null;
  return { y, m, d };
}

/** Age in whole years on `today` (YYYY-MM-DD). Someone born on 29 Feb turns a year older on 1 Mar. */
export function ageOn(dateOfBirth: string, today: string): number | null {
  const dob = parseIsoDate(dateOfBirth);
  const now = parseIsoDate(today);
  if (!dob || !now) return null;
  let age = now.y - dob.y;
  if (now.m < dob.m || (now.m === dob.m && now.d < dob.d)) age -= 1;
  return age;
}

export type AgeCheck =
  | { ok: true; age: number }
  | { ok: false; reason: "invalid" | "future" | "too_old" | "under_18" };

/** The 18+ rule used on both the page and the server. */
export function checkAdult(dateOfBirth: string, today: string = lagosToday()): AgeCheck {
  const age = ageOn(dateOfBirth, today);
  if (age === null) return { ok: false, reason: "invalid" };
  if (dateOfBirth > today) return { ok: false, reason: "future" };
  if (age > 120) return { ok: false, reason: "too_old" };
  if (age < MINIMUM_AGE) return { ok: false, reason: "under_18" };
  return { ok: true, age };
}

export const AGE_MESSAGES: Record<Exclude<AgeCheck, { ok: true }>["reason"], string> = {
  invalid: "Please enter your date of birth.",
  future: "Please check your date of birth.",
  too_old: "Please check your date of birth.",
  under_18:
    "You need to be 18 or over to open a Docufast account. A parent or guardian can order services for a child from their own account.",
};
