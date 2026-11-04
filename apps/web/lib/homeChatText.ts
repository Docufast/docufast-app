// lib/homeChatText.ts
// The small part of the home screen chat that draws the screen: quick replies, greeting, languages
// and screen text. Split from lib/homeChat.ts (test report D11, 4 Nov 2026) so the homepage ships
// only this at first; the matching rules load when the customer first sends a message.
// lib/homeChat.ts re-exports everything here, so other code and the tests can keep importing it.

// ---- Quick replies on the home screen (Blueprint A1) --------------------------------------------
export const QUICK_REPLIES: { label: string; hint: string; query: string; href: string }[] = [
  { label: "Change of name", hint: "Affidavit", query: "change of name", href: "/services/affidavits/change_of_name" },
  { label: "I lost a document", hint: "Affidavit of loss", query: "I lost a document", href: "/services/affidavits" },
  { label: "Newspaper notice", hint: "Name or loss notice", query: "newspaper notice", href: "/services/publications" },
  { label: "Register my business", hint: "CAC", query: "register my business", href: "/services/cac" },
  { label: "CAC annual returns", hint: "File missed years", query: "annual returns", href: "/services/cac/cac_annual_returns" },
  { label: "Something else", hint: "See all services", query: "", href: "/services" },
];

/** "Good morning" etc. in Lagos time. */
export function greeting(now = new Date()): string {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Africa/Lagos" }).format(now));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

// ---- Languages (Playbook 18.2) ------------------------------------------------------------------
// English is live. Pidgin, Yoruba, Hausa and Igbo switch on per language with
// NEXT_PUBLIC_CHAT_LANGUAGES (e.g. "en,pcm") only after native speakers have checked every line
// (#120): no machine-only translation reaches customers. The chat already understands common
// Pidgin phrases in what customers type.
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "pcm", label: "Pidgin" },
  { code: "yo", label: "Yorùbá" },
  { code: "ha", label: "Hausa" },
  { code: "ig", label: "Igbo" },
] as const;
export type LangCode = (typeof LANGUAGES)[number]["code"];

export function enabledLanguages(env = process.env.NEXT_PUBLIC_CHAT_LANGUAGES): LangCode[] {
  const on = (env || "en").split(",").map((s) => s.trim()).filter(Boolean);
  const valid = LANGUAGES.map((l) => l.code).filter((c) => on.includes(c));
  return valid.includes("en") ? valid : ["en", ...valid];
}

/** Screen text, by language. Only English is filled; the others come from the reviewed #120 sheet. */
export const UI_TEXT: Record<LangCode, Partial<Record<UiKey, string>>> = {
  en: {
    ask_prompt: "What do you need today?",
    placeholder: "Type what you need, e.g. I lost my SIM",
    send: "Send",
    you: "You",
    docufast: "Docufast",
    start_again: "Start again",
    soon: "coming soon",
    privacy: "What you type here stays on your phone. Never type your NIN, BVN or card details in the chat.",
    whatsapp: "Chat on WhatsApp",
    open: "Open",
  },
  pcm: {},
  yo: {},
  ha: {},
  ig: {},
};
export type UiKey = "ask_prompt" | "placeholder" | "send" | "you" | "docufast" | "start_again" | "soon" | "privacy" | "whatsapp" | "open";
export function ui(lang: LangCode, key: UiKey): string {
  return UI_TEXT[lang]?.[key] ?? UI_TEXT.en[key] ?? key;
}
