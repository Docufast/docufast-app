// Affidavit prices for the order form (Docufast_Pricing_Schedule_v1, approved for the beta by JSB,
// 14 and 19 Oct 2026). Customer prices are all-inclusive and VAT-inclusive.
// KEEP IN STEP with services/docufast-api/services/pricing.js, which is what the customer is charged;
// tests/pricing.test.mjs checks the two agree.

export const AFFIDAVIT_STANDARD = 4000;
export const AFFIDAVIT_COMPLEX = 6000;
export const EXPRESS_ADD_ON = 1000;
/** Price of each certified copy after the first. null = not set yet: the quote is then prepared by a person. */
export const EXTRA_COPY_PRICE: number | null = null;

// Complex tier (JSB, 19 Oct 2026): extra checks, same court cost.
export const COMPLEX_AFFIDAVITS = new Set([
  "combined_correction_name_dob",
  "age_declaration_minor_male",
  "age_declaration_minor_female",
  "loss_sim_no_id",
  "dissolution_of_marriage",
  "declaration_of_death",
  "release_of_corpse",
]);

export interface QuoteLine { label: string; amount: number }
export interface Quote { lines: QuoteLine[]; total: number; complete: boolean }

export function affidavitQuote(slug: string, speed: "standard" | "express", copies: number): Quote {
  const complex = COMPLEX_AFFIDAVITS.has(slug);
  const lines: QuoteLine[] = [
    { label: complex ? "Affidavit (enhanced checks), court fee included" : "Affidavit, court fee included", amount: complex ? AFFIDAVIT_COMPLEX : AFFIDAVIT_STANDARD },
  ];
  if (speed === "express") lines.push({ label: "Express, same day (orders before 2 PM)", amount: EXPRESS_ADD_ON });
  const extra = Math.max(0, Math.floor(copies) - 1);
  let complete = true;
  if (extra > 0) {
    if (EXTRA_COPY_PRICE === null) complete = false;
    else lines.push({ label: `Extra certified copies (${extra})`, amount: extra * EXTRA_COPY_PRICE });
  }
  return { lines, total: lines.reduce((s, l) => s + l.amount, 0), complete };
}

export const naira = (n: number) => `NGN ${n.toLocaleString("en-US")}`;
