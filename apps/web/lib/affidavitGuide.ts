// Plain-language help for the affidavit order form (JSB, 1 Nov 2026): many customers have never
// sworn an affidavit, so the form offers choices and suggested wording instead of blank boxes.
// Every suggestion can be edited. Court and certified-copy wording to be confirmed by Sheriff (#184).

import type { AffidavitCategory } from "./affidavitTypes";

// ---- Courts ------------------------------------------------------------------------------------
// LagosCoMiS offers the Magistrate Court and the High Court of Lagos State; both cost the same
// (Playbook 8.1). The judicial division is where the deponent lives or where the matter arose.
export const COURTS = [
  { value: "High Court of Lagos State", hint: "Most common. Accepted by most offices." },
  { value: "Magistrate Court of Lagos State", hint: "Same price. Choose it if the office asking for the affidavit says so." },
] as const;

export const DIVISIONS = ["Ikeja", "Lagos (Island)", "Ikorodu", "Epe", "Badagry"] as const;

export const COURT_HELP =
  "Both courts cost the same. If you are not sure, choose the High Court of Lagos State and the division closest to where you live. " +
  "If the office that needs your affidavit has asked for a particular court, choose that one.";

export function jurisdictionText(court: string, division: string): string {
  return court && division ? `${court}, ${division} Judicial Division` : "";
}

// ---- Reasons -----------------------------------------------------------------------------------
const NAME_CHANGE_REASONS = [
  "Marriage",
  "Divorce or separation",
  "Religious reasons",
  "Personal preference",
  "Family or adoption reasons",
];
const NAME_CORRECTION_REASONS = [
  "My name was spelt wrongly on a document",
  "My names are in the wrong order on a document",
  "A name is missing from a document",
  "I use two different forms of my name",
];
const LOSS_REASONS = ["It was stolen", "I misplaced it", "It was damaged", "I lost it while travelling"];

export const OTHER = "Other (I will write it)";

/** Choices for the "reason" style field of each affidavit type, or null when there is none. */
export function reasonOptions(slug: string, category: AffidavitCategory): { key: string; label: string; options: string[] } | null {
  if (slug === "change_of_name" || slug === "addition_removal_of_name") {
    return { key: "reason", label: "Reason for the change", options: [...NAME_CHANGE_REASONS, OTHER] };
  }
  if (category === "name") {
    return { key: "reason", label: "What needs correcting", options: [...NAME_CORRECTION_REASONS, OTHER] };
  }
  if (category === "loss") {
    return { key: "how_lost", label: "What happened", options: [...LOSS_REASONS, OTHER] };
  }
  return null;
}

// ---- Where the affidavit will be used ------------------------------------------------------------
export const USES = [
  "my bank",
  "NIMC (NIN)",
  "the Passport Office",
  "my school, WAEC or JAMB",
  "my employer",
  "an embassy or visa application",
  "my mobile network",
] as const;

function listText(items: string[]): string {
  if (items.length === 0) return "all official purposes";
  if (items.length === 1) return `${items[0]} and all other official purposes`;
  return `${items.slice(0, -1).join(", ")}, ${items[items.length - 1]} and all other official purposes`;
}

// ---- Suggested purpose wording -------------------------------------------------------------------
type V = Record<string, string>;
const v = (x: string | undefined, fallback: string) => (x && x.trim() ? x.trim() : fallback);

