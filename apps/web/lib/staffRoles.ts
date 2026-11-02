// Team access (JSB, 1 Nov 2026, #224): what each staff role sees in the admin dashboard.
// The API enforces the same rules (services/docufast-api/lib/staffAuth.js); this file only decides
// what to show. founder = JSB; filer = files and checks affidavits; support = answers customers.
export type StaffRole = "founder" | "filer" | "support";
export const STAFF_ROLES: StaffRole[] = ["founder", "filer", "support"];
export const isStaff = (role: unknown): role is StaffRole => STAFF_ROLES.includes(role as StaffRole);
export const FILER_STATUSES = ["sent_to_partner", "in_processing", "qa_review", "ready_for_delivery", "delivered", "name_rejected"];
export const ROLE_INTRO: Record<StaffRole, string> = {
  founder: "",
  filer: "Signed in as Filer: you see paid orders, the filing sheet and delivery. Quotes and payments stay with the Founder.",
  support: "Signed in as Support: you see customer questions and the status of each order by reference. Order details and documents are not shown.",
};
