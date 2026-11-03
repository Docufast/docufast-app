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
// "All purposes" (JSB, 3 Nov 2026) is for customers who do not know yet, or need one affidavit for
// several offices. It cannot be combined with the others: choosing it clears them, and choosing
// any other clears it (toggleUse).
export const ALL_PURPOSES = "All purposes (any office)";

export const USES = [
  ALL_PURPOSES,
  "my bank",
  "NIMC (NIN)",
  "the Passport Office",
  "my school, WAEC or JAMB",
  "my employer",
  "an embassy or visa application",
  "my mobile network",
] as const;

/** The new list of uses after the customer taps one. */
export function toggleUse(uses: string[], u: string): string[] {
  if (uses.includes(u)) return uses.filter((x) => x !== u);
  if (u === ALL_PURPOSES) return [ALL_PURPOSES];
  return [...uses.filter((x) => x !== ALL_PURPOSES), u];
}

function usesParagraph(uses: string[]): string {
  const items = uses.filter((u) => u !== ALL_PURPOSES);
  if (uses.includes(ALL_PURPOSES) || items.length === 0) {
    return "That this affidavit is required for all lawful and official purposes.";
  }
  const list = items.length === 1 ? items[0] : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
  return `That this affidavit is required for use with ${list}, and for all other lawful and official purposes.`;
}

// ---- One page ------------------------------------------------------------------------------------
// JSB, 3 Nov 2026: every affidavit must fit on ONE page. The court template already takes the
// heading, the deponent's details, the signature and the Commissioner's jurat, which leaves room
// for about 200 words of facts. Sheriff to confirm against a printed LagosCoMiS affidavit (#184).
export const PURPOSE_MAX_CHARS = 1200;
export const PURPOSE_MAX_PARAGRAPHS = 10;

export function onePageCheck(text: string): { ok: boolean; chars: number; paragraphs: number; message: string | null } {
  const t = text.trim();
  const chars = t.length;
  const paragraphs = t ? t.split(/\n+/).filter((l) => l.trim()).length : 0;
  let message: string | null = null;
  if (chars > PURPOSE_MAX_CHARS) {
    message = `Please shorten this to ${PURPOSE_MAX_CHARS.toLocaleString("en-US")} characters or fewer so the affidavit fits on one page (now ${chars.toLocaleString("en-US")}).`;
  } else if (paragraphs > PURPOSE_MAX_PARAGRAPHS) {
    message = `Please use ${PURPOSE_MAX_PARAGRAPHS} paragraphs or fewer so the affidavit fits on one page.`;
  }
  return { ok: !message, chars, paragraphs, message };
}

// ---- Suggested purpose wording -------------------------------------------------------------------
// Written as the numbered statements of an affidavit ("That ..."), filled in from the customer's
// answers, so a first-time customer gets complete, specific wording they can still edit.
// Legal wording to be confirmed by Sheriff (#184).
type V = Record<string, string>;
const v = (x: string | undefined, fallback: string) => (x && x.trim() ? x.trim() : fallback);
const lower = (x: string | undefined) => (x && x.trim() ? x.trim().toLowerCase() : "");
const me = (f: V) => v(f.deponent_name, "[your full name]");

