// lib/seo/facts.ts
// The Docufast fact sheet in code. Every page, the structured data and llms.txt read from here,
// so a fact changes in one place only. Source: "Docufast AI Visibility Plan", Workstream 2.
//
// Values in [BRACKETS] are open decisions. Do not ship a page that prints one: fill it in first.

export const SITE_URL = 'https://www.docufast.ng';

export const FACTS = {
  name: 'Docufast',
  legalName: 'Docufast Integrated Services Limited',
  alternateNames: ['Docufast NG', 'docufast.ng'],
  oneLine:
    "Docufast helps people and businesses in Nigeria get affidavits, newspaper notices, CAC registrations and filings, and birth and death registrations online. A person checks every document before it is delivered to the customer's encrypted Vault.",
  rcNumber: 'RC 1893484',
  incorporated: '2022-02-15',
  address: {
    // Virtual office address. Never name the provider and never invite walk-in customers.
    street: 'Suite 100, Adebola House, 38 Opebi Road',
    locality: 'Ikeja',
    region: 'Lagos',
    country: 'NG',
  },
  founder: { name: 'Ajibola Adeboye', jobTitle: 'Founder', linkedin: 'https://www.linkedin.com/in/jsb1218' },
  // Registration wording is fixed: never "regulated", SCUML and SMEDAN are registrations, NDPC is a licence.
  registrations: [
    { name: 'CAC registration number', value: 'RC1893484' },
    { name: 'SCUML registration', value: 'SC251840209' },
    { name: 'NDPC licence', value: 'DCP/07770' },
    { name: 'SMEDAN registration', value: 'SUIN426476832438' },
  ],
  notALawFirm: 'Docufast is not a law firm and does not give legal advice.',
  affidavitRoute: 'Sworn through the Lagos court system', // never call LagosCoMiS "approved"
  // Decided by JSB, 11 Oct 2026. Delivery times for other services to follow.
  quotePromise: 'Your price within 1 minute, fixed once you accept',
  affidavitDelivery: 'Affidavits delivered within 48 hours',
  // D5, decided 11 Oct 2026: no service count in any public copy. Never print a number of services.
  servicesLine: 'Affidavits, newspaper notices, CAC filings and more',
  notarization: 'Coming soon',
  payment: 'Pay only on docufast.ng. Never into a personal account, never inside WhatsApp.',
  support: {
    whatsappDisplay: '0905 495 1918',
    telephone: '+234-905-495-1918',
    hours: 'Monday to Saturday, 8am to 6pm WAT',
    opens: '08:00',
    closes: '18:00',
  },
  languagesNow: ['English'],
  languagesComing: ['Nigerian Pidgin', 'Yoruba', 'Hausa', 'Igbo'],
  dataLocation: '[CONFIRM STORAGE AND BACKUPS ARE IN NIGERIA]', // Olamide to confirm
  // List a profile here only once Docufast controls it.
  profiles: [
    'https://www.wikidata.org/wiki/Q141570074',
    'https://www.linkedin.com/company/docufast', // confirm this is the company page URL
    'https://www.google.com/maps?cid=11038375766838088938', // Google Business Profile
    'https://www.crunchbase.com/organization/docufast-nigeria',
    'https://www.instagram.com/docufast.nigeria/', // handle docufast.nigeria; add TikTok, X and YouTube when #47 is done
  ],
  logo: `${SITE_URL}/logo.png`,
} as const;

// True while any open decision above is unfilled. The release check fails if a page prints a bracket.
export const HAS_OPEN_FACTS = Object.values(FACTS).some(
  (v) => typeof v === 'string' && v.startsWith('['),
);
