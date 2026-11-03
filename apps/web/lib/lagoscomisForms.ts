// Which LagosCoMiS form each affidavit order type is filed on (#184, #185).
// Until a type is mapped, the filing sheet says so and staff ask Sheriff before filing.
// needsVideo: true when the affidavit type needs an identification video (Sheriff's list).

export interface CourtFormMapping {
  form: string | null;
  needsVideo: boolean | null; // null = not confirmed yet
}

// Source: Sheriff's "Affidavit Classification by LPA s.22 and LagosCoMiS Status" (2 Nov 2026): every
// type below is a General Affidavit on LagosCoMiS and OUT of Legal Practitioners Act s.22 (#206).
// Types his list did not name (JSB, 2 Nov 2026): Addition/Removal of Name is filed as "Correction of
// name"; Release of Corpse, Confirmation of Result, Change of Residence and Loss of SIM (No ID) as
// "General Affidavit"; Attestation of Birth Certificate is left unmapped (probably NPC, #101).
// Declaration of Death is NOT mapped: Sheriff treats "Proof of death" as IN s.22 for the beta, so
// the filing sheet keeps saying "Ask Sheriff before filing".
// needsVideo null = "where applicable" (JSB, 23 Oct and 2 Nov 2026): every affidavit must be sworn
// before a Commissioner for Oaths, including e-swearing, so the identification video is done
// whenever LagosCoMiS or the Commissioner asks for it. This covers us under any enforcement check.
// Declaration of Death always needs it (JSB, 2 Nov 2026).
// Rule (JSB, 2 Nov 2026): any type without its own LagosCoMiS form is filed as a General or Custom
// affidavit, e.g. Confirmation of Result. Custom is for a general purpose only, never litigation.
export const GENERAL = "General Affidavit (or Custom affidavit if General does not fit)";
// Types that must NOT fall back to General: they stay "Ask Sheriff before filing".
export const NOT_FILED_ON_LAGOSCOMIS = ["declaration_of_death", "attestation_birth_cert"];
const f = (form: string): CourtFormMapping => ({ form, needsVideo: null });

export const LAGOSCOMIS_FORMS: Record<string, CourtFormMapping> = {
  // Name changes
  change_of_name: f("Change of name"),
  correction_of_name: f("Correction of name"),
  confirmation_of_name: f("Confirmation of name"),
  rearrangement_of_name: f("Rearrangement of name"),
  combined_correction_name_dob: f("Correction of name and date of birth"),
  addition_removal_of_name: f("Correction of name"), // JSB, 2 Nov 2026
  // Birth and age
  age_declaration_adult: f("Statutory declaration of age"),
  age_declaration_minor_male: f("Statutory declaration of age"), // sworn by the parent or guardian
  age_declaration_minor_female: f("Statutory declaration of age"),
  correction_of_dob: f("Correction of date of birth"),
  // attestation_birth_cert: not mapped. JSB, 2 Nov 2026: probably an NPC service, not a LagosCoMiS
  // affidavit (see #101), so the filing sheet says "Ask Sheriff before filing" until settled.
  // Loss
  loss_general: f("Loss"),
  loss_workplace_id: f("Loss"),
  loss_school_id: f("Loss"),
  loss_drivers_licence: f("Loss"),
  loss_vehicle_docs: f("Loss"),
  loss_sim_card: f("Loss of SIM"),
  loss_jamb_sim: f("Loss of SIM"),
  loss_sim_no_id: f(GENERAL), // JSB, 2 Nov 2026
  loss_intl_passport: f("Loss of passport"),
  // Marital status
  bachelorhood_spinsterhood: f("Bachelorhood (men) or Spinsterhood (women)"),
  declaration_of_marriage: f("Declaration of marriage"),
  dissolution_of_marriage: f("Divorce"),
  // Student
  good_conduct: f("Good conduct (school)"),
  support_sponsorship: f("Sponsorship"),
  confirmation_of_result: f(GENERAL), // JSB, 2 Nov 2026
  // Status and vehicle
  change_car_ownership: f("Change of ownership (vehicle)"),
  change_of_signature: f("Change of signature"),
  change_of_residence: f(GENERAL), // JSB, 2 Nov 2026
  // Death
  release_of_corpse: f(GENERAL), // JSB, 2 Nov 2026
  // Court form not mapped (LPA s.22, see above). JSB, 2 Nov 2026: it needs the identification video.
  declaration_of_death: { form: null, needsVideo: true },
};

export function courtFormFor(orderType: string): CourtFormMapping {
  if (LAGOSCOMIS_FORMS[orderType]) return LAGOSCOMIS_FORMS[orderType];
  if (NOT_FILED_ON_LAGOSCOMIS.includes(orderType)) return { form: null, needsVideo: null };
  return { form: GENERAL, needsVideo: null }; // any new type falls under General or Custom
}