const BY_SLUG: Record<string, (f: V) => string[]> = {
  change_of_name: (f) => [
    `That I was formerly known and addressed as ${v(f.old_name, "[old name]")}.`,
    `That I have changed my name to ${v(f.new_name, "[new name]")}${f.reason ? ` by reason of ${lower(f.reason)}` : ""}.`,
    `That ${v(f.old_name, "[old name]")} and ${v(f.new_name, "[new name]")} refer to one and the same person, which is me.`,
    `That all documents and certificates bearing my former name remain valid and belong to me.`,
    `That I now wish to be known, addressed and called ${v(f.new_name, "[new name]")} for all purposes.`,
  ],
  correction_of_name: (f) => [
    `That my correct name is ${v(f.new_name, "[correct name]")}.`,
    `That my name was written as ${v(f.old_name, "[name as written]")} on some of my documents${f.reason ? ` (${lower(f.reason)})` : ""}.`,
    `That ${v(f.old_name, "[name as written]")} and ${v(f.new_name, "[correct name]")} refer to one and the same person, which is me.`,
    `That I want my records corrected to show ${v(f.new_name, "[correct name]")}.`,
  ],
  confirmation_of_name: (f) => [
    `That I am known as both ${v(f.old_name, "[first name form]")} and ${v(f.new_name, "[second name form]")}.`,
    `That both names refer to one and the same person, which is me.`,
    `That documents bearing either name belong to me.`,
  ],
  addition_removal_of_name: (f) => [
    `That my name was formerly ${v(f.old_name, "[old name]")}.`,
    `That my name is now ${v(f.new_name, "[new name]")}${f.reason ? ` by reason of ${lower(f.reason)}` : ""}.`,
    `That both names refer to one and the same person, which is me.`,
    `That all documents bearing my former name remain valid and belong to me.`,
  ],
  rearrangement_of_name: (f) => [
    `That my names appear as ${v(f.old_name, "[old order]")} on some of my documents.`,
    `That the correct order of my names is ${v(f.new_name, "[new order]")}.`,
    `That both refer to one and the same person, which is me.`,
  ],
  combined_correction_name_dob: (f) => [
    `That my correct name is ${v(f.new_name, "[correct name]")}${f.old_name ? `, and not ${f.old_name.trim()} as written on some of my documents` : ""}.`,
    `That my correct date of birth is ${v(f.declared_dob, "[date of birth]")}.`,
    `That the names and dates on those documents refer to me, and I want my records corrected.`,
  ],
  age_declaration_adult: (f) => [
    `That I was born on ${v(f.declared_dob, "[date of birth]")}.`,
    `That ${f.context ? lower(f.context) : "I do not have a birth certificate to show my date of birth"}.`,
    `That ${v(f.declared_dob, "[date of birth]")} is my true date of birth, to the best of my knowledge and belief.`,
  ],
  age_declaration_minor_male: (f) => [
    `That I am the parent or guardian of the child named in this affidavit, my son.`,
    `That my son was born on ${v(f.declared_dob, "[date of birth]")}.`,
    `That ${f.context ? lower(f.context) : "he does not have a birth certificate to show his date of birth"}.`,
    `That I know these facts as his parent or guardian.`,
  ],
  age_declaration_minor_female: (f) => [
    `That I am the parent or guardian of the child named in this affidavit, my daughter.`,
    `That my daughter was born on ${v(f.declared_dob, "[date of birth]")}.`,
    `That ${f.context ? lower(f.context) : "she does not have a birth certificate to show her date of birth"}.`,
    `That I know these facts as her parent or guardian.`,
  ],
  correction_of_dob: (f) => [
    `That my correct date of birth is ${v(f.declared_dob, "[date of birth]")}.`,
    `That ${f.context ? lower(f.context) : "a different date of birth was written on some of my documents in error"}.`,
    `That I want my records corrected to show ${v(f.declared_dob, "[date of birth]")}.`,
  ],
  attestation_birth_cert: (f) => [`That I was born on ${v(f.declared_dob, "[date of birth]")}.`],
  loss_sim_card: (f) => [
    `That I am the registered owner of the SIM card with the number ${v(f.item_lost, "[phone number and network]")}.`,
    `That I lost the SIM card${f.date_lost ? ` around ${f.date_lost.trim()}` : ""}${f.location_lost ? ` at or near ${f.location_lost.trim()}` : ""}${f.how_lost ? ` (${lower(f.how_lost)})` : ""}.`,
    `That all efforts to find it have failed.`,
    `That I need this affidavit so the network can replace the SIM card with the same number.`,
  ],
  loss_sim_no_id: (f) => [
    `That I am the owner of the SIM card with the number ${v(f.item_lost, "[phone number and network]")}.`,
    `That I lost the SIM card${f.date_lost ? ` around ${f.date_lost.trim()}` : ""}${f.location_lost ? ` at or near ${f.location_lost.trim()}` : ""}${f.how_lost ? ` (${lower(f.how_lost)})` : ""}.`,
    `That I do not have a valid means of identification to present.`,
    `That I need this affidavit so the network can replace the SIM card with the same number.`,
  ],
  loss_jamb_sim: (f) => [
    `That the SIM card linked to my JAMB/UTME profile, ${v(f.item_lost, "[phone number]")}, is lost${f.date_lost ? ` since around ${f.date_lost.trim()}` : ""}.`,
    `That all efforts to find it have failed.`,
    `That I need this affidavit so my JAMB profile can be moved to a new number.`,
  ],
  bachelorhood_spinsterhood: () => [
    `That I am single and have never been married under the Marriage Act, native law and custom, or Islamic law.`,
    `That I am free to marry.`,
  ],
  declaration_of_marriage: (f) => [
    `That I am married to ${v(f.spouse_name, "[spouse's full name]")}${f.relevant_date ? ` since ${f.relevant_date.trim()}` : ""}.`,
    `That the marriage still subsists.`,
  ],
  dissolution_of_marriage: (f) => [
    `That I was married to ${v(f.spouse_name, "[spouse's full name]")}.`,
    `That the marriage was dissolved${f.relevant_date ? ` on ${f.relevant_date.trim()}` : ""}.`,
    `That I am no longer married to ${v(f.spouse_name, "[spouse's full name]")}.`,
  ],
  declaration_of_death: (f) => [`That ${v(f.deceased_name, "[full name]")} died${f.date_of_death ? ` on ${f.date_of_death.trim()}` : ""}.`],
  release_of_corpse: (f) => [
    `That ${v(f.deceased_name, "[full name]")} died${f.date_of_death ? ` on ${f.date_of_death.trim()}` : ""}.`,
    `That I am a member of the deceased's family and I am authorised by the family to receive the body.`,
    `That the family requests the release of the body for burial.`,
  ],
  confirmation_of_result: (f) => [
    `That I sat the examination of ${v(f.institution, "[institution or examination body]")} under the number ${v(f.reg_number, "[registration number]")}.`,
    `That the result issued under that number belongs to me.`,
  ],
  loss_school_id: (f) => [
    `That I am a student of ${v(f.institution, "[institution]")}${f.reg_number ? `, with the number ${f.reg_number.trim()}` : ""}.`,
    `That I lost my school identity card and all efforts to find it have failed.`,
    `That I need this affidavit so the school can issue a new one.`,
  ],
  good_conduct: (f) => [
    `That I am of good conduct and character${f.institution ? `, and known to ${f.institution.trim()}` : ""}.`,
    `That I have never been convicted of any criminal offence.`,
  ],
  support_sponsorship: () => [
    `That I will support and sponsor [name of the person sponsored], my [relationship].`,
    `That I can pay for [what you will pay for, e.g. school fees and upkeep] for [period].`,
  ],
  change_car_ownership: (f) => [
    `That the vehicle [make, model and registration number] was owned by ${v(f.previous_detail, "[previous owner]")}.`,
    `That ownership of the vehicle has passed to ${v(f.new_detail, "[new owner]")}.`,
  ],
  change_of_residence: (f) => [
    `That I formerly lived at ${v(f.previous_detail, "[old address]")}.`,
    `That I now live at ${v(f.new_detail, "[new address]")}.`,
  ],
  change_of_signature: () => [
    `That I have changed my signature.`,
    `That the new signature shown on this affidavit is mine, and documents with my former signature remain valid.`,
  ],
};

