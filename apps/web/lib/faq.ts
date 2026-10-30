// lib/faq.ts
// The website FAQ, copied word for word from the master Google Doc "Docufast Website FAQs"
// (draft updated 13 October 2026, Ajibola Adeboye). The Doc is the single source: change an
// answer in the Doc first, then here. /faq renders only status "live" items, and the FAQPage
// structured data is built from the same items, so the page and the markup always match.
//
// status "hold": not published. The reason is in `hold`. Flip to "live" once it is settled.
// gate: the platform feature this answer describes. It must be built before the site opens
// to search (SITE_INDEXABLE=true).

export type FaqItem = {
  id: string;
  section: number;
  q: string;
  a: string[];
  list?: 'ol' | 'ul';
  status: 'live' | 'hold';
  hold?: string;
  gate?: string;
};

export const FAQ_SECTIONS: { n: number; title: string }[] = [
  {
    "n": 1,
    "title": "About Docufast and trust"
  },
  {
    "n": 2,
    "title": "How it works"
  },
  {
    "n": 3,
    "title": "Affidavits"
  },
  {
    "n": 4,
    "title": "Change of name"
  },
  {
    "n": 5,
    "title": "Newspaper publications"
  },
  {
    "n": 6,
    "title": "Lost documents and SIM cards"
  },
  {
    "n": 7,
    "title": "CAC registration"
  },
  {
    "n": 8,
    "title": "CAC annual returns and compliance"
  },
  {
    "n": 9,
    "title": "Pricing and payment"
  },
  {
    "n": 10,
    "title": "Account, sign-in and recovery code"
  },
  {
    "n": 11,
    "title": "The vault and your documents"
  },
  {
    "n": 12,
    "title": "Verify Docufast and fraud"
  },
  {
    "n": 13,
    "title": "Privacy and data protection"
  },
  {
    "n": 14,
    "title": "Timelines, problems and complaints"
  },
  {
    "n": 15,
    "title": "Businesses, agents and partners"
  },
  {
    "n": 16,
    "title": "New and coming services"
  },
  {
    "n": 17,
    "title": "Languages"
  },
  {
    "n": 18,
    "title": "Phones, data and network"
  },
  {
    "n": 19,
    "title": "Identity, credentials and people acting for you"
  }
];

