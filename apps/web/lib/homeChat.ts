// lib/homeChat.ts
// The home screen chat (Platform Blueprint screen A1 and D1, JSB 3 Nov 2026: part of the beta).
// A guided chat, not an AI: it matches what the customer types to a service with fixed rules,
// in plain English or Pidgin, and answers with buttons that open the right order form.
// Nothing the customer types leaves the browser: no message is sent to a server or stored.
// Unmatched questions are offered the "Ask us a question" form, which the customer sends themselves.
//
// Wording follows Playbook 7.3 and 18.1 and the house rules (tests/homechat.test.mjs checks them):
// no NPC prices; NPC wording is "we help you complete your NPC application"; pay only on docufast.ng.

// Prices are worked out on the server (lib/homeChatPrices.ts) from the shared price file and
// passed in, so the browser does not download the price file for the home page.

export { QUICK_REPLIES, greeting, LANGUAGES, enabledLanguages, UI_TEXT, ui } from "./homeChatText";
export type { LangCode, UiKey } from "./homeChatText";

export type ChatAction = { label: string; href: string; note?: string };
export type ChatReply = {
  intent: string;
  text: string;
  actions: ChatAction[];
  ask?: boolean; // show the "Ask us a question" form
  whatsapp?: boolean; // show the WhatsApp button
};

const WHATSAPP = "https://wa.me/2349054951918";
const naira = (n: number) => `NGN ${n.toLocaleString("en-US")}`;
const NPC_ON = process.env.NEXT_PUBLIC_NPC_SERVICES_ENABLED === "on";

// ---- Prices, from the shared price file via the server ------------------------------------------
export type PriceNotes = Record<string, string>; // "affidavit/change_of_name" -> "NGN 4,000"
let PRICES: PriceNotes = {};
const priceNote = (category: string, slug: string) => PRICES[`${category}/${slug}`];
export { naira };

function affidavit(slug: string, label: string): ChatAction {
  return { label, href: `/services/affidavits/${slug}`, note: priceNote("affidavit", slug) };
}
function cac(slug: string, label: string): ChatAction {
  return { label, href: `/services/cac/${slug}`, note: priceNote("cac", slug) };
}
function publication(slug: string, label: string): ChatAction {
  return { label, href: `/services/publications/${slug}`, note: priceNote("publication", slug) };
}
const VA_NOTES: Record<string, string> = { document_typing: "NGN 500 a page", data_entry: "NGN 2,500 per 100 rows", transcription: "NGN 300 a minute" };
function va(slug: string, label: string): ChatAction {
  return { label, href: `/services/virtual-assistant/${slug}`, note: VA_NOTES[slug] };
}
const ALL_SERVICES: ChatAction = { label: "See all services", href: "/services" };

// ---- Matching ------------------------------------------------------------------------------------
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type Rule = { intent: string; test: RegExp; reply: (t: string) => ChatReply };

const LOSS_WORDS = /\b(lost|lose|loss|losing|missing|stolen|stole|steal|misplaced|misplace|cannot find|can t find|no see|don lost|don lose|thief|thieves|pickpocket)\b/;

