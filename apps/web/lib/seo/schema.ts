// lib/seo/schema.ts
// Builders for schema.org structured data (JSON-LD). Render the result with <JsonLd /> from
// components/JsonLd.tsx so it is in the server HTML. AI crawlers that do not run JavaScript
// (GPTBot, ClaudeBot, PerplexityBot) never see data added with next/script "afterInteractive".
//
// Rule from Google: structured data must match what the page visibly says.

import { FACTS, SITE_URL } from './facts';

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

export function organization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: FACTS.name,
    legalName: FACTS.legalName,
    alternateName: [...FACTS.alternateNames],
    url: SITE_URL,
    logo: FACTS.logo,
    description: FACTS.oneLine,
    foundingDate: FACTS.incorporated,
    founder: {
      '@type': 'Person',
      name: FACTS.founder.name,
      jobTitle: FACTS.founder.jobTitle,
      sameAs: FACTS.founder.linkedin,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: FACTS.address.street,
      addressLocality: FACTS.address.locality,
      addressRegion: FACTS.address.region,
      addressCountry: FACTS.address.country,
    },
    areaServed: { '@type': 'Country', name: 'Nigeria' },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: FACTS.support.telephone,
      contactType: 'customer service',
      availableLanguage: [...FACTS.languagesNow],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: FACTS.support.opens,
        closes: FACTS.support.closes,
      },
    },
    identifier: FACTS.registrations.map((r) => ({ '@type': 'PropertyValue', name: r.name, value: r.value })),
    sameAs: [...FACTS.profiles],
  };
}

export function website() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE_URL,
    name: FACTS.name,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-NG',
  };
}

export type ServiceInput = {
  path: string; // e.g. '/services/cac'
  name: string; // e.g. 'CAC business name registration'
  description: string; // the same words the page shows
  serviceType: string; // e.g. 'Company registration'
  price?: { amount: string; currency: 'NGN' }; // add only once the price list is set
};

export function service(s: ServiceInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    serviceType: s.serviceType,
    description: s.description,
    url: `${SITE_URL}${s.path}`,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'Nigeria' },
    ...(s.price
      ? { offers: { '@type': 'Offer', price: s.price.amount, priceCurrency: s.price.currency, url: `${SITE_URL}${s.path}` } }
      : {}),
  };
}

export type QA = { q: string; a: string };

// Use only where the questions and answers are visible on the page.
export function faqPage(items: QA[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

export function breadcrumbs(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${SITE_URL}${t.path}`,
    })),
  };
}

export type GuideMeta = {
  path: string;
  title: string;
  description: string;
  author: string;
  reviewer: { name: string; jobTitle: string };
  datePublished: string; // YYYY-MM-DD
  dateReviewed: string; // YYYY-MM-DD
};

export function guide(g: GuideMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}${g.path}#page`,
    url: `${SITE_URL}${g.path}`,
    name: g.title,
    description: g.description,
    inLanguage: 'en-NG',
    isPartOf: { '@id': SITE_ID },
    lastReviewed: g.dateReviewed,
    reviewedBy: { '@type': 'Person', name: g.reviewer.name, jobTitle: g.reviewer.jobTitle },
    mainEntity: {
      '@type': 'Article',
      headline: g.title,
      description: g.description,
      author: { '@type': 'Person', name: g.author },
      publisher: { '@id': ORG_ID },
      datePublished: g.datePublished,
      dateModified: g.dateReviewed,
    },
  };
}