export const FAQ: FaqItem[] = [
  {
    "id": "what-is-docufast",
    "section": 1,
    "q": "What is Docufast?",
    "a": [
      "Docufast is an online platform for documents and compliance in Nigeria. We prepare affidavits, place newspaper publications, handle CAC registration and filings, and keep your finished documents in a secure vault. You tell us what you need in plain words, and we do the paperwork."
    ],
    "status": "live"
  },
  {
    "id": "who-is-behind-docufast",
    "section": 1,
    "q": "Who is behind Docufast?",
    "a": [
      "Docufast Integrated Services Ltd, a Nigerian company founded by Ajibola Adeboye, with its registered office at Suite 100, Adebola House, 38 Opebi Road, Ikeja, Lagos. We work online only, with no walk-ins."
    ],
    "status": "live"
  },
  {
    "id": "is-docufast-a-registered-company",
    "section": 1,
    "q": "Is Docufast a registered company?",
    "a": [
      "Yes. Docufast Integrated Services Ltd is CAC registered (RC 1893484), SCUML registered (SC251840209), NDPC registered (NDPC/DCP/07770) and SMEDAN registered. You can check our CAC record yourself on the CAC public search."
    ],
    "status": "live"
  },
  {
    "id": "is-docufast-legit-or-is-this-a-scam",
    "section": 1,
    "q": "Is Docufast legit, or is this a scam?",
    "a": [
      "It is a fair question, and you should ask it of any online service. Check our registration numbers, pay only on docufast.ng, and use Verify Docufast to confirm any document we issue is genuine. We never ask you to pay into a personal account."
    ],
    "status": "live"
  },
  {
    "id": "is-docufast-a-law-firm",
    "section": 1,
    "q": "Is Docufast a law firm?",
    "a": [
      "No. Docufast is a document and compliance services company. We prepare and process documents, but we do not give legal advice or represent you in court. If your situation needs a lawyer, we will tell you."
    ],
    "status": "live"
  },
  {
    "id": "do-you-serve-people-outside-lagos",
    "section": 1,
    "q": "Do you serve people outside Lagos?",
    "a": [
      "CAC services, publications and the vault work anywhere in Nigeria and abroad. Affidavits are currently sworn in Lagos and accepted nationwide for most purposes. [CONFIRM: any purposes or states where a Lagos affidavit is not accepted.]"
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "can-nigerians-abroad-use-docufast",
    "section": 1,
    "q": "Can Nigerians abroad use Docufast?",
    "a": [
      "Yes, for CAC registration, filings, publications and the vault. Some affidavits need you to appear before a commissioner for oaths, so we confirm what is possible for your case before you pay. Remote notarization for diaspora clients is coming soon."
    ],
    "status": "live"
  },
  {
    "id": "how-does-docufast-work",
    "section": 2,
    "q": "How does Docufast work?",
    "a": [
      "Tell us what you need in the chat on docufast.ng, in English, Pidgin, Yorùbá, Hausa or Igbo, or start on WhatsApp.",
      "Get your itemised price on screen within 1 minute, fixed once you accept.",
      "Add your photo and documents, and verify your identity where the service needs it.",
      "Create your account and pay, only on docufast.ng.",
      "We prepare and process your documents, and a person checks every one. You follow each step on your order tracker.",
      "Your finished documents arrive in your vault, digitally signed and QR-sealed so anyone can confirm they are genuine."
    ],
    "status": "live",
    "list": "ol",
    "gate": "chat-and-quote"
  },
  {
    "id": "do-i-need-to-visit-a-court-or-cac-office",
    "section": 2,
    "q": "Do I need to visit a court or CAC office?",
    "a": [
      "No, for most services. We handle the court, the newspaper and the CAC portal for you. If your case needs you in person, we tell you before you pay."
    ],
    "status": "live",
    "gate": "chat-and-quote"
  },
  {
    "id": "am-i-talking-to-a-robot-in-the-chat",
    "section": 2,
    "q": "Am I talking to a robot in the chat?",
    "a": [
      "The homepage chat gives guided answers to common questions and helps you find the right service. A person checks every document before it reaches you, and you can talk to our team on WhatsApp at any point."
    ],
    "status": "live",
    "gate": "chat-and-quote"
  },
  {
    "id": "what-if-i-don-t-know-which-document-i-need",
    "section": 2,
    "q": "What if I don't know which document I need?",
    "a": [
      "Type your situation in plain words, such as \"my name is spelled wrong on my certificate\" or \"I lost my SIM\". The chat points you to the right service. If it can't, our team will help on WhatsApp."
    ],
    "status": "live",
    "gate": "chat-and-quote"
  },
  {
    "id": "can-i-talk-to-a-person",
    "section": 2,
    "q": "Can I talk to a person?",
    "a": [
      "Yes. Message us on WhatsApp at 0905 495 1918, Monday to Friday, 8am to 6pm WAT."
    ],
    "status": "live",
    "gate": "chat-and-quote"
  },
  {
    "id": "do-i-need-an-account",
    "section": 2,
    "q": "Do I need an account?",
    "a": [
      "You can chat and get a quote without one. You create an account when you pay, because your account is where your order is tracked and your documents are delivered."
    ],
    "status": "live",
    "gate": "chat-and-quote"
  },
  {
    "id": "how-do-i-track-my-order",
    "section": 2,
    "q": "How do I track my order?",
    "a": [
      "Sign in to see every step of your order with a time on each one. We also message you when anything changes."
    ],
    "status": "live",
    "gate": "chat-and-quote"
  },
  {
    "id": "what-is-an-affidavit",
    "section": 3,
    "q": "What is an affidavit?",
    "a": [
      "A written statement you swear is true, signed before a commissioner for oaths. Banks, schools, embassies, NIMC, telecoms and employers ask for affidavits to confirm things like your name, age or a lost document."
    ],
    "status": "live"
  },
  {
    "id": "can-i-get-an-affidavit-online-in-nigeria",
    "section": 3,
    "q": "Can I get an affidavit online in Nigeria?",
    "a": [
      "Yes. Request it on docufast.ng or WhatsApp. We prepare the affidavit, a person checks it, and it is sworn before a commissioner for oaths. The finished affidavit is delivered to your vault."
    ],
    "status": "live"
  },
  {
    "id": "which-affidavits-can-docufast-prepare",
    "section": 3,
    "q": "Which affidavits can Docufast prepare?",
    "a": [
      "Name: change, correction, confirmation, addition or removal, re-arrangement, and combined correction of name and date of birth",
      "Birth and age: age declaration (adults and minors), correction of date of birth, attestation of birth certificate",
      "Loss: general loss, workplace ID, SIM card, JAMB profile SIM, international passport, driver's licence, vehicle documents",
      "Marriage: bachelorhood or spinsterhood, declaration of marriage, dissolution of marriage",
      "Death: declaration of death, release of corpse",
      "Student: loss of school ID, confirmation of result, good conduct, support or sponsorship",
      "Status: change of car ownership, change of residence, change of signature"
    ],
    "status": "live",
    "list": "ul"
  },
  {
    "id": "do-i-need-to-appear-in-person-to-swear",
    "section": 3,
    "q": "Do I need to appear in person to swear?",
    "a": [
      "[CONFIRM with Sheriff: how swearing works through the court's e-affidavit channel, and when a physical appearance is required.]"
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "is-an-online-affidavit-valid-and-accepted",
    "section": 3,
    "q": "Is an online affidavit valid and accepted?",
    "a": [
      "Your affidavit is a proper court affidavit, sworn before a commissioner for oaths. It carries a QR code so anyone receiving it can confirm it is genuine. If an organisation has special rules, tell us and we will check before you pay."
    ],
    "status": "live"
  },
  {
    "id": "how-long-does-an-affidavit-take",
    "section": 3,
    "q": "How long does an affidavit take?",
    "a": [
      "Standard affidavits are delivered within 2 to 3 working days of a confirmed order with everything we need. Express affidavits are delivered the same day when the order is confirmed before 2 PM on a working day."
    ],
    "status": "live"
  },
  {
    "id": "what-do-i-need-to-provide",
    "section": 3,
    "q": "What do I need to provide?",
    "a": [
      "Usually a valid ID (NIN slip, international passport, driver's licence or voter's card) and the details the affidavit states. We confirm the exact list for your case before you pay."
    ],
    "status": "live"
  },
  {
    "id": "can-i-get-an-affidavit-for-my-child",
    "section": 3,
    "q": "Can I get an affidavit for my child?",
    "a": [
      "Yes. Age declarations and other affidavits for minors are sworn by a parent or guardian, and we verify the guardian's identity (NIN or BVN)."
    ],
    "status": "live"
  },
  {
    "id": "what-if-the-details-in-my-affidavit-are-wrong",
    "section": 3,
    "q": "What if the details in my affidavit are wrong?",
    "a": [
      "Check the draft carefully before it is sworn. If we made the mistake, we fix it free. If the information you gave was wrong, a new affidavit is needed at the standard price."
    ],
    "status": "live"
  },
  {
    "id": "how-do-i-change-my-name-in-nigeria",
    "section": 4,
    "q": "How do I change my name in Nigeria?",
    "a": [
      "Most name changes use two documents: a sworn change of name affidavit and a change of name notice in a national newspaper. Docufast handles both in one order. The rules are changing, so we confirm what your case needs before you pay."
    ],
    "status": "hold",
    "hold": "change of name, waiting on Sheriff (#147)"
  },
  {
    "id": "i-just-got-married-how-do-i-take-my-husband-s-name",
    "section": 4,
    "q": "I just got married. How do I take my husband's name?",
    "a": [
      "Order a change of name affidavit and publication, and have your marriage certificate ready. We will tell you if your bank or employer asks for anything extra."
    ],
    "status": "hold",
    "hold": "change of name, waiting on Sheriff (#147)"
  },
  {
    "id": "my-name-is-spelled-differently-on-my-documents-what-do-i-do",
    "section": 4,
    "q": "My name is spelled differently on my documents. What do I do?",
    "a": [
      "A correction of name or confirmation of name affidavit states that the different spellings belong to the same person. Tell us which documents differ and we will advise which one you need."
    ],
    "status": "hold",
    "hold": "change of name, waiting on Sheriff (#147)"
  },
  {
    "id": "do-i-need-a-newspaper-publication-for-a-change-of-name",
    "section": 4,
    "q": "Do I need a newspaper publication for a change of name?",
    "a": [
      "Usually yes. Many banks, embassies and government agencies ask for both the affidavit and the newspaper notice. [CONFIRM with Sheriff: current position on newspaper publication versus deed poll.]"
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "is-a-newspaper-publication-still-enough-to-change-my-name-le",
    "section": 4,
    "q": "Is a newspaper publication still enough to change my name legally?",
    "a": [
      "Recent reports suggest the rules are tightening. We keep track of what NIMC, banks and the passport office accept, and we tell you what your case needs before you pay."
    ],
    "status": "hold",
    "hold": "change of name, waiting on Sheriff (#147)"
  },
  {
    "id": "after-the-affidavit-and-publication-how-do-i-update-my-nin-b",
    "section": 4,
    "q": "After the affidavit and publication, how do I update my NIN, bank and passport?",
    "a": [
      "Take your affidavit and the newspaper proof (both in your vault) to each organisation. Each has its own process and fees. We can tell you what each one usually asks for."
    ],
    "status": "hold",
    "hold": "change of name, waiting on Sheriff (#147)"
  },
  {
    "id": "can-i-change-my-child-s-name",
    "section": 4,
    "q": "Can I change my child's name?",
    "a": [
      "Yes. The parent or guardian swears the affidavit, and we verify the guardian's identity."
    ],
    "status": "hold",
    "hold": "change of name, waiting on Sheriff (#147)"
  },
  {
    "id": "what-notices-can-docufast-publish",
    "section": 5,
    "q": "What notices can Docufast publish?",
    "a": [
      "Change of name, loss of documents, and incorporated trustees (NGO, church and association) notices in national daily newspapers."
    ],
    "status": "live"
  },
  {
    "id": "i-already-have-an-affidavit-can-i-just-do-the-publication",
    "section": 5,
    "q": "I already have an affidavit. Can I just do the publication?",
    "a": [
      "Yes. Send us your affidavit with your request. A person checks it first, because the newspaper notice must match your affidavit word for word. If your affidavit can't be used, we tell you before you pay and offer to prepare a fresh one in the same order."
    ],
    "status": "live"
  },
  {
    "id": "i-don-t-have-an-affidavit-yet-what-happens",
    "section": 5,
    "q": "I don't have an affidavit yet. What happens?",
    "a": [
      "We prepare and swear the affidavit, then place the newspaper notice, all in one order. Both documents arrive in your vault."
    ],
    "status": "live"
  },
  {
    "id": "which-newspaper-will-my-notice-appear-in",
    "section": 5,
    "q": "Which newspaper will my notice appear in?",
    "a": [
      "You choose. Your quote lists the national dailies we publish in, each with its price, and you pick one. If an organisation asks for a specific newspaper, choose that one."
    ],
    "status": "live"
  },
  {
    "id": "how-long-does-publication-take",
    "section": 5,
    "q": "How long does publication take?",
    "a": [
      "Usually 24 to 72 hours after your order is confirmed, depending on the newspaper's publication days."
    ],
    "status": "live"
  },
  {
    "id": "how-do-i-get-proof-of-publication",
    "section": 5,
    "q": "How do I get proof of publication?",
    "a": [
      "We deliver a copy of the published notice to your vault, ready to download and share."
    ],
    "status": "live"
  },
  {
    "id": "what-if-my-notice-is-published-with-a-mistake",
    "section": 5,
    "q": "What if my notice is published with a mistake?",
    "a": [
      "If the mistake is ours, we republish at no cost. Check the wording we show you before it goes to the paper."
    ],
    "status": "live"
  },
  {
    "id": "i-lost-my-document-what-do-i-need-to-replace-it",
    "section": 6,
    "q": "I lost my document. What do I need to replace it?",
    "a": [
      "Most replacements need an affidavit of loss, and some also need a loss notice in a newspaper. Tell us what you lost and who is replacing it, and we will prepare what they ask for."
    ],
    "status": "live"
  },
  {
    "id": "do-i-need-a-police-report",
    "section": 6,
    "q": "Do I need a police report?",
    "a": [
      "Some organisations ask for one, especially for international passports. We prepare the affidavit; the police report must come from the police. [CONFIRM which replacements need a police report.]"
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "i-lost-my-sim-card-what-do-i-need",
    "section": 6,
    "q": "I lost my SIM card. What do I need?",
    "a": [
      "Your network usually asks for an affidavit of loss of SIM card and a valid ID. We prepare the affidavit, and you take it to your network's office for the replacement."
    ],
    "status": "live"
  },
  {
    "id": "i-lost-my-sim-and-i-have-no-valid-id-can-you-help",
    "section": 6,
    "q": "I lost my SIM and I have no valid ID. Can you help?",
    "a": [
      "Yes, but we must carry out extra identity checks first. These are required by anti-money laundering rules, and they may take a little longer."
    ],
    "status": "live"
  },
  {
    "id": "i-lost-my-international-passport-can-you-help",
    "section": 6,
    "q": "I lost my international passport. Can you help?",
    "a": [
      "We prepare the affidavit of loss. The replacement itself is handled by the Nigeria Immigration Service."
    ],
    "status": "live"
  },
  {
    "id": "can-i-order-for-a-family-member",
    "section": 6,
    "q": "Can I order for a family member?",
    "a": [
      "Yes, but the affidavit is sworn by the person who lost the document. We verify their identity during the order."
    ],
    "status": "live"
  },
  {
    "id": "should-i-register-a-business-name-or-a-limited-company",
    "section": 7,
    "q": "Should I register a business name or a limited company?",
    "a": [
      "A business name suits a sole trader or partnership: simple, but you are personally liable for the business. A private limited company (Ltd) is a separate legal entity, which protects your personal assets and is usually needed for larger contracts, investors and some licences. Not sure? Tell us about your business and we will explain the options."
    ],
    "status": "live"
  },
  {
    "id": "how-do-i-register-a-business-name-with-cac-online",
    "section": 7,
    "q": "How do I register a business name with CAC online?",
    "a": [
      "Send us your proposed business names, a valid ID and your address. We run the name search, file with the Corporate Affairs Commission and deliver your certificate to your vault."
    ],
    "status": "live"
  },
  {
    "id": "what-do-i-need-to-register-a-company",
    "section": 7,
    "q": "What do I need to register a company?",
    "a": [
      "Proposed company names, details and ID for each director and shareholder, the share capital, your business address and what the company will do. We ask for share capital first because it affects the CAC fee and stamp duty."
    ],
    "status": "live"
  },
  {
    "id": "can-you-register-an-ngo-church-or-association",
    "section": 7,
    "q": "Can you register an NGO, church or association?",
    "a": [
      "Yes, as incorporated trustees. This includes the newspaper publication CAC requires. We guide you through trustees, constitution and other requirements."
    ],
    "status": "live"
  },
  {
    "id": "why-do-you-check-my-identity-before-a-cac-order",
    "section": 7,
    "q": "Why do you check my identity before a CAC order?",
    "a": [
      "Anti-money laundering rules require us to verify the identity of anyone we file for. It is a quick check with your NIN or BVN and a selfie, and it happens before you pay so you never pay for an order we can't file. Every director named on the filing verifies too: we send each one a link by SMS or WhatsApp, and payment opens once everyone is done. Verified with us before? You can reuse that check with your consent."
    ],
    "status": "live"
  },
  {
    "id": "how-long-does-cac-registration-take",
    "section": 7,
    "q": "How long does CAC registration take?",
    "a": [
      "It depends on CAC's processing times, which vary. We file promptly and update you at every step. [ADD typical ranges once we have real order data.]"
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "what-do-i-receive",
    "section": 7,
    "q": "What do I receive?",
    "a": [
      "Your certificate and registration documents, delivered to your vault. Your company's annual return reminders are switched on automatically."
    ],
    "status": "live"
  },
  {
    "id": "can-you-change-directors-address-or-shares-after-registratio",
    "section": 7,
    "q": "Can you change directors, address or shares after registration?",
    "a": [
      "Yes. We handle company amendments, including directors, registered address, name and share capital. CAC fees for each change are shown on your quote."
    ],
    "status": "live"
  },
  {
    "id": "what-are-cac-annual-returns",
    "section": 8,
    "q": "What are CAC annual returns?",
    "a": [
      "A yearly filing every registered business name, company and incorporated trustee must make with CAC, even if the business did not trade that year."
    ],
    "status": "live"
  },
  {
    "id": "what-happens-if-i-don-t-file-annual-returns",
    "section": 8,
    "q": "What happens if I don't file annual returns?",
    "a": [
      "Late filing attracts penalties for each year missed. Businesses that stay out of compliance can be marked inactive, which blocks other CAC filings, and can eventually be struck off the register."
    ],
    "status": "live"
  },
  {
    "id": "i-m-several-years-behind-can-you-help",
    "section": 8,
    "q": "I'm several years behind. Can you help?",
    "a": [
      "Yes. We check your status, file every outstanding year, and pay CAC fees and penalties on your behalf. Your quote shows each year and each penalty separately."
    ],
    "status": "live"
  },
  {
    "id": "how-do-i-check-if-my-company-is-in-good-standing",
    "section": 8,
    "q": "How do I check if my company is in good standing?",
    "a": [
      "Use Check my company on our homepage. Share your RC or BN number and we check your CAC status, annual returns and strike-off risk, then tell you what is due. The check is free. A director, the company secretary, or someone acting for the company with a signed authorisation letter can then order the fix."
    ],
    "status": "live"
  },
  {
    "id": "can-docufast-remind-me-before-my-deadlines",
    "section": 8,
    "q": "Can Docufast remind me before my deadlines?",
    "a": [
      "Yes. We remind you 90 days before your CAC annual returns and other filing dates: by email on every plan, and by WhatsApp and email on Vault Business. You can also switch on auto-file, and we prepare your CAC annual return when it falls due and file it once you approve the quote."
    ],
    "status": "live"
  },
  {
    "id": "do-you-file-taxes-too",
    "section": 8,
    "q": "Do you file taxes too?",
    "a": [
      "Not yet. Our reminders cover tax dates, but tax filing is not one of our services today. [CONFIRM whether FIRS/LIRS filing is on the roadmap.]"
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "how-much-does-it-cost",
    "section": 9,
    "q": "How much does it cost?",
    "a": [
      "Each service has a fixed price, shown on screen before you pay. [ADD price list or \"from\" prices once set.]"
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "are-government-fees-included",
    "section": 9,
    "q": "Are government fees included?",
    "a": [
      "For affidavits, publications, business names, companies and incorporated trustees, yes: one all-inclusive price. For annual returns, amendments and status reports, CAC fees and any penalties are shown as separate lines on your quote, because they differ for each business."
    ],
    "status": "live",
    "gate": "payments"
  },
  {
    "id": "are-there-hidden-charges",
    "section": 9,
    "q": "Are there hidden charges?",
    "a": [
      "No. The total on your quote is what you pay. If anything changes before you pay, you get a new quote."
    ],
    "status": "live",
    "gate": "payments"
  },
  {
    "id": "how-long-is-a-quote-valid",
    "section": 9,
    "q": "How long is a quote valid?",
    "a": [
      "48 hours. After that, ask for a fresh quote in the chat, because government fees can change."
    ],
    "status": "live",
    "gate": "payments"
  },
  {
    "id": "how-do-i-pay",
    "section": 9,
    "q": "How do I pay?",
    "a": [
      "Only on docufast.ng, by card, bank transfer, USSD or Pay with Bank. If you chat with us on WhatsApp, we send you a link to your quote on docufast.ng."
    ],
    "status": "live",
    "gate": "payments"
  },
  {
    "id": "can-i-pay-into-a-docufast-staff-member-s-account",
    "section": 9,
    "q": "Can I pay into a Docufast staff member's account?",
    "a": [
      "No, never. Docufast never asks you to pay into a personal account, and our WhatsApp team will never send you bank details. If anyone does, do not pay, and report it to us."
    ],
    "status": "live",
    "gate": "payments"
  },
  {
    "id": "is-it-safe-to-pay-on-docufast-ng",
    "section": 9,
    "q": "Is it safe to pay on docufast.ng?",
    "a": [
      "Yes. Payments are processed by a licensed payment provider. Docufast never sees or stores your card number."
    ],
    "status": "live",
    "gate": "payments"
  },
  {
    "id": "will-i-get-a-receipt",
    "section": 9,
    "q": "Will I get a receipt?",
    "a": [
      "Yes. A receipt is emailed to you and saved in your account as soon as payment is confirmed."
    ],
    "status": "live",
    "gate": "payments"
  },
  {
    "id": "can-i-get-a-refund",
    "section": 9,
    "q": "Can I get a refund?",
    "a": [
      "[REFUND POLICY: proposed wording for Sheriff: full refund if we cannot start your order; partial refund once work has started, less government fees and costs already paid; no refund once a document is sworn, filed or published.]"
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "do-you-offer-discounts",
    "section": 9,
    "q": "Do you offer discounts?",
    "a": [
      "Bundles such as the Change of name pack cost less than ordering each service separately. Businesses placing 10 or more orders a month can ask about a corporate account."
    ],
    "status": "hold",
    "hold": "mentions the change of name pack (#147)"
  },
  {
    "id": "do-prices-include-vat",
    "section": 9,
    "q": "Do prices include VAT?",
    "a": [
      "Yes. The price on your quote includes VAT."
    ],
    "status": "live"
  },
  {
    "id": "when-do-i-create-an-account",
    "section": 10,
    "q": "When do I create an account?",
    "a": [
      "When you pay for your first order. Chatting and getting a quote need no account."
    ],
    "status": "live",
    "gate": "accounts-2fa-recovery"
  },
  {
    "id": "why-do-i-need-two-step-sign-in",
    "section": 10,
    "q": "Why do I need two-step sign-in?",
    "a": [
      "Your account holds legal documents and ID. Two-step sign-in means someone who steals your password still cannot get in. Every Docufast account uses it."
    ],
    "status": "live",
    "gate": "accounts-2fa-recovery"
  },
  {
    "id": "what-is-two-step-sign-in",
    "section": 10,
    "q": "What is two-step sign-in?",
    "a": [
      "After your password, you enter a 6-digit code from an authenticator app such as Google Authenticator, or a code we send by SMS."
    ],
    "status": "live",
    "gate": "accounts-2fa-recovery"
  },
  {
    "id": "what-is-a-recovery-code",
    "section": 10,
    "q": "What is a recovery code?",
    "a": [
      "A spare key to your vault, shown once when you create your account. Files you upload are locked with a key only you hold. If you forget your password, the recovery code is the only way to open them."
    ],
    "status": "live",
    "gate": "accounts-2fa-recovery"
  },
  {
    "id": "what-happens-if-i-lose-my-recovery-code",
    "section": 10,
    "q": "What happens if I lose my recovery code?",
    "a": [
      "You can still reset your password and use your account. But files you uploaded yourself cannot be opened again, by you or by us. Documents Docufast prepared for you can be re-issued after an identity check, for a fee based on your Vault plan."
    ],
    "status": "live",
    "gate": "accounts-2fa-recovery"
  },
  {
    "id": "why-can-t-docufast-just-reset-it-for-me",
    "section": 10,
    "q": "Why can't Docufast just reset it for me?",
    "a": [
      "Because we never hold your key. That is what keeps your uploads private, even from our own staff. The trade-off is that only you can recover them."
    ],
    "status": "live",
    "gate": "accounts-2fa-recovery"
  },
  {
    "id": "where-should-i-keep-my-recovery-code",
    "section": 10,
    "q": "Where should I keep my recovery code?",
    "a": [
      "Somewhere safe and offline: printed in a file at home, or in a password manager. Do not keep it only on the phone you sign in with."
    ],
    "status": "live",
    "gate": "accounts-2fa-recovery"
  },
  {
    "id": "i-forgot-my-password-what-do-i-do",
    "section": 10,
    "q": "I forgot my password. What do I do?",
    "a": [
      "Tap \"Forgot password?\" on the sign-in page. We send a reset link to your email or phone. To keep access to your uploaded files, you will also need your recovery code."
    ],
    "status": "live",
    "gate": "accounts-2fa-recovery"
  },
  {
    "id": "i-changed-my-phone-how-do-i-sign-in",
    "section": 10,
    "q": "I changed my phone. How do I sign in?",
    "a": [
      "Use the SMS code option, or your recovery code, to sign in and set up your authenticator app again. [CONFIRM the device-change flow with Olamide.]"
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "can-i-use-whatsapp-to-sign-in",
    "section": 10,
    "q": "Can I use WhatsApp to sign in?",
    "a": [
      "No. WhatsApp is for support and updates only. Sign-in always happens on docufast.ng."
    ],
    "status": "live",
    "gate": "accounts-2fa-recovery"
  },
  {
    "id": "can-i-have-a-personal-and-a-business-account",
    "section": 10,
    "q": "Can I have a personal and a business account?",
    "a": [
      "One account holds both. Your vault has separate Personal and Business sections, and each business has its own deadline reminders."
    ],
    "status": "live",
    "gate": "accounts-2fa-recovery"
  },
  {
    "id": "what-is-the-docufast-vault",
    "section": 11,
    "q": "What is the Docufast vault?",
    "a": [
      "Your private, encrypted space for every document we deliver and any files you choose to upload. You can view, download and share them from any device."
    ],
    "status": "live",
    "gate": "vault"
  },
  {
    "id": "is-the-vault-free",
    "section": 11,
    "q": "Is the vault free?",
    "a": [
      "Every document we deliver is stored free for 30 days. To keep documents longer, choose a Vault plan: Personal [PRICE]/year or Business [PRICE]/year per business."
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "what-happens-after-the-30-free-days",
    "section": 11,
    "q": "What happens after the 30 free days?",
    "a": [
      "We remind you 7 days and 1 day before. If you don't choose a plan, the file is deleted. Its verification record stays, so anyone holding a printed copy can still confirm it is genuine. Download your documents before the 30 days end."
    ],
    "status": "live",
    "gate": "vault"
  },
  {
    "id": "what-s-the-difference-between-personal-and-business",
    "section": 11,
    "q": "What's the difference between Personal and Business?",
    "a": [
      "Both keep your documents for as long as your plan is active. Vault Business adds WhatsApp deadline reminders for that business and includes free re-issues each year."
    ],
    "status": "live",
    "gate": "vault"
  },
  {
    "id": "who-can-see-my-documents",
    "section": 11,
    "q": "Who can see my documents?",
    "a": [
      "Only you. Files you upload are encrypted with a key only you hold. Documents we prepare are handled only by the staff working on your order, then sealed into your vault."
    ],
    "status": "live",
    "gate": "vault"
  },
  {
    "id": "how-do-i-share-a-document-with-my-bank-or-employer",
    "section": 11,
    "q": "How do I share a document with my bank or employer?",
    "a": [
      "We recommend sending the verification link. They confirm your document is genuine without receiving a copy. If they need more, share the document as a credential: you choose what they can see, the link ends after 1, 3 or 7 days, and you can cancel it anytime. Every open is logged."
    ],
    "status": "live",
    "gate": "vault"
  },
  {
    "id": "can-i-see-who-opened-my-documents",
    "section": 11,
    "q": "Can I see who opened my documents?",
    "a": [
      "Yes. The activity log shows every view, download and share, and when a verification link was opened."
    ],
    "status": "live",
    "gate": "vault"
  },
  {
    "id": "can-i-get-a-copy-of-a-document-again-if-i-lose-access",
    "section": 11,
    "q": "Can I get a copy of a document again if I lose access?",
    "a": [
      "Yes, for documents Docufast prepared. After an identity check, we re-issue them for a fee based on your Vault plan: [PRICE] with no plan, [PRICE] on Personal, and free re-issues each year on Business. Files you uploaded yourself cannot be re-issued."
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "can-i-upload-my-own-documents",
    "section": 11,
    "q": "Can I upload my own documents?",
    "a": [
      "Yes. Keep your ID, old certificates and other papers in one place. Only you can open them."
    ],
    "status": "live",
    "gate": "vault"
  },
  {
    "id": "can-i-delete-my-documents",
    "section": 11,
    "q": "Can I delete my documents?",
    "a": [
      "Yes, at any time from your vault. Deleted files cannot be recovered. [CONFIRM what records Docufast must keep by law after deletion.]"
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "how-do-i-know-a-docufast-document-is-real",
    "section": 12,
    "q": "How do I know a Docufast document is real?",
    "a": [
      "Every document we deliver carries a QR code and a reference number. Scan the code, or enter the reference at docufast.ng/verify, to see the document type and issue date, that Docufast's digital signature is valid, and that the document has not been revoked. Banks and agencies can also check it automatically through our API."
    ],
    "status": "live",
    "gate": "verify"
  },
  {
    "id": "does-the-verification-page-show-my-personal-details",
    "section": 12,
    "q": "Does the verification page show my personal details?",
    "a": [
      "No. It confirms the document is genuine and when it was issued. It never shows the content of the document."
    ],
    "status": "live",
    "gate": "verify"
  },
  {
    "id": "i-m-a-bank-employer-or-embassy-do-i-need-an-account-to-verif",
    "section": 12,
    "q": "I'm a bank, employer or embassy. Do I need an account to verify?",
    "a": [
      "No. Verification is free and open to anyone, with no sign-up."
    ],
    "status": "live",
    "gate": "verify"
  },
  {
    "id": "someone-on-whatsapp-claiming-to-be-docufast-asked-me-to-pay",
    "section": 12,
    "q": "Someone on WhatsApp claiming to be Docufast asked me to pay into an account. What should I do?",
    "a": [
      "Do not pay. Docufast never asks for payment into any account in a chat. Report the number to us on 0905 495 1918 and we will warn others."
    ],
    "status": "live",
    "gate": "verify"
  },
  {
    "id": "how-do-i-know-i-m-on-the-real-docufast-website",
    "section": 12,
    "q": "How do I know I'm on the real Docufast website?",
    "a": [
      "Check that the address is exactly docufast.ng with the padlock in your browser. We do not use any other web address for payments."
    ],
    "status": "live",
    "gate": "verify"
  },
  {
    "id": "what-should-i-do-if-a-docufast-document-fails-verification",
    "section": 12,
    "q": "What should I do if a Docufast document fails verification?",
    "a": [
      "Treat it as not genuine and contact us with the reference number. We investigate every failed check."
    ],
    "status": "live",
    "gate": "verify"
  },
  {
    "id": "how-does-docufast-protect-my-data",
    "section": 13,
    "q": "How does Docufast protect my data?",
    "a": [
      "Your data is encrypted in transit and at rest, and every account uses two-step sign-in. Files you upload are encrypted on your device with a key only you hold. Every access to your records is logged."
    ],
    "status": "live"
  },
  {
    "id": "is-docufast-licensed-to-handle-my-personal-data",
    "section": 13,
    "q": "Is Docufast registered to handle my personal data?",
    "a": [
      "Yes. Docufast is registered with the Nigeria Data Protection Commission (NDPC/DCP/07770) and follows the Nigeria Data Protection Act 2023."
    ],
    "status": "live"
  },
  {
    "id": "who-at-docufast-can-see-my-information",
    "section": 13,
    "q": "Who at Docufast can see my information?",
    "a": [
      "Only the staff working on your order, and only what they need to complete it. They cannot open files you upload yourself."
    ],
    "status": "live"
  },
  {
    "id": "why-do-you-need-my-nin-or-bvn",
    "section": 13,
    "q": "Why do you need my NIN or BVN?",
    "a": [
      "For CAC filings and some affidavits, the law requires us to verify your identity. We use a licensed verification partner and only with your consent. We never sell or share your data for marketing."
    ],
    "status": "live"
  },
  {
    "id": "is-my-data-stored-in-nigeria",
    "section": 13,
    "q": "Is my data stored in Nigeria?",
    "a": [
      "[OLAMIDE TO CONFIRM where accounts, documents and backups are stored (#128); do not publish this answer until confirmed.]"
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "will-you-send-me-marketing-messages",
    "section": 13,
    "q": "Will you send me marketing messages?",
    "a": [
      "Only if you say yes. Marketing consent is separate from your order, and you can switch it off anytime."
    ],
    "status": "live"
  },
  {
    "id": "can-i-see-or-delete-the-data-you-hold-about-me",
    "section": 13,
    "q": "Can I see or delete the data you hold about me?",
    "a": [
      "Yes. Under the Nigeria Data Protection Act you can ask for a copy of your data, a correction, or deletion. Email privacy@docufast.ng. Some records must be kept by law, and we will explain which."
    ],
    "status": "live"
  },
  {
    "id": "where-can-i-read-the-full-privacy-notice",
    "section": 13,
    "q": "Where can I read the full privacy notice?",
    "a": [
      "At docufast.ng/privacy."
    ],
    "status": "live"
  },
  {
    "id": "how-long-will-my-order-take",
    "section": 14,
    "q": "How long will my order take?",
    "a": [
      "Each service shows its usual time on your quote. Affidavits: within 2 to 3 working days, or the same day with Express. Publications: usually 24 to 72 hours. CAC filings depend on CAC's processing times, and we update you at every step."
    ],
    "status": "live"
  },
  {
    "id": "do-you-work-weekends-and-public-holidays",
    "section": 14,
    "q": "Do you work weekends and public holidays?",
    "a": [
      "Courts, CAC and most newspapers do not process on public holidays, so timelines pause. [CONFIRM weekend working hours.]"
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "what-if-my-order-is-delayed",
    "section": 14,
    "q": "What if my order is delayed?",
    "a": [
      "We tell you as soon as we know, with the reason and a new date. If the delay is our fault and Express was paid, the Express fee is refunded. [CONFIRM with Sheriff.]"
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "what-if-a-government-office-rejects-my-filing",
    "section": 14,
    "q": "What if a government office rejects my filing?",
    "a": [
      "We tell you why, fix what we can at no cost, and refile. If CAC needs something from you, we say exactly what."
    ],
    "status": "live"
  },
  {
    "id": "do-you-check-documents-before-they-reach-me",
    "section": 14,
    "q": "Do you check documents before they reach me?",
    "a": [
      "Yes. A person reviews every document before it is sworn, filed, published or delivered. Their review is logged on your order."
    ],
    "status": "live"
  },
  {
    "id": "how-do-i-make-a-complaint",
    "section": 14,
    "q": "How do I make a complaint?",
    "a": [
      "Message us on WhatsApp at 0905 495 1918 or email support@docufast.ng with your order number. We reply within 1 working day and aim to resolve within 5 working days."
    ],
    "status": "live"
  },
  {
    "id": "do-you-work-with-businesses-and-hr-teams",
    "section": 15,
    "q": "Do you work with businesses and HR teams?",
    "a": [
      "Yes. Companies use Docufast for staff affidavits, CAC filings and compliance tracking across several entities. Corporate accounts with 10 or more orders a month get a discount on our fees."
    ],
    "status": "live",
    "gate": "api-partners"
  },
  {
    "id": "i-manage-several-companies-can-i-track-them-all-in-one-place",
    "section": 15,
    "q": "I manage several companies. Can I track them all in one place?",
    "a": [
      "Yes. Add each business to your vault and every one gets its own deadline reminders and document space."
    ],
    "status": "live",
    "gate": "api-partners"
  },
  {
    "id": "can-i-earn-by-referring-customers",
    "section": 15,
    "q": "Can I earn by referring customers?",
    "a": [
      "Yes. POS agents, cyber cafes, coworking spaces, travel agents and other partners earn a commission on completed orders they refer. [ADD sign-up link.]"
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "can-i-be-a-docufast-agent-in-my-area",
    "section": 15,
    "q": "Can I be a Docufast agent in my area?",
    "a": [
      "[ADD agent programme details and application process.]"
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "do-you-have-an-api-for-platforms-and-fintechs",
    "section": 15,
    "q": "Do you have an API for platforms and fintechs?",
    "a": [
      "It is being built with the platform. Banks, fintechs, HR platforms and AI assistants will use the same API as our own app to get quotes, place and track orders, and verify Docufast documents. Every live key works only from approved IP addresses. Register interest at [PARTNERSHIPS EMAIL]."
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "can-docufast-notarize-documents",
    "section": 16,
    "q": "Can Docufast notarize documents?",
    "a": [
      "Digital notarization is coming soon. You will be able to have documents notarized over a secure video session, with an electronic seal recognised under the Notaries Public Act 2023. Join the waitlist to hear first."
    ],
    "status": "live"
  },
  {
    "id": "can-you-help-with-birth-certificates-and-death-notifications",
    "section": 16,
    "q": "Can you help with birth certificates and death notifications?",
    "a": [
      "Yes. We help with nine National Population Commission services, including birth registration, birth attestation, certificate reprints, reissue and verification, and death notification. With your consent, we prepare the application and submit it to NPC for you, and you follow every step on your tracker."
    ],
    "status": "live"
  },
  {
    "id": "can-you-file-my-taxes",
    "section": 16,
    "q": "Can you file my taxes?",
    "a": [
      "Not today. Our compliance reminders cover tax deadlines, and tax filing support is being considered."
    ],
    "status": "live"
  },
  {
    "id": "will-there-be-a-docufast-app",
    "section": 16,
    "q": "Will there be a Docufast app?",
    "a": [
      "docufast.ng works on any phone browser. [CONFIRM whether a mobile app is planned.]"
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "can-i-use-docufast-in-pidgin-yor-b-hausa-or-igbo",
    "section": 17,
    "q": "Can I use Docufast in Pidgin, Yorùbá, Hausa or Igbo?",
    "a": [
      "Yes. Choose English, Pidgin, Yorùbá, Hausa or Igbo at the top of the home screen, and the chat and the main screens switch to your language. You can change it at any time."
    ],
    "status": "live",
    "gate": "languages"
  },
  {
    "id": "will-my-affidavit-or-cac-documents-be-written-in-my-language",
    "section": 17,
    "q": "Will my affidavit or CAC documents be written in my language?",
    "a": [
      "No. Affidavits, CAC filings and other official documents are prepared in English, because that is the language courts and government agencies accept. Before you approve anything, the chat explains what the document says in your language."
    ],
    "status": "live",
    "gate": "languages"
  },
  {
    "id": "can-i-get-support-in-my-language",
    "section": 17,
    "q": "Can I get support in my language?",
    "a": [
      "Yes. Message us on WhatsApp at 0905 495 1918 in English, Pidgin, Yorùbá, Hausa or Igbo, [SUPPORT HOURS BY LANGUAGE]."
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "who-translates-the-screens",
    "section": 17,
    "q": "Who translates the screens?",
    "a": [
      "Native speakers write and check every translation. We do not rely on machine translation alone for anything you read before you sign or pay."
    ],
    "status": "live",
    "gate": "languages"
  },
  {
    "id": "do-i-need-a-new-phone-or-an-app-to-use-docufast",
    "section": 18,
    "q": "Do I need a new phone or an app to use Docufast?",
    "a": [
      "No. docufast.ng works in the browser of any Android phone or iPhone, including small and older screens. There is nothing to download."
    ],
    "status": "live",
    "gate": "network"
  },
  {
    "id": "will-docufast-use-up-my-data",
    "section": 18,
    "q": "Will Docufast use up my data?",
    "a": [
      "No. A full affidavit order, from the home screen to your vault, uses under 2 MB of data, not counting the photos and files you upload. We shrink your photos on your phone before they upload."
    ],
    "status": "live",
    "gate": "network"
  },
  {
    "id": "what-if-my-network-drops-or-my-phone-goes-off-in-the-middle",
    "section": 18,
    "q": "What if my network drops or my phone goes off in the middle of an order?",
    "a": [
      "Nothing is lost. Your order saves as you type. Open the link in your SMS, email or WhatsApp update, or sign in on any device, and continue from the same step. An upload that was cut off continues from where it stopped."
    ],
    "status": "live",
    "gate": "network"
  },
  {
    "id": "i-paid-by-bank-transfer-but-my-order-still-says-unpaid-shoul",
    "section": 18,
    "q": "I paid by bank transfer, but my order still says unpaid. Should I pay again?",
    "a": [
      "No. Some transfers take time to confirm. We confirm them automatically and update your order as soon as your bank does. If money leaves your account twice, the extra payment is refunded automatically. If your order still shows unpaid after [X] hours, send us your bank receipt on WhatsApp."
    ],
    "status": "hold",
    "hold": "has an unfilled [BRACKET] in the Doc"
  },
  {
    "id": "can-i-see-my-order-and-documents-without-network",
    "section": 18,
    "q": "Can I see my order and documents without network?",
    "a": [
      "Partly. Your order tracker and your vault list show what they showed on your last visit. Opening or downloading a document needs a connection."
    ],
    "status": "live",
    "gate": "network"
  },
  {
    "id": "do-i-have-to-verify-my-identity-on-every-order",
    "section": 19,
    "q": "Do I have to verify my identity on every order?",
    "a": [
      "No. Once you have verified with us, you can reuse that check on later orders. We ask your permission each time, and we ask you to verify again only when the law or the service requires it."
    ],
    "status": "live",
    "gate": "credentials-agents"
  },
  {
    "id": "what-is-a-docufast-credential",
    "section": 19,
    "q": "What is a Docufast credential?",
    "a": [
      "Every document we deliver is digitally signed by Docufast and carries a QR code. That makes it a credential: anyone you share it with can confirm it is genuine and unchanged, and banks and agencies can check it automatically."
    ],
    "status": "live",
    "gate": "credentials-agents"
  },
  {
    "id": "can-my-accountant-lawyer-or-company-secretary-handle-my-fili",
    "section": 19,
    "q": "Can my accountant, lawyer or company secretary handle my filings?",
    "a": [
      "Yes. In your account, open Identity, agents and access, and give them access. You choose what they can do and until when, and you can revoke access at any time. Everything they do is recorded in your activity log."
    ],
    "status": "live",
    "gate": "credentials-agents"
  },
  {
    "id": "can-an-ai-assistant-order-documents-for-me",
    "section": 19,
    "q": "Can an AI assistant order documents for me?",
    "a": [
      "Yes, if you allow it. Approve the assistant in your account and set what it may do, with a spending limit for each order. It can get quotes, place orders within your limit and track them, but every payment still needs you on docufast.ng."
    ],
    "status": "live",
    "gate": "credentials-agents"
  }
];

export const liveFaq = () => FAQ.filter((f) => f.status === 'live');