function lossReply(t: string): ChatReply {
  const item =
    /\bjamb\b|\butme\b/.test(t) ? "jamb" :
    /\bsim\b|\bline\b|phone number|\bmtn\b|\bglo\b|\bairtel\b|9mobile/.test(t) ? "sim" :
    /passport/.test(t) ? "passport" :
    /driver|licen[cs]e/.test(t) ? "licence" :
    /school id|student id|matric/.test(t) ? "school" :
    /work id|staff id|office id|company id|id card|workplace/.test(t) ? "workid" :
    /car paper|vehicle|particulars|plate number/.test(t) ? "vehicle" : "";
  const pack = publication("loss_of_documents_publication", "Newspaper notice of loss");
  switch (item) {
    case "sim":
      return { intent: "loss_sim", text: "Sorry about your SIM. Your network will ask for an affidavit of loss to replace it with the same number. No valid ID? Choose the second option.", actions: [affidavit("loss_sim_card", "Loss of SIM card affidavit"), affidavit("loss_sim_no_id", "Loss of SIM, no ID"), affidavit("loss_jamb_sim", "Loss of JAMB/UTME SIM")] };
    case "jamb":
      return { intent: "loss_sim", text: "JAMB asks for an affidavit to move your profile to a new number.", actions: [affidavit("loss_jamb_sim", "Loss of JAMB/UTME SIM affidavit")] };
    case "passport":
      return { intent: "loss_passport", text: "The Passport Office asks for an affidavit of loss, and often a police report, before it replaces a lost passport.", actions: [affidavit("loss_intl_passport", "Loss of international passport affidavit"), pack] };
    case "licence":
      return { intent: "loss_licence", text: "To replace a lost driver's licence you will need an affidavit of loss.", actions: [affidavit("loss_drivers_licence", "Loss of driver's licence affidavit")] };
    case "school":
      return { intent: "loss_school_id", text: "Your school will ask for an affidavit before it issues a new ID card.", actions: [affidavit("loss_school_id", "Loss of school ID affidavit")] };
    case "workid":
      return { intent: "loss_work_id", text: "Your employer will usually ask for an affidavit of loss for a new ID card.", actions: [affidavit("loss_workplace_id", "Loss of workplace ID affidavit")] };
    case "vehicle":
      return { intent: "loss_vehicle", text: "For lost vehicle papers you will need an affidavit of loss.", actions: [affidavit("loss_vehicle_docs", "Loss of vehicle documents affidavit")] };
    default:
      return { intent: "loss_general", text: "Sorry to hear that. Most offices ask for an affidavit of loss, and some also want a newspaper notice. What did you lose? Pick one, or choose general.", actions: [affidavit("loss_sim_card", "SIM card"), affidavit("loss_intl_passport", "International passport"), affidavit("loss_drivers_licence", "Driver's licence"), affidavit("loss_workplace_id", "Work ID card"), affidavit("loss_general", "Something else (general)"), pack] };
  }
}

