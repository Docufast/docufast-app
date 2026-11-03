// NPC vital registration services (#101; Playbook 7.3 and 9.3). Nine order types, assisted only:
// the customer gives the details and consent, our staff complete the application on the NPC portal,
// and track it. Rules (Playbook 7.3): say "we help you complete your NPC application"; never call
// Docufast an NPC agent or partner before accreditation; every submission needs the customer's
// written consent; children's records need the parent or guardian and the parental consent step
// (#200); Docufast never alters, reproduces or issues an NPC document; no portal automation.
//
// Switches (both off by default, set in Vercel):
//   NEXT_PUBLIC_NPC_SERVICES_ENABLED=on  opens the order forms (JSB, after Sheriff's #102 and NPC #187).
//   NEXT_PUBLIC_CHILD_ORDERS_ENABLED=on  allows records of a child (only once #200 is installed).
import type { FormField, ServiceForm } from "./serviceForms";

export const NPC_SERVICES_ENABLED = process.env.NEXT_PUBLIC_NPC_SERVICES_ENABLED === "on";
export const CHILD_ORDERS_ENABLED = process.env.NEXT_PUBLIC_CHILD_ORDERS_ENABLED === "on";

const o = (...labels: string[]) => labels.map((l) => ({ value: l, label: l }));
const STATES = o(
  "Lagos", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara"
);
const ID_HELP = "A clear photo or scan of your NIN slip, national ID card, international passport, driver's licence or voter's card.";
export const CHILD_STOP =
  "We cannot take orders about a child's record yet. Our parental consent step is being finished. Message us on WhatsApp and we will tell you when it opens.";
const CHILD = "My child (under 18)";
const childStop = CHILD_ORDERS_ENABLED ? undefined : { in: [CHILD], message: CHILD_STOP };

const whose: FormField = {
  key: "record_of", label: "Whose record is this?", type: "choice", required: true,
  options: o("Mine (18 or over)", CHILD, "A relative (18 or over)"),
  stop: childStop,
};
const consent = (what: string): FormField => ({
  key: "consent", label: "Your consent", type: "choice", required: true,
  options: [{ value: "yes", label: `I authorise Docufast to help me complete this NPC application (${what}) using the details above, and confirm they are correct.` }],
  help: "We check the details with you again before anything is sent to NPC. NPC's own fees are paid to NPC in full.",
});
const applicant: FormField[] = [
  { key: "applicant_name", label: "Your full name", required: true, help: "Exactly as it appears on your ID." },
  { key: "applicant_relationship", label: "Your relationship to the person on the record", placeholder: "e.g. Self, mother, son, sister" , required: true },
  { key: "applicant_id_upload", label: "Your valid ID", type: "file", help: ID_HELP },
];
const person = (who: string): FormField[] => [
  { key: "person_name", label: `${who}: full name`, required: true },
  { key: "date_of_birth", label: "Date of birth", type: "date", required: true },
  { key: "sex", label: "Sex", type: "choice", options: o("Male", "Female"), required: true },
  { key: "state_of_birth", label: "State of birth", type: "select", options: STATES, required: true },
  { key: "lga_of_birth", label: "Local government area of birth", required: true },
];
const parents: FormField[] = [
  { key: "mother_name", label: "Mother's full name", required: true },
  { key: "father_name", label: "Father's full name", help: "Leave blank if not known." },
];

