// Prices the customer is charged for instant affidavit quotes (JSB, 1 Nov 2026).
// Source: Docufast_Pricing_Schedule_v1 (approved for the beta, 14 and 19 Oct 2026). All-inclusive, VAT-inclusive.
// KEEP IN STEP with apps/web/lib/pricing.ts (what the form shows); apps/web/tests/pricing.test.mjs checks them.

export const AFFIDAVIT_STANDARD = 4000;
export const AFFIDAVIT_COMPLEX = 6000;
export const EXPRESS_ADD_ON = 1000;
/** Each certified copy after the first. null = not set: such orders get a quote from a person. */
export const EXTRA_COPY_PRICE = null;

export const AFFIDAVIT_SLUGS = new Set([
  "change_of_name", "correction_of_name", "confirmation_of_name", "addition_removal_of_name", "rearrangement_of_name",
  "combined_correction_name_dob", "age_declaration_adult", "age_declaration_minor_male", "age_declaration_minor_female",
  "correction_of_dob", "attestation_birth_cert", "loss_general", "loss_workplace_id", "loss_sim_card", "loss_sim_no_id",
  "loss_jamb_sim", "loss_intl_passport", "loss_drivers_licence", "loss_vehicle_docs", "bachelorhood_spinsterhood",
  "declaration_of_marriage", "dissolution_of_marriage", "declaration_of_death", "release_of_corpse", "loss_school_id",
  "confirmation_of_result", "good_conduct", "support_sponsorship", "change_car_ownership", "change_of_residence",
  "change_of_signature",
]);

export const COMPLEX_AFFIDAVITS = new Set([
  "combined_correction_name_dob", "age_declaration_minor_male", "age_declaration_minor_female", "loss_sim_no_id",
  "dissolution_of_marriage", "declaration_of_death", "release_of_corpse",
]);

/**
 * Instant quote for an order, or null when a person must price it (not an affidavit, unknown type,
 * notary requested, or extra copies before their price is set).
 */
export function instantQuote(order) {
  if (order.service_category !== "affidavit" || !AFFIDAVIT_SLUGS.has(order.order_type)) return null;
  const form = order.form_data || {};
  if (form.authenticated_by && form.authenticated_by !== "commissioner") return null; // notary: coming soon
  const complex = COMPLEX_AFFIDAVITS.has(order.order_type);
  const lines = [
    { label: complex ? "Affidavit (enhanced checks), court fee included" : "Affidavit, court fee included", amount: complex ? AFFIDAVIT_COMPLEX : AFFIDAVIT_STANDARD },
  ];
  if (order.speed === "express") lines.push({ label: "Express, same day (orders before 2 PM)", amount: EXPRESS_ADD_ON });
  const copies = Number.isFinite(Number(form.copies)) ? Math.max(1, Math.floor(Number(form.copies))) : 1;
  if (copies > 1) {
    if (EXTRA_COPY_PRICE === null) return null;
    lines.push({ label: `Extra certified copies (${copies - 1})`, amount: (copies - 1) * EXTRA_COPY_PRICE });
  }
  return { lines, total: lines.reduce((s, l) => s + l.amount, 0) };
}