const RULES: Rule[] = [
  { intent: "greeting", test: /^(hi|hello|hey|good (morning|afternoon|evening)|how far|howfa|wetin dey|bawo|sannu|ndewo|kedu)\b/, reply: () => ({ intent: "greeting", text: "Hello. Tell me what you need in a few words, for example \"I lost my SIM\" or \"register my business\".", actions: [] }) },
  { intent: "human", test: /\b(human|person|agent|customer care|customer service|talk to|speak to|call me|whatsapp|customer support)\b/, reply: () => ({ intent: "human", text: "Our team is on WhatsApp, Monday to Friday, 8am to 6pm WAT. You can also leave a question here and we will reply.", actions: [], whatsapp: true, ask: true }) },
  { intent: "verify", test: /\b(verify|genuine|fake|real or fake|authentic|check (a|my|this) document|qr)\b/, reply: () => ({ intent: "verify", text: "You can check any Docufast document with its reference or QR code. No account needed.", actions: [{ label: "Verify a Docufast document", href: "/verify" }] }) },
  { intent: "notary", test: /\b(notari[sz]|notary|apostille)\b/, reply: () => ({ intent: "notary", text: "Online notarization is coming soon. Most offices in Nigeria accept an affidavit sworn before a Commissioner for Oaths, which we do today.", actions: [{ label: "Notarization (coming soon)", href: "/services/notarization" }, { label: "See affidavits", href: "/services/affidavits" }] }) },
  { intent: "typing", test: /\b(typing|type my|typist|data entry|excel|spreadsheet|transcri|audio to text|recording)\b/, reply: () => ({ intent: "typing", text: "We type, enter data and transcribe, and send you a clean Word or Excel file. No ID check needed.", actions: [va("document_typing", "Document typing"), va("data_entry", "Data entry"), va("transcription", "Transcription")] }) },
  { intent: "npc", test: /\b(npc|birth certificate|birth registration|register (a|my|the) (birth|baby|child)|attestation|death certificate|death notification)\b/, reply: () => NPC_ON
      ? { intent: "npc", text: "We help you complete your NPC application for birth and death records.", actions: [{ label: "Births and deaths (NPC)", href: "/services/npc" }] }
      : { intent: "npc", text: "Help with NPC birth and death applications is coming soon. Message us on WhatsApp if you need it now.", actions: [], whatsapp: true } },
  { intent: "trustees", test: /\b(ngo|church|mosque|association|foundation|club|incorporated trustees?|charity|non profit|nonprofit)\b/, reply: () => ({ intent: "trustees", text: "NGOs, churches and associations register with CAC as incorporated trustees. The price includes the newspaper notice CAC asks for.", actions: [cac("incorporated_trustees_registration", "Incorporated trustees registration")] }) },
  { intent: "annual_returns", test: /\b(annual returns?|returns|struck off|strike off|striking off|inactive|delist|penalt)/, reply: () => ({ intent: "annual_returns", text: "We file overdue CAC annual returns for every missed year, with CAC's penalties shown on your quote before you pay.", actions: [cac("cac_annual_returns", "CAC annual returns"), cac("cac_status_report", "CAC status report")] }) },
  { intent: "status_report", test: /\b(status report|cac search|company search|certified true cop|ctc|search report)\b/, reply: () => ({ intent: "status_report", text: "A CAC status report is the official record of your business: directors or owners, shareholders, address and filings. Banks and SCUML ask for it.", actions: [cac("cac_status_report", "CAC status report")] }) },
  { intent: "amendment", test: /\b(change (of )?(director|shareholder|secretary)|(company|registered|office) address|add (a )?director|remove (a )?director|increase share|share capital|amend)/, reply: () => ({ intent: "amendment", text: "We file company changes with CAC: directors, shareholders, address and share capital. A person checks the details before your final quote.", actions: [cac("company_amendment", "Changes to a company")] }) },
  { intent: "register_business", test: /\b(regist(er|ration)?|incorporat|business name|company|limited|ltd|enterprise|start (a|my) business|cac)\b/, reply: (t) => ({ intent: "register_business", text: /business name|enterprise|sole/.test(t)
      ? "A business name is the simplest way to register a small business with CAC."
      : "Business name or limited company? A business name is simpler; a limited company is a separate legal person, better if you want investors or contracts with big firms.", actions: [cac("business_name_registration", "Business name registration"), cac("company_incorporation", "Limited company"), cac("incorporated_trustees_registration", "NGO or church (incorporated trustees)")] }) },
  { intent: "loss", test: LOSS_WORDS, reply: lossReply },
  { intent: "newspaper", test: /\b(newspaper|publication|publish|notice|gazette|paper notice)\b/, reply: () => ({ intent: "newspaper", text: "We place change of name and loss notices in a national newspaper you choose, with the proof saved for you. The notice must match your sworn affidavit, so have it ready or order it first.", actions: [publication("name_change_publication", "Change of name notice"), publication("loss_of_documents_publication", "Loss of documents notice")] }) },
  { intent: "dob", test: /\b(date of birth|dob|age declaration|declaration of age|my age|wrong age|birthday)\b/, reply: () => ({ intent: "dob", text: "For a wrong or missing date of birth, choose the affidavit that fits.", actions: [affidavit("correction_of_dob", "Correction of date of birth"), affidavit("age_declaration_adult", "Age declaration (adult)"), affidavit("age_declaration_minor_male", "Age declaration for a son"), affidavit("age_declaration_minor_female", "Age declaration for a daughter")] }) },
  { intent: "name_correction", test: /\b(spel+(ing|t|ed)|wrong name|misspel|correct(ion)? (of )?(my )?name|name (is )?wrong|arrang|order of (my )?names?|two names|different names?|initials?)\b/, reply: () => ({ intent: "name_correction", text: "If your name is spelt wrongly, in the wrong order, or different on two documents, one of these affidavits will fix it.", actions: [affidavit("correction_of_name", "Correction of name"), affidavit("rearrangement_of_name", "Re-arrangement of name"), affidavit("confirmation_of_name", "Confirmation of name (two forms of one name)"), affidavit("combined_correction_name_dob", "Correct name and date of birth together")] }) },
  { intent: "change_of_name", test: /\b(change (of )?(my )?(sur)?name|new name|name change|married|marriage|wedding|maiden|husband s name|wan change|divorced and|revert)\b/, reply: (t) => ({ intent: "change_of_name", text: `${/married|marriage|wedding|husband/.test(t) ? "Congratulations. " : ""}Most offices ask for a change of name affidavit, and many also want a newspaper notice. Start with the affidavit; add the notice if the office asks for it.`, actions: [affidavit("change_of_name", "Change of name affidavit"), publication("name_change_publication", "Change of name newspaper notice")] }) },
  { intent: "single", test: /\b(bachelorhood|spinsterhood|single|not married|never married|unmarried)\b/, reply: () => ({ intent: "single", text: "Embassies and some employers ask for this to show you are not married.", actions: [affidavit("bachelorhood_spinsterhood", "Bachelorhood or spinsterhood")] }) },
  { intent: "marriage", test: /\b(divorce|dissolution|separat|declaration of marriage|proof of marriage|spouse)\b/, reply: () => ({ intent: "marriage", text: "Choose the affidavit that fits your marriage.", actions: [affidavit("declaration_of_marriage", "Declaration of marriage"), affidavit("dissolution_of_marriage", "Dissolution of marriage")] }) },
  { intent: "death", test: /\b(corpse|mortuary|morgue|burial|died|death|deceased)\b/, reply: () => ({ intent: "death", text: "We are sorry for your loss. Hospitals and mortuaries ask for this affidavit before they release a body to the family.", actions: [affidavit("release_of_corpse", "Release of corpse"), { label: "Talk to us on WhatsApp", href: WHATSAPP }] }) },
  { intent: "other_affidavit", test: /\b(residen|address change|change of address|new address|moved house|signature|car owner|vehicle owner|sold (my )?car|bought (a )?car|good conduct|character|sponsor|support letter|result|waec|neco|transcript)\b/, reply: (t) => {
      const a: ChatAction[] = [];
      if (/residen|address/.test(t)) a.push(affidavit("change_of_residence", "Change of residence"));
      if (/signature/.test(t)) a.push(affidavit("change_of_signature", "Change of signature"));
      if (/car|vehicle/.test(t)) a.push(affidavit("change_car_ownership", "Change of car ownership"));
      if (/conduct|character/.test(t)) a.push(affidavit("good_conduct", "Good conduct"));
      if (/sponsor|support/.test(t)) a.push(affidavit("support_sponsorship", "Support or sponsorship"));
      if (/result|waec|neco|transcript/.test(t)) a.push(affidavit("confirmation_of_result", "Confirmation of result"));
      return { intent: "other_affidavit", text: "This affidavit should fit. Open it to see the questions and your price.", actions: a };
    } },
  { intent: "affidavit", test: /\b(affidavit|swear|sworn|oath|commissioner)\b/, reply: () => ({ intent: "affidavit", text: "We prepare your affidavit and it is sworn through the Lagos court system. Which one do you need?", actions: [affidavit("change_of_name", "Change of name"), affidavit("loss_general", "Loss of items"), affidavit("age_declaration_adult", "Age declaration"), { label: "See all affidavits", href: "/services/affidavits" }] }) },
  { intent: "price", test: /\b(how much|price|cost|fee|charge|amount|kudi|owo|ego)\b/, reply: () => ({ intent: "price", text: "Most affidavits are NGN 4,000 (Express NGN 5,000). Newspaper notices NGN 10,000. Business name NGN 40,000. Tell me what you need and I will show the exact price.", actions: [{ label: "See all prices", href: "/faq" }] }) },
];

/** The chat's answer to what the customer typed. Pure and synchronous: answers on screen at once. */
export function replyTo(input: string, prices: PriceNotes = {}): ChatReply {
  PRICES = prices;
  const t = normalise(input);
  if (!t) return { intent: "empty", text: "Tell me what you need in a few words.", actions: [] };
  // Loss is checked before name and business rules, so "I lost my company papers" is a loss.
  if (LOSS_WORDS.test(t) && !/\b(change|newspaper|notice)\b/.test(t)) return lossReply(t);
  for (const r of RULES) if (r.test.test(t)) {
    const reply = r.reply(t);
    if (reply.actions.length || reply.ask || reply.whatsapp || reply.intent === "greeting") return reply;
  }
  return {
    intent: "unknown",
    text: "I could not match that to a service. Ask us your question and a person will reply, or see all our services.",
    actions: [ALL_SERVICES],
    ask: true,
    whatsapp: true,
  };
}