export const NPC_FORMS: ServiceForm[] = [
  {
    category: "npc", slug: "npc_birth_registration", title: "Birth Registration",
    intro: "Register a birth with the National Population Commission. We help you complete your NPC application and track it until the certificate is ready.",
    sections: [
      { title: "The child", fields: [
        { key: "record_of", label: "Whose birth is this?", type: "choice", required: true, options: o(CHILD), initial: CHILD, stop: childStop },
        ...person("Child"),
        { key: "place_of_birth", label: "Where was the child born?", type: "choice", options: o("Hospital or clinic", "At home", "Other"), required: true },
        { key: "facility_name", label: "Name of the hospital or clinic", showIf: { key: "place_of_birth", in: ["Hospital or clinic"] } },
      ] },
      { title: "Parents", fields: [...parents, { key: "mother_id_upload", label: "Mother's or father's valid ID", type: "file", help: ID_HELP }] },
      { title: "You", fields: applicant },
      { title: "Consent", fields: [consent("birth registration")] },
    ],
  },
  {
    category: "npc", slug: "npc_foreign_birth_notification", title: "Foreign Birth Notification",
    intro: "For a Nigerian child born outside Nigeria. We help you notify NPC so the birth is on record in Nigeria.",
    sections: [
      { title: "The child", fields: [
        { key: "record_of", label: "Whose birth is this?", type: "choice", required: true, options: o(CHILD, "Mine (18 or over)"), stop: childStop },
        { key: "person_name", label: "Full name", required: true },
        { key: "date_of_birth", label: "Date of birth", type: "date", required: true },
        { key: "sex", label: "Sex", type: "choice", options: o("Male", "Female"), required: true },
        { key: "country_of_birth", label: "Country and city of birth", required: true, placeholder: "e.g. London, United Kingdom" },
        { key: "foreign_certificate_upload", label: "Birth certificate from the country of birth", type: "file" },
      ] },
      { title: "Parents", fields: [
        ...parents,
        { key: "nigerian_parent", label: "Which parent is Nigerian?", type: "choice", options: o("Mother", "Father", "Both"), required: true },
        { key: "parent_passport_upload", label: "Nigerian parent's passport or NIN slip", type: "file" },
      ] },
      { title: "You", fields: applicant },
      { title: "Consent", fields: [consent("foreign birth notification")] },
    ],
  },
  {
    category: "npc", slug: "npc_birth_attestation", title: "Birth Attestation",
    intro: "For an adult born in Nigeria whose birth was not registered at the time. We help you complete your NPC application for an attestation of birth.",
    sections: [
      { title: "The person", fields: [whose, ...person("Person"), ...parents,
        { key: "supporting_upload", label: "Any document showing the date of birth (optional)", type: "file", help: "For example a school certificate, baptism card or age declaration affidavit." },
      ] },
      { title: "You", fields: applicant },
      { title: "Consent", fields: [consent("birth attestation")] },
    ],
    note: "If NPC asks for an age declaration affidavit, you can order one from us at the same time.",
  },
  {
    category: "npc", slug: "npc_record_modification", title: "Correct an NPC Record",
    intro: "Correct a mistake on an existing birth record, such as a misspelt name or a wrong date.",
    sections: [
      { title: "The record", fields: [whose,
        { key: "certificate_number", label: "Certificate or registration number", help: "Printed on the certificate. Leave blank if you do not have it." },
        { key: "person_name", label: "Name as it appears on the record now", required: true },
        { key: "what_to_correct", label: "What needs correcting?", type: "select", required: true, options: o("Name", "Date of birth", "Place of birth", "Parents' names", "Sex", "More than one of these") },
        { key: "correct_details", label: "The correct details", type: "textarea", required: true, placeholder: "e.g. Surname should be Okafor, not Okafo" },
        { key: "certificate_upload", label: "Current certificate (photo or scan)", type: "file" },
        { key: "affidavit_upload", label: "Supporting affidavit, if you have one", type: "file", help: "NPC may ask for a correction of name or date of birth affidavit. We can prepare one for you." },
      ] },
      { title: "You", fields: applicant },
      { title: "Consent", fields: [consent("record correction")] },
    ],
  },
  {
    category: "npc", slug: "npc_certificate_reprint", title: "Certificate Reprint",
    intro: "Get a fresh print of an existing NPC birth certificate.",
    sections: [
      { title: "The certificate", fields: [whose,
        { key: "certificate_number", label: "Certificate or registration number", help: "Leave blank if you do not have it." },
        { key: "person_name", label: "Name on the certificate", required: true },
        { key: "date_of_birth", label: "Date of birth", type: "date", required: true },
        { key: "certificate_upload", label: "Copy of the old certificate, if you have one", type: "file" },
      ] },
      { title: "You", fields: applicant },
      { title: "Consent", fields: [consent("certificate reprint")] },
    ],
  },
  {
    category: "npc", slug: "npc_certificate_reissuance", title: "Certificate Reissue",
    intro: "Get a birth certificate reissued, for example after it was lost or damaged.",
    sections: [
      { title: "The certificate", fields: [whose,
        { key: "reissue_reason", label: "Why do you need it reissued?", type: "choice", required: true, options: o("Lost", "Damaged", "Stolen", "Other") },
        { key: "certificate_number", label: "Certificate or registration number, if known" },
        { key: "person_name", label: "Name on the certificate", required: true },
        { key: "date_of_birth", label: "Date of birth", type: "date", required: true },
        { key: "affidavit_upload", label: "Affidavit of loss, if you have one", type: "file", help: "NPC may ask for one when a certificate is lost. We can prepare it for you." },
      ] },
      { title: "You", fields: applicant },
      { title: "Consent", fields: [consent("certificate reissue")] },
    ],
  },
  {
    category: "npc", slug: "npc_certificate_verification", title: "Certificate Verification",
    intro: "Check with NPC that a birth certificate or attestation is genuine, for yourself or for an employer, school, embassy or bank.",
    sections: [
      { title: "The certificate", fields: [whose,
        { key: "certificate_number", label: "Certificate or registration number", required: true },
        { key: "person_name", label: "Name on the certificate", required: true },
        { key: "verification_for", label: "Who needs the verification?", type: "select", options: o("Me", "An employer", "A school", "An embassy", "A bank", "Other") },
        { key: "certificate_upload", label: "Copy of the certificate", type: "file" },
      ] },
      { title: "You", fields: applicant },
      { title: "Consent", fields: [consent("certificate verification")] },
    ],
  },
  {
    category: "npc", slug: "npc_death_notification", title: "Death Notification",
    intro: "Notify NPC of a death, as next of kin or informant. We help you complete your NPC application and are sorry for your loss.",
    sections: [
      { title: "The person who died", fields: [
        { key: "person_name", label: "Full name", required: true },
        { key: "date_of_death", label: "Date of death", type: "date", required: true },
        { key: "state_of_death", label: "State where the death happened", type: "select", options: STATES, required: true },
        { key: "lga_of_death", label: "Local government area", required: true },
        { key: "place_of_death", label: "Where did it happen?", type: "choice", options: o("Hospital", "At home", "Other"), required: true },
        { key: "death_certificate_upload", label: "Hospital or medical certificate of death, if you have one", type: "file" },
      ] },
      { title: "You", fields: applicant },
      { title: "Consent", fields: [consent("death notification")] },
    ],
  },
  {
    category: "npc", slug: "npc_health_facility_onboarding", title: "Health Facility Onboarding",
    intro: "For hospitals, clinics and maternity homes that want to register births and deaths with NPC. We help your facility get set up.",
    sections: [
      { title: "The facility", fields: [
        { key: "facility_name", label: "Facility name", required: true },
        { key: "facility_type", label: "Type", type: "select", required: true, options: o("Hospital", "Clinic", "Maternity home", "Primary health centre", "Other") },
        { key: "facility_state", label: "State", type: "select", options: STATES, required: true },
        { key: "facility_lga", label: "Local government area", required: true },
        { key: "facility_address", label: "Address", required: true },
        { key: "facility_registration", label: "Registration number with the state ministry of health, if any" },
      ] },
      { title: "Contact person", fields: [
        { key: "applicant_name", label: "Your full name", required: true },
        { key: "applicant_relationship", label: "Your role at the facility", required: true, placeholder: "e.g. Medical director, administrator" },
      ] },
      { title: "Consent", fields: [consent("health facility onboarding")] },
    ],
    note: "We confirm the quote after a short call with you.",
  },
];
