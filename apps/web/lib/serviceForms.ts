// Order forms for CAC, newspaper notices and virtual office work, written for first-time users
// (JSB, 1 Nov 2026): choices instead of blank boxes, a plain explanation under each field, and the
// price shown as they go. Keys are stable snake_case names stored in orders.form_data.
// Legal wording to be checked by Sheriff (#184); CAC rules from the CAC Fees tab (#164).

export type FieldType = "text" | "textarea" | "date" | "number" | "file" | "select" | "choice";

export interface FormField {
  key: string;
  label: string;
  type?: FieldType;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  /** Show only when another field has one of these values. */
  showIf?: { key: string; in: string[] };
  /** Prefill. */
  initial?: string;
}

export interface ServiceForm {
  category: "cac" | "publication" | "virtual_assistant";
  slug: string;
  title: string;
  intro: string;
  sections: { title: string; fields: FormField[] }[];
  note?: string;
  /** For services that cannot be ordered on their own. */
  notOrderable?: { message: string; href: string; linkText: string };
}

const o = (...labels: string[]) => labels.map((l) => ({ value: l, label: l }));
const STATES = o(
  "Lagos", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara"
);
const BUSINESS_TYPES = o(
  "Buying and selling (general trading)", "Fashion and tailoring", "Food, catering and restaurant", "Beauty, hair and salon",
  "Building and construction", "Transport and logistics", "Farming and agriculture", "Computer, phones and IT services",
  "Education and training", "Health and pharmacy", "Real estate and property", "Consulting and professional services",
  "Media, events and entertainment", "Cleaning and facility services", "Other (I will describe it)"
);
const ID_HELP = "A clear photo or scan of your NIN slip, national ID card, international passport, driver's licence or voter's card.";
const PHOTO_HELP = "A recent passport photograph with a plain white background. A clear phone photo is fine.";
const RC_HELP = "Printed on your CAC certificate. RC for companies, BN for business names, IT for trustees. Example: RC 1234567.";
const NAME_HELP = "Give two names in case CAC has already given your first choice to someone else. We check both before filing.";

