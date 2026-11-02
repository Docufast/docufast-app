// Shared source of truth for affidavit types — used by both the category
// browse page and the dynamic order form. Matches the Platform Playbook
// order_type enum values exactly.

export type AffidavitCategory =
  | "name"
  | "birth_age"
  | "loss"
  | "marriage"
  | "death"
  | "student"
  | "status";

export interface AffidavitType {
  slug: string;
  label: string;
  category: AffidavitCategory;
  /** Set when the type cannot be ordered; the message is shown instead of the order form. */
  notOrderable?: string;
}

export const AFFIDAVIT_TYPES: AffidavitType[] = [
  { slug: "change_of_name", label: "Change of Name", category: "name" },
  { slug: "correction_of_name", label: "Correction of Name", category: "name" },
  { slug: "confirmation_of_name", label: "Confirmation of Name", category: "name" },
  { slug: "addition_removal_of_name", label: "Addition/Removal of Name", category: "name" },
  { slug: "rearrangement_of_name", label: "Re-Arrangement of Name", category: "name" },
  { slug: "combined_correction_name_dob", label: "Combined Correction of Name & DOB", category: "name" },

  { slug: "age_declaration_adult", label: "Age Declaration (Adult)", category: "birth_age" },
  { slug: "age_declaration_minor_male", label: "Age Declaration (Minor, Male)", category: "birth_age" },
  { slug: "age_declaration_minor_female", label: "Age Declaration (Minor, Female)", category: "birth_age" },
  { slug: "correction_of_dob", label: "Correction of Date of Birth", category: "birth_age" },
  { slug: "attestation_birth_cert", label: "Attestation of Birth Certificate", category: "birth_age",
    notOrderable: "Birth attestation is a National Population Commission (NPC) service, not an affidavit. It is moving to our NPC services, which are coming soon. Message us on WhatsApp if you need it now." }, // JSB, 2 Nov 2026

  { slug: "loss_general", label: "Loss of Items (General)", category: "loss" },
  { slug: "loss_workplace_id", label: "Loss of Workplace ID", category: "loss" },
  { slug: "loss_sim_card", label: "Loss of SIM Card", category: "loss" },
  { slug: "loss_sim_no_id", label: "Loss of SIM (No ID)", category: "loss" },
  { slug: "loss_jamb_sim", label: "Loss of JAMB/UTME SIM", category: "loss" },
  { slug: "loss_intl_passport", label: "Loss of International Passport", category: "loss" },
  { slug: "loss_drivers_licence", label: "Loss of Driver's Licence", category: "loss" },
  { slug: "loss_vehicle_docs", label: "Loss of Vehicle Documents", category: "loss" },

  { slug: "bachelorhood_spinsterhood", label: "Bachelorhood / Spinsterhood", category: "marriage" },
  { slug: "declaration_of_marriage", label: "Declaration of Marriage", category: "marriage" },
  { slug: "dissolution_of_marriage", label: "Dissolution of Marriage", category: "marriage" },

  { slug: "declaration_of_death", label: "Declaration of Death", category: "death",
    notOrderable: "Declaration of Death is not available online yet. Message us on WhatsApp and we will tell you how to get one." }, // JSB, 2 Nov 2026: hidden for the beta (LPA s.22, #206)
  { slug: "release_of_corpse", label: "Release of Corpse", category: "death" },

  { slug: "loss_school_id", label: "Loss of School ID", category: "student" },
  { slug: "confirmation_of_result", label: "Confirmation of Result", category: "student" },
  { slug: "good_conduct", label: "Good Conduct", category: "student" },
  { slug: "support_sponsorship", label: "Support/Sponsorship", category: "student" },

  { slug: "change_car_ownership", label: "Change of Car Ownership", category: "status" },
  { slug: "change_of_residence", label: "Change of Residence", category: "status" },
  { slug: "change_of_signature", label: "Change of Signature", category: "status" },
];

/** Types customers can order now (the list page and search use this). */
export const ORDERABLE_AFFIDAVIT_TYPES = AFFIDAVIT_TYPES.filter((t) => !t.notOrderable);

export function getAffidavitType(slug: string): AffidavitType | undefined {
  return AFFIDAVIT_TYPES.find((t) => t.slug === slug);
}
