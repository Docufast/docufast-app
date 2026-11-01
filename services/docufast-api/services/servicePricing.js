// Docufast prices for instant quotes (JSB, 1 Nov 2026). ONE FILE, TWO COPIES:
//   apps/web/lib/servicePricing.js            (what the order forms show)
//   services/docufast-api/services/servicePricing.js  (what the customer is charged)
// The two must be byte-identical; apps/web/tests/pricing.test.mjs fails if they differ.
// Source: Docufast_Pricing_Schedule_v1 (approved for the beta by JSB, 14 and 19 Oct 2026).
// Customer prices are all-inclusive and VAT-inclusive unless a line says "at cost".

export const AFFIDAVIT_STANDARD = 4000;
export const AFFIDAVIT_COMPLEX = 6000;
export const EXPRESS_ADD_ON = 1000;

export const AFFIDAVIT_SLUGS = [
  "change_of_name", "correction_of_name", "confirmation_of_name", "addition_removal_of_name", "rearrangement_of_name",
  "combined_correction_name_dob", "age_declaration_adult", "age_declaration_minor_male", "age_declaration_minor_female",
  "correction_of_dob", "attestation_birth_cert", "loss_general", "loss_workplace_id", "loss_sim_card", "loss_sim_no_id",
  "loss_jamb_sim", "loss_intl_passport", "loss_drivers_licence", "loss_vehicle_docs", "bachelorhood_spinsterhood",
  "declaration_of_marriage", "dissolution_of_marriage", "declaration_of_death", "release_of_corpse", "loss_school_id",
  "confirmation_of_result", "good_conduct", "support_sponsorship", "change_car_ownership", "change_of_residence",
  "change_of_signature",
];

// Complex tier (JSB, 19 Oct 2026): extra checks, same court cost.
export const COMPLEX_AFFIDAVITS = [
  "combined_correction_name_dob", "age_declaration_minor_male", "age_declaration_minor_female", "loss_sim_no_id",
  "dissolution_of_marriage", "declaration_of_death", "release_of_corpse",
];

export const CAC = {
  business_name_registration: 40000,
  company_incorporation: 75000, // share capital up to NGN 1,000,000
  incorporated_trustees_registration: 150000, // includes the newspaper notice
  cac_annual_returns_first_year: 15000, // service fee + CAC fee
  cac_annual_returns_extra_year: 10000,
  cac_status_report: 15000,
  company_amendment_per_change: 25000, // + CAC fee at cost
};
export const PUBLICATION = 10000; // per notice, all-inclusive
export const VA = { document_typing: 500, data_entry: 2500, transcription: 300 }; // per page / per 100 rows / per audio minute

/**
 * @typedef {{ label: string, amount: number }} QuoteLine
 * @typedef {{ lines: QuoteLine[], total: number, final: boolean, note?: string }} Quote
 */

const sum = (lines) => lines.reduce((s, l) => s + l.amount, 0);
const int = (x) => {
  const n = Math.floor(Number(String(x ?? "").replace(/[^0-9.]/g, "")));
  return Number.isFinite(n) ? n : 0;
};

/**
 * Price an order. Returns null when the service has no price here (a person quotes it).
 * final = true: a fixed price, sent as the quote at once. final = false: an estimate; a person
 * confirms the final quote (note says why).
 * @param {{ service_category: string, order_type: string, speed?: string, form_data?: Record<string, unknown> }} order
 * @returns {Quote | null}
 */