const BY_SLUG: Record<string, (f: V) => string> = {
  change_of_name: (f) =>
    `To confirm that I, formerly known as ${v(f.old_name, "[old name]")}, now wish to be known and addressed as ${v(f.new_name, "[new name]")}` +
    `${f.reason ? ` (${f.reason.toLowerCase()})` : ""}, and that both names refer to me.`,
  correction_of_name: (f) =>
    `To confirm that my correct name is ${v(f.new_name, "[correct name]")}, and that ${v(f.old_name, "[name as written]")} on my documents refers to me.`,
  confirmation_of_name: (f) =>
    `To confirm that ${v(f.old_name, "[first name form]")} and ${v(f.new_name, "[second name form]")} refer to one and the same person, which is me.`,
  addition_removal_of_name: (f) =>
    `To confirm that my name has changed from ${v(f.old_name, "[old name]")} to ${v(f.new_name, "[new name]")}, and that both refer to me.`,
  rearrangement_of_name: (f) =>
    `To confirm that ${v(f.old_name, "[old order]")} and ${v(f.new_name, "[new order]")} are the same names in a different order, and both refer to me.`,
  combined_correction_name_dob: (f) =>
    `To confirm my correct name, ${v(f.new_name, "[correct name]")}, and my correct date of birth, ${v(f.declared_dob, "[date of birth]")}.`,
  age_declaration_adult: (f) => `To declare that I was born on ${v(f.declared_dob, "[date of birth]")}.`,
  age_declaration_minor_male: (f) => `To declare the date of birth of my son, born on ${v(f.declared_dob, "[date of birth]")}.`,
  age_declaration_minor_female: (f) => `To declare the date of birth of my daughter, born on ${v(f.declared_dob, "[date of birth]")}.`,
  correction_of_dob: (f) => `To confirm that my correct date of birth is ${v(f.declared_dob, "[date of birth]")}.`,
  attestation_birth_cert: (f) => `To attest to the facts of my birth, born on ${v(f.declared_dob, "[date of birth]")}.`,
  loss_sim_card: (f) =>
    `To report the loss of my SIM card${f.date_lost ? ` around ${f.date_lost}` : ""}${f.how_lost ? ` (${f.how_lost.toLowerCase()})` : ""}, so that it can be replaced.`,
  loss_sim_no_id: (f) =>
    `To report the loss of my SIM card${f.date_lost ? ` around ${f.date_lost}` : ""}, so that it can be replaced although I have no valid ID.`,
  loss_jamb_sim: (f) => `To report the loss of the SIM card linked to my JAMB/UTME profile${f.date_lost ? ` around ${f.date_lost}` : ""}, so that my profile can be recovered.`,
  bachelorhood_spinsterhood: () => `To declare that I am not married and have never been married.`,
  declaration_of_marriage: (f) => `To declare that I am married to ${v(f.spouse_name, "[spouse's full name]")}${f.relevant_date ? ` since ${f.relevant_date}` : ""}.`,
  dissolution_of_marriage: (f) => `To declare that my marriage to ${v(f.spouse_name, "[spouse's full name]")} has ended${f.relevant_date ? ` on ${f.relevant_date}` : ""}.`,
  declaration_of_death: (f) => `To declare the death of ${v(f.deceased_name, "[full name]")}${f.date_of_death ? ` on ${f.date_of_death}` : ""}.`,
  release_of_corpse: (f) => `To request the release of the body of ${v(f.deceased_name, "[full name]")} to the family for burial.`,
  confirmation_of_result: (f) => `To confirm that the result issued by ${v(f.institution, "[institution]")} under ${v(f.reg_number, "[registration number]")} belongs to me.`,
  good_conduct: () => `To declare that I am of good conduct and character.`,
  support_sponsorship: () => `To declare that I will support and sponsor the person named in this affidavit.`,
  change_car_ownership: (f) => `To confirm the change of ownership of the vehicle from ${v(f.previous_detail, "[previous owner]")} to ${v(f.new_detail, "[new owner]")}.`,
  change_of_residence: (f) => `To confirm that my address has changed from ${v(f.previous_detail, "[old address]")} to ${v(f.new_detail, "[new address]")}.`,
  change_of_signature: () => `To confirm that I have changed my signature and that the new signature is mine.`,
};

const BY_CATEGORY: Record<AffidavitCategory, (f: V) => string> = {
  name: (f) => `To confirm my name, ${v(f.new_name, "[name]")}.`,
  birth_age: (f) => `To declare my date of birth, ${v(f.declared_dob, "[date of birth]")}.`,
  loss: (f) =>
    `To report the loss of my ${v(f.item_lost, "[item]")}${f.date_lost ? ` around ${f.date_lost}` : ""}` +
    `${f.location_lost ? ` at or near ${f.location_lost}` : ""}${f.how_lost ? ` (${f.how_lost.toLowerCase()})` : ""}, so that it can be replaced.`,
  marriage: () => `To declare my marital status.`,
  death: (f) => `To declare the death of ${v(f.deceased_name, "[full name]")}.`,
  student: (f) => `For my records with ${v(f.institution, "[institution]")}.`,
  status: (f) => `To confirm the change from ${v(f.previous_detail, "[previous detail]")} to ${v(f.new_detail, "[new detail]")}.`,
};

/** The suggested "purpose" text for this order, built from what the customer has entered so far. */
export function suggestedPurpose(slug: string, category: AffidavitCategory, fields: V, uses: string[]): string {
  const base = (BY_SLUG[slug] ?? BY_CATEGORY[category])(fields);
  return `${base} This affidavit is for use with ${listText(uses)}.`;
}

// ---- Certified copies --------------------------------------------------------------------------
export const COPIES_HELP =
  "Your affidavit is sworn once at the court. You receive it as a certified copy: an official copy marked as a true copy of the sworn affidavit. " +
  "You can print it or send it to any office that asks for it. If you need a fresh one later, we can send it again.";