export const SERVICE_FORMS: ServiceForm[] = [
  // ---------------- CAC ----------------
  {
    category: "cac",
    slug: "business_name_registration",
    title: "Business Name Registration",
    intro: "For one person or partners trading under a business name (sole proprietorship or partnership). Done in 3 to 5 working days.",
    sections: [
      {
        title: "Your business",
        fields: [
          { key: "name_choice_1", label: "Business name you want (first choice)", required: true, help: NAME_HELP, placeholder: "e.g. Ada's Kitchen" },
          { key: "name_choice_2", label: "Second choice", required: true, placeholder: "e.g. Ada's Foods and Catering" },
          { key: "business_type", label: "What does the business do?", type: "select", options: BUSINESS_TYPES, required: true },
          { key: "business_type_other", label: "Describe the business in a few words", showIf: { key: "business_type", in: ["Other (I will describe it)"] } },
          { key: "business_address", label: "Business address", required: true, help: "Where the business operates. Your home address is fine if you work from home." },
          { key: "business_state", label: "State", type: "select", options: STATES, initial: "Lagos", required: true },
          { key: "start_date", label: "When did (or will) the business start?", type: "date", help: "Leave it blank if you are not sure." },
        ],
      },
      {
        title: "About you (the owner)",
        fields: [
          { key: "owner_name", label: "Your full name", required: true, help: "Exactly as it appears on your ID." },
          { key: "owner_address", label: "Your home address", required: true },
          { key: "nationality", label: "Nationality", type: "select", options: o("Nigerian", "Other"), initial: "Nigerian" },
          { key: "id_upload", label: "Valid ID", type: "file", help: ID_HELP },
          { key: "photo_upload", label: "Passport photograph", type: "file", help: PHOTO_HELP },
        ],
      },
    ],
    note: "The price includes all CAC fees. You receive your CAC certificate and status report in your Docufast account.",
  },
  {
    category: "cac",
    slug: "company_incorporation",
    title: "Private Limited Company (LTD)",
    intro: "A company that is separate from its owners, with directors and shares. Done in 7 to 10 working days.",
    sections: [
      {
        title: "Your company",
        fields: [
          { key: "name_choice_1", label: "Company name you want (first choice)", required: true, help: NAME_HELP + " \"Limited\" is added for you.", placeholder: "e.g. Bello Ventures" },
          { key: "name_choice_2", label: "Second choice", required: true },
          { key: "business_type", label: "What will the company do?", type: "select", options: BUSINESS_TYPES, required: true },
          { key: "business_type_other", label: "Describe the business in a few words", showIf: { key: "business_type", in: ["Other (I will describe it)"] } },
          { key: "office_address", label: "Company office address", required: true, help: "The official address CAC will have on record." },
          { key: "office_state", label: "State", type: "select", options: STATES, initial: "Lagos", required: true },
          {
            key: "share_capital", label: "Share capital", type: "choice", initial: "1000000",
            options: [
              { value: "100000", label: "NGN 100,000" },
              { value: "1000000", label: "NGN 1,000,000 (most common)" },
              { value: "more", label: "More than NGN 1,000,000" },
            ],
            help: "The value of the company's shares on paper. You do not pay this amount to anyone; it shows how the company is owned. NGN 1,000,000 suits most small companies.",
          },
          { key: "foreign_owner", label: "Will any owner be a foreign national?", type: "choice", initial: "no", options: [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] },
        ],
      },
      {
        title: "Directors and owners",
        fields: [
          { key: "director1_name", label: "Director 1: full name", required: true, help: "A director runs the company. You can be both a director and an owner." },
          { key: "director1_address", label: "Director 1: home address", required: true },
          { key: "director1_shares", label: "Director 1: share of the company", type: "select", initial: "100%", options: o("100%", "75%", "60%", "50%", "40%", "25%", "Other") },
          { key: "add_director2", label: "Is there a second director or owner?", type: "choice", initial: "no", options: [{ value: "no", label: "No, just me" }, { value: "yes", label: "Yes" }] },
          { key: "director2_name", label: "Director 2: full name", showIf: { key: "add_director2", in: ["yes"] } },
          { key: "director2_address", label: "Director 2: home address", showIf: { key: "add_director2", in: ["yes"] } },
          { key: "director2_shares", label: "Director 2: share of the company", type: "select", options: o("50%", "40%", "25%", "Other"), showIf: { key: "add_director2", in: ["yes"] } },
          { key: "id_upload", label: "Director 1: valid ID", type: "file", help: ID_HELP },
          {
            key: "secretary", label: "Company secretary", type: "choice", initial: "docufast",
            options: [{ value: "docufast", label: "Let Docufast arrange it" }, { value: "own", label: "I have my own" }],
            help: "A small company does not have to have a secretary. Choose \"Let Docufast arrange it\" if you are not sure.",
          },
        ],
      },
    ],
    note: "The price includes CAC fees and stamp duty for share capital up to NGN 1,000,000.",
  },
  {
    category: "cac",
    slug: "incorporated_trustees_registration",
    title: "Incorporated Trustees",
    intro: "For an NGO, church, mosque, club or association. Takes 6 to 10 weeks because CAC requires a public newspaper notice first.",
    sections: [
      {
        title: "Your organisation",
        fields: [
          { key: "org_name", label: "Name of the organisation", required: true, help: "CAC adds \"The Incorporated Trustees of\" in front of it." },
          { key: "org_type", label: "Type of organisation", type: "select", options: o("NGO or charity", "Church", "Mosque", "Association or club", "Foundation", "Other"), required: true },
          { key: "aims", label: "What the organisation does", type: "textarea", required: true, help: "Two or three short sentences. Example: To support widows in Lagos with skills training and small grants." },
          { key: "org_address", label: "Address of the organisation", required: true },
        ],
      },
      {
        title: "Trustees",
        fields: [
          { key: "trustee1_name", label: "Trustee 1: full name", required: true, help: "Trustees hold the organisation's property on its behalf. You need at least 2." },
          { key: "trustee1_address", label: "Trustee 1: address", required: true },
          { key: "trustee2_name", label: "Trustee 2: full name", required: true },
          { key: "trustee2_address", label: "Trustee 2: address", required: true },
          { key: "minutes_upload", label: "Minutes of the meeting that appointed the trustees", type: "file", help: "If you do not have this yet, leave it. We will send you a simple template." },
        ],
      },
    ],
    note: "The price includes CAC fees and the newspaper notice CAC requires.",
  },
  {
    category: "cac",
    slug: "cac_annual_returns",
    title: "Annual Returns",
    intro: "Every registered business must file a yearly return with CAC, or it can be struck off. Done in 2 to 4 working days.",
    sections: [
      {
        title: "Your business",
        fields: [
          { key: "rc_number", label: "Registration number (RC, BN or IT)", required: true, help: RC_HELP },
          { key: "entity_name", label: "Registered name", required: true },
          {
            key: "years_to_file", label: "How many years do you need to file?", type: "choice", initial: "1",
            options: [{ value: "1", label: "Just this year" }, { value: "2", label: "2 years" }, { value: "3", label: "3 years" }, { value: "4", label: "4 years" }, { value: "5", label: "5 or more" }],
            help: "If you have missed earlier years, choose how many years in total. Not sure? Choose your best guess; we check your CAC record before you pay.",
          },
          { key: "turnover", label: "Roughly how much did the business make in the last year?", type: "select", options: o("Less than NGN 1,000,000", "NGN 1,000,000 to NGN 5,000,000", "NGN 5,000,000 to NGN 25,000,000", "More than NGN 25,000,000", "No income yet") },
        ],
      },
    ],
    note: "Deadlines: business names by 30 June each year; companies within 42 days of their yearly meeting; incorporated trustees between 30 June and 31 December.",
  },
  {
    category: "cac",
    slug: "cac_status_report",
    title: "CAC Status Report",
    intro: "An official report from CAC confirming a business's current details, directors and standing. Done in 2 to 4 working days.",
    sections: [
      {
        title: "The business",
        fields: [
          { key: "rc_number", label: "Registration number (RC, BN or IT)", required: true, help: RC_HELP },
          { key: "entity_name", label: "Registered name", required: true },
          { key: "reason", label: "What do you need it for?", type: "select", options: o("Opening a bank account", "A loan or grant", "A tender or contract", "Checking a business before dealing with it", "Visa or embassy", "Other") },
        ],
      },
    ],
  },
  {
    category: "cac",
    slug: "company_amendment",
    title: "Company Amendment",
    intro: "Change something about a registered company: directors, owners, address, name or shares. Done in 5 to 10 working days.",
    sections: [
      {
        title: "The change",
        fields: [
          { key: "rc_number", label: "Company registration number (RC)", required: true, help: RC_HELP },
          { key: "change_type", label: "What do you want to change?", type: "select", required: true, options: o("Add or remove a director", "Transfer shares to someone", "Change the company address", "Change the company name", "Increase share capital", "Other") },
          { key: "number_of_changes", label: "How many changes?", type: "choice", initial: "1", options: [{ value: "1", label: "1" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4 or more" }], help: "Each change is filed separately. For example, removing one director and adding another is 2 changes." },
          { key: "current_details", label: "What it is now", type: "textarea", placeholder: "e.g. Director: Musa Bello" },
          { key: "new_details", label: "What it should be", type: "textarea", placeholder: "e.g. Director: Ngozi Okafor" },
          { key: "resolution_upload", label: "Board resolution approving the change", type: "file", help: "If you do not have one, leave it. We will prepare a simple one for you to sign." },
        ],
      },
    ],
  },

  // ---------------- Newspaper notices ----------------
  {
    category: "publication",
    slug: "name_change_publication",
    title: "Change of Name Newspaper Notice",
    intro: "Banks, NIMC and the Passport Office often ask for a newspaper notice as well as your change of name affidavit. Placed in 1 to 3 working days.",
    sections: [
      {
        title: "Your notice",
        fields: [
          { key: "has_affidavit", label: "Do you already have your change of name affidavit?", type: "choice", initial: "yes", options: [{ value: "yes", label: "Yes, I have it" }, { value: "no", label: "No, I need one too" }] },
          { key: "affidavit_upload", label: "Your affidavit", type: "file", help: "We check that the notice matches your affidavit before it is published.", showIf: { key: "has_affidavit", in: ["yes"] } },
          { key: "former_name", label: "Former name", required: true, help: "Write every name, in the order on your old documents." },
          { key: "new_name", label: "New name", required: true },
          { key: "reason", label: "Reason", type: "select", options: o("Marriage", "Divorce or separation", "Religious reasons", "Personal preference", "Family or adoption reasons", "Other") },
        ],
      },
    ],
    note: "We place it in a national daily newspaper and send you a digital copy of the published page.",
  },
  {
    category: "publication",
    slug: "loss_of_documents_publication",
    title: "Loss of Documents Newspaper Notice",
    intro: "Some offices ask for a newspaper notice as well as your affidavit of loss before they replace a document. Placed in 1 to 3 working days.",
    sections: [
      {
        title: "Your notice",
        fields: [
          { key: "has_affidavit", label: "Do you already have your affidavit of loss?", type: "choice", initial: "yes", options: [{ value: "yes", label: "Yes, I have it" }, { value: "no", label: "No, I need one too" }] },
          { key: "affidavit_upload", label: "Your affidavit", type: "file", help: "We check that the notice matches your affidavit before it is published.", showIf: { key: "has_affidavit", in: ["yes"] } },
          { key: "document_lost", label: "What was lost?", type: "select", required: true, options: o("Certificate (school, NYSC or other)", "International passport", "Land or property documents", "Vehicle documents", "ID card", "Cheque book or bank documents", "Other") },
          { key: "document_details", label: "Details of the document", placeholder: "e.g. WAEC certificate, 2015, number 4012345" },
          { key: "owner_name", label: "Owner's full name", required: true, help: "As written on the lost document." },
        ],
      },
    ],
    note: "We place it in a national daily newspaper and send you a digital copy of the published page.",
  },
  {
    category: "publication",
    slug: "incorporated_trustees_publication",
    title: "Incorporated Trustees Newspaper Notice",
    intro: "CAC requires a public notice before it registers incorporated trustees.",
    sections: [],
    notOrderable: {
      message: "This notice is already included in our Incorporated Trustees registration price, so you do not need to order it separately.",
      href: "/services/cac/incorporated_trustees_registration",
      linkText: "Register incorporated trustees",
    },
  },

  // ---------------- Virtual office ----------------
  {
    category: "virtual_assistant",
    slug: "document_typing",
    title: "Document Typing",
    intro: "Send a handwritten or scanned document and get it back neatly typed. NGN 500 a page.",
    sections: [
      {
        title: "Your document",
        fields: [
          { key: "source_upload", label: "Upload the document", type: "file", help: "A clear photo or scan of each page. Several pages can be in one PDF." },
          { key: "pages", label: "How many pages?", type: "number", initial: "1", required: true, help: "Count the pages to type. A full handwritten page usually becomes about one typed page." },
          { key: "output_format", label: "Get it back as", type: "choice", initial: "Word", options: o("Word", "PDF") },
          { key: "turnaround", label: "How soon?", type: "choice", initial: "standard", options: [{ value: "standard", label: "Standard (48 hours)" }, { value: "rush", label: "Rush (12 hours)" }] },
          { key: "instructions", label: "Anything we should know?", type: "textarea", placeholder: "e.g. Keep the table on page 2" },
        ],
      },
    ],
  },
  {
    category: "virtual_assistant",
    slug: "data_entry",
    title: "Data Entry",
    intro: "We type your records into a clean spreadsheet. NGN 2,500 for every 100 rows.",
    sections: [
      {
        title: "Your records",
        fields: [
          { key: "source_upload", label: "Upload the records", type: "file", help: "Photos, scans, PDFs or a document with the information." },
          { key: "rows", label: "About how many rows (records)?", type: "number", initial: "100", required: true, help: "One row is one record, for example one customer or one sale." },
          { key: "output_format", label: "Get it back as", type: "choice", initial: "Excel", options: o("Excel", "CSV") },
          { key: "turnaround", label: "How soon?", type: "choice", initial: "standard", options: [{ value: "standard", label: "Standard (48 hours)" }, { value: "rush", label: "Rush (12 hours)" }] },
          { key: "instructions", label: "Which columns do you need?", type: "textarea", placeholder: "e.g. Name, phone number, amount paid, date" },
        ],
      },
    ],
  },
  {
    category: "virtual_assistant",
    slug: "transcription",
    title: "Transcription",
    intro: "We turn audio or video into a written document. NGN 300 a minute.",
    sections: [
      {
        title: "Your recording",
        fields: [
          { key: "source_upload", label: "Upload the recording", type: "file", help: "Audio or video file. Clear sound gives the best result." },
          { key: "minutes", label: "How long is it (minutes)?", type: "number", initial: "10", required: true },
          { key: "output_format", label: "Get it back as", type: "choice", initial: "Word", options: o("Word", "PDF") },
          { key: "turnaround", label: "How soon?", type: "choice", initial: "standard", options: [{ value: "standard", label: "Standard (48 hours)" }, { value: "rush", label: "Rush (12 hours)" }] },
          { key: "instructions", label: "Anything we should know?", type: "textarea", placeholder: "e.g. Two speakers; label them Interviewer and Guest" },
        ],
      },
    ],
  },
];

export function getServiceForm(category: ServiceForm["category"], slug: string): ServiceForm | undefined {
  return SERVICE_FORMS.find((f) => f.category === category && f.slug === slug);
}

export function initialValues(form: ServiceForm): Record<string, string> {
  const v: Record<string, string> = {};
  for (const s of form.sections) for (const f of s.fields) if (f.initial) v[f.key] = f.initial;
  return v;
}

export function isVisible(field: FormField, values: Record<string, string>): boolean {
  return !field.showIf || field.showIf.in.includes(values[field.showIf.key] ?? "");
}