const BY_CATEGORY: Record<AffidavitCategory, (f: V) => string[]> = {
  name: (f) => [`That my name is ${v(f.new_name, "[name]")}.`],
  birth_age: (f) => [`That I was born on ${v(f.declared_dob, "[date of birth]")}.`],
  loss: (f) => [
    `That I lost my ${v(f.item_lost, "[item]")}${f.date_lost ? ` around ${f.date_lost.trim()}` : ""}${f.location_lost ? ` at or near ${f.location_lost.trim()}` : ""}${f.how_lost ? ` (${lower(f.how_lost)})` : ""}.`,
    `That all efforts to find it have failed.`,
    `That I need this affidavit so it can be replaced.`,
  ],
  marriage: () => [`That [state your marital status].`],
  death: (f) => [`That ${v(f.deceased_name, "[full name]")} died.`],
  student: (f) => [`That I am a student of ${v(f.institution, "[institution]")}.`],
  status: (f) => [`That my details have changed from ${v(f.previous_detail, "[previous detail]")} to ${v(f.new_detail, "[new detail]")}.`],
};

/** The suggested affidavit statements for this order, built from the customer's answers so far.
 *  One numbered statement per line. Always fits the one-page limit with typical answers. */
export function suggestedPurpose(slug: string, category: AffidavitCategory, fields: V, uses: string[], deponentName = ""): string {
  const f = { ...fields, deponent_name: deponentName };
  const lines = [
    `That I am ${me(f)}, the deponent, and I make this affidavit from facts within my own knowledge.`,
    ...(BY_SLUG[slug] ?? BY_CATEGORY[category])(f),
    usesParagraph(uses),
    "That I make this declaration in good faith, believing its contents to be true and correct, in accordance with the Oaths Act.",
  ];
  return lines.map((l, i) => `${i + 1}. ${l}`).join("\n");
}

// ---- Certified copies --------------------------------------------------------------------------
export const COPIES_HELP =
  "Your affidavit is sworn once at the court. You receive it as a certified copy: an official copy marked as a true copy of the sworn affidavit. " +
  "You can print it or send it to any office that asks for it. If you need a fresh one later, subscribe to our Vault service and download it any time you need it."; // JSB, 3 Nov 2026
