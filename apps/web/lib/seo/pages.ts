// lib/seo/pages.ts
// One title and one description per public page. Today all nine pages share the same pair,
// so to an AI tool every page looks identical. Rules: no em dashes, no prices, notarization
// is "coming soon", never "regulated", never "Licenced".
//
// Use in a page:   export const metadata = pageMetadata('/services/cac');

import type { Metadata } from 'next';
import { SITE_URL } from './facts';

// Only a Vercel production build can ever be indexable (staging and previews never are).
export const INDEXABLE =
  process.env.SITE_INDEXABLE === 'true' && process.env.VERCEL_ENV === 'production';

type PageMeta = { title: string; description: string };

export const PAGE_META: Record<string, PageMeta> = {
  '/': {
    title: "Docufast | Nigeria's Document Platform",
    description:
      'Affidavits, CAC registration and newspaper publications online. Compliance services for individuals and businesses in Nigeria.',
  },
  '/services': {
    title: 'All services: affidavits, CAC, newspaper notices and more',
    description:
      'Every Docufast service in one place: affidavits, newspaper notices, CAC registration and filings, typing and data entry, and NPC birth and death services. Every order is quoted before work starts.',
  },
  '/services/affidavits': {
    title: 'Affidavits online in Lagos: change of name, loss, age and more',
    description:
      'Order a change of name, loss, age declaration, marriage or other affidavit online. We draft it, it is sworn through the Lagos court system, and a person checks it before it reaches your Vault.',
  },
  '/services/cac': {
    title: 'CAC registration, annual returns and company changes',
    description:
      'Register a business name, company or incorporated trustees, file overdue annual returns, get a status report or change directors. Government fees are itemised in your quote.',
  },
  '/services/publications': {
    title: 'Newspaper publication for change of name or lost documents',
    description:
      'Publish a change of name, loss of document or incorporated trustees notice in the national daily you choose, with proof in your Vault. No affidavit yet? We add it to the same order.',
  },
  '/services/notarization': {
    title: 'Document Vault, deadline reminders and notarization (coming soon)',
    description:
      'Keep every document Docufast prepares in an encrypted Vault, get reminders before CAC, FIRS and LIRS deadlines, and join the waitlist for online notarization.',
  },
  '/services/virtual-assistant': {
    title: 'Document typing, data entry and transcription',
    description:
      'Send handwritten or scanned pages, records or recordings and get a clean Word or Excel file back. No ID check needed.',
  },
  '/about': {
    title: 'About Docufast: who we are and how we work',
    description:
      'Docufast Integrated Services Limited (RC 1893484) helps people and businesses in Nigeria get affidavits, newspaper notices, CAC filings and NPC services online. Registrations, address and contacts.',
  },
  '/faq': {
    title: 'Frequently asked questions',
    description:
      'Answers on quotes, payment, identity checks, the Vault, languages, delivery times and each Docufast service.',
  },
  '/verify': {
    title: 'Verify a Docufast document',
    description:
      'Check that an affidavit or other document issued through Docufast is genuine and has not been changed or revoked. Scan its QR code or enter its document ID.',
  },
  '/guides': {
    title: 'Guides: affidavits, CAC and documents in Nigeria',
    description:
      'Plain-English guides to changing your name, replacing lost documents, registering a business and keeping your company in good standing with CAC.',
  },
  '/privacy': {
    title: 'Privacy Policy',
    description: 'How Docufast collects, uses, stores and protects your information, and how to use your rights.',
  },
  '/terms': {
    title: 'Terms of Service',
    description: 'The terms that apply when you use docufast.ng and order a Docufast service.',
  },
};

export function pageMetadata(path: string, override?: Partial<PageMeta>): Metadata {
  const base = PAGE_META[path];
  if (!base && !override?.title) throw new Error(`No title and description for ${path} in lib/seo/pages.ts`);
  const m = { ...base, ...override } as PageMeta;
  const isHome = path === '/';
  return {
    // The home title is used as written; every other title gets " | Docufast" from the layout template.
    title: isHome ? { absolute: m.title } : m.title,
    description: m.description,
    alternates: { canonical: `${SITE_URL}${isHome ? '' : path}` },
    openGraph: { title: m.title, description: m.description, url: `${SITE_URL}${isHome ? '' : path}` },
    twitter: { title: m.title, description: m.description },
  };
}

// For app/layout.tsx. One switch drives both this tag and app/robots.ts.
export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: PAGE_META['/'].title, template: '%s | Docufast' },
  description: PAGE_META['/'].description,
  robots: INDEXABLE
    ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } }
    : { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: 'Docufast',
    locale: 'en_NG',
    title: PAGE_META['/'].title,
    description: PAGE_META['/'].description,
    images: ['/og-image.png?v=2'],
  },
  twitter: { card: 'summary_large_image', images: ['/og-image.png?v=2'] },
};
