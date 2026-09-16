// Shared source of truth for CAC & Compliance types — matches the Platform
// Playbook order_type enum values exactly (6 types).

export interface CacField {
  label: string;
  placeholder?: string;
  type?: "text" | "textarea" | "date" | "file";
}

export interface CacType {
  slug: string;
  label: string;
  desc: string;
  turnaround: string;
  fields: CacField[];
  note?: string;
}

export const CAC_TYPES: CacType[] = [
  {
    slug: "business_name_registration",
    label: "Business Name Registration",
    desc: "Sole proprietorship or partnership trading name.",
    turnaround: "3–5 working days",
    fields: [
      { label: "Proposed business name — first choice" },
      { label: "Proposed business name — second choice" },
      { label: "Nature of business", placeholder: "e.g. General trading — foodstuff retail" },
      { label: "Principal place of business", placeholder: "Full address" },
      { label: "Proposed commencement date", type: "date" },
      { label: "Proprietor full name" },
      { label: "Residential address" },
      { label: "Nationality" },
      { label: "Valid ID (upload)", type: "file" },
      { label: "Passport photograph (upload)", type: "file" },
    ],
    note: "Proposed names are checked against CAC's registry via their AI name-verification system before filing.",
  },
  {
    slug: "company_incorporation",
    label: "Private Limited Company (LTD)",
    desc: "Full incorporation with share capital and directors.",
    turnaround: "7–10 working days",
    fields: [
      { label: "Proposed company name — first choice" },
      { label: "Proposed company name — second choice" },
      { label: "Nature / objects of business", type: "textarea" },
      { label: "Registered office address" },
      { label: "Share capital amount", placeholder: "e.g. ₦5,000,000 — 5,000,000 shares at ₦1" },
      { label: "Director 1 — full name" },
      { label: "Director 1 — address" },
      { label: "Director 1 — shareholding %" },
      { label: "Director 2 — full name" },
      { label: "Director 2 — address" },
      { label: "Director 2 — shareholding %" },
      { label: "Company secretary", placeholder: "Use Docufast Corporate Services, or provide your own" },
    ],
    note: "Minimum share capital is ₦100,000,000 if any shareholder is a foreign national.",
  },
  {
    slug: "incorporated_trustees_registration",
    label: "Incorporated Trustees",
    desc: "NGO, church or association — includes mandatory newspaper publication.",
    turnaround: "6–10 weeks",
    fields: [
      { label: "Proposed name" },
      { label: "Trustee 1 — full name" },
      { label: "Trustee 1 — address" },
      { label: "Trustee 2 — full name" },
      { label: "Trustee 2 — address" },
      { label: "Aims and objectives", type: "textarea" },
      { label: "Minutes appointing trustees (upload)", type: "file" },
    ],
    note: "Requires 2 weeks of public notice via newspaper publication before registration can proceed — this is filed as a linked order.",
  },
  {
    slug: "cac_annual_returns",
    label: "Annual Returns",
    desc: "Keep an existing entity in good standing with CAC.",
    turnaround: "2–4 working days",
    fields: [
      { label: "Entity registration number (RC/BN)" },
      { label: "Entity name" },
      { label: "Financial year start" },
      { label: "Financial year end" },
      { label: "Gross assets" },
      { label: "Sources of income", type: "textarea" },
    ],
    note: "Filing windows: Business Names — 30 June annually. LTD — within 42 days of AGM. Incorporated Trustees — 30 June to 31 December.",
  },
  {
    slug: "cac_status_report",
    label: "CAC Status Report",
    desc: "Confirm an entity's current standing and registered details.",
    turnaround: "2–4 working days",
    fields: [
      { label: "Entity registration number (RC/BN)" },
      { label: "Entity name" },
      { label: "Reason for request", type: "textarea" },
    ],
  },
  {
    slug: "company_amendment",
    label: "Company Amendment",
    desc: "Post-incorporation changes — directors, shareholders, address, or name.",
    turnaround: "5–10 working days",
    fields: [
      { label: "Entity registration number (RC/BN)" },
      { label: "Nature of change", placeholder: "e.g. director added/removed, address change, share transfer" },
      { label: "Current details" },
      { label: "New details" },
      { label: "Supporting board resolution (upload)", type: "file" },
    ],
  },
];

export function getCacType(slug: string): CacType | undefined {
  return CAC_TYPES.find((t) => t.slug === slug);
}