export function priceOrder(order) {
  const f = order.form_data || {};
  const slug = order.order_type;
  /** @type {QuoteLine[]} */
  const lines = [];

  if (order.service_category === "affidavit") {
    if (!AFFIDAVIT_SLUGS.includes(slug)) return null;
    const complex = COMPLEX_AFFIDAVITS.includes(slug);
    lines.push({ label: complex ? "Affidavit (enhanced checks), court fee included" : "Affidavit, court fee included", amount: complex ? AFFIDAVIT_COMPLEX : AFFIDAVIT_STANDARD });
    lines.push({ label: "1 certified copy", amount: 0 });
    if (order.speed === "express") lines.push({ label: "Express, same day (orders before 2 PM)", amount: EXPRESS_ADD_ON });
    if (f.authenticated_by && f.authenticated_by !== "commissioner") return { lines, total: sum(lines), final: false, note: "Notary Public is coming soon. We will contact you." };
    if (int(f.copies) > 1) return { lines, total: sum(lines), final: false, note: "One certified copy is included with each order." };
    return { lines, total: sum(lines), final: true };
  }

  if (order.service_category === "cac") {
    switch (slug) {
      case "business_name_registration":
        lines.push({ label: "Business name registration, CAC fees included", amount: CAC.business_name_registration });
        return { lines, total: sum(lines), final: true };
      case "company_incorporation": {
        lines.push({ label: "Company registration, CAC fees and stamp duty included (share capital up to NGN 1,000,000)", amount: CAC.company_incorporation });
        if (f.foreign_owner === "yes") return { lines, total: sum(lines), final: false, note: "Companies with a foreign owner need at least NGN 100,000,000 share capital and extra checks. We will confirm your quote." };
        if (f.share_capital === "more") return { lines, total: sum(lines), final: false, note: "For share capital above NGN 1,000,000, CAC's extra filing fee and stamp duty are added at cost. We will confirm your quote." };
        return { lines, total: sum(lines), final: true };
      }
      case "incorporated_trustees_registration":
        lines.push({ label: "Incorporated trustees registration, CAC fees and newspaper notice included", amount: CAC.incorporated_trustees_registration });
        return { lines, total: sum(lines), final: true };
      case "cac_annual_returns": {
        const years = Math.max(1, Math.min(10, int(f.years_to_file) || 1));
        lines.push({ label: "Annual return for 1 year, CAC fee included", amount: CAC.cac_annual_returns_first_year });
        if (years > 1) lines.push({ label: `Earlier years not yet filed (${years - 1})`, amount: (years - 1) * CAC.cac_annual_returns_extra_year });
        if (years > 1) return { lines, total: sum(lines), final: false, note: "CAC usually charges late filing penalties for earlier years. We check your record and add them at cost before you pay." };
        return { lines, total: sum(lines), final: true };
      }
      case "cac_status_report":
        lines.push({ label: "CAC status report, CAC fee included", amount: CAC.cac_status_report });
        return { lines, total: sum(lines), final: true };
      case "company_amendment": {
        const changes = Math.max(1, Math.min(10, int(f.number_of_changes) || 1));
        lines.push({ label: `Service fee (${changes} change${changes > 1 ? "s" : ""})`, amount: changes * CAC.company_amendment_per_change });
        return { lines, total: sum(lines), final: false, note: "CAC's own fee depends on the change. We add it at cost and confirm your quote." };
      }
      default:
        return null;
    }
  }

  if (order.service_category === "publication") {
    if (slug !== "name_change_publication" && slug !== "loss_of_documents_publication") return null;
    lines.push({ label: "Newspaper notice, placement and digital proof included", amount: PUBLICATION });
    return { lines, total: sum(lines), final: true };
  }

  if (order.service_category === "virtual_assistant") {
    const rate = VA[slug];
    if (!rate) return null;
    let qty = 0;
    let label = "";
    if (slug === "document_typing") { qty = Math.max(1, int(f.pages)); label = `Typing, ${qty} page${qty > 1 ? "s" : ""} at NGN ${rate.toLocaleString("en-US")} a page`; }
    if (slug === "data_entry") { const rows = Math.max(1, int(f.rows)); qty = Math.ceil(rows / 100); label = `Data entry, ${rows} rows (${qty} x 100 rows at NGN ${rate.toLocaleString("en-US")})`; }
    if (slug === "transcription") { qty = Math.max(1, int(f.minutes)); label = `Transcription, ${qty} minute${qty > 1 ? "s" : ""} at NGN ${rate.toLocaleString("en-US")} a minute`; }
    lines.push({ label, amount: qty * rate });
    if (f.turnaround === "rush") return { lines, total: sum(lines), final: false, note: "Rush (12 hours) costs extra. We will confirm your quote." };
    return { lines, total: sum(lines), final: true, note: "Priced on the amount you gave. If your file is longer, we tell you before we start." };
  }

  return null;
}
