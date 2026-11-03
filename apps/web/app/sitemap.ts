// app/sitemap.ts
// Every public page Docufast wants found, each with the date its content really last changed.
// Update a date only when that page's words change (Bing and IndexNow trust these dates; a date
// that moves on every build teaches them to ignore it). After changing a date, run
// `node scripts/indexnow.mjs <the changed URLs>` once the deploy is live.
// Leave out any page that is not live yet: a sitemap that lists 404s wastes crawls.

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/facts';
import { ORDERABLE_AFFIDAVIT_TYPES } from '@/lib/affidavitTypes';

const NPC_ON = process.env.NEXT_PUBLIC_NPC_SERVICES_ENABLED === 'on';

// Last real content change for the affidavit order pages (types list and order page).
const AFFIDAVIT_PAGES_CHANGED = '2026-11-02';

const PAGES: { path: string; lastModified: string }[] = [
  { path: '', lastModified: '2026-11-01' },
  { path: '/services', lastModified: '2026-11-02' },
  { path: '/services/affidavits', lastModified: '2026-11-02' },
  { path: '/services/cac', lastModified: '2026-10-22' },
  { path: '/services/publications', lastModified: '2026-10-22' },
  // JSB TO CONFIRM: this page is the Vault and reminders page with notarization "coming soon".
  // Kept for now because the Vault is live; remove it if JSB decides it should not be crawled yet.
  { path: '/services/notarization', lastModified: '2026-11-01' },
  { path: '/services/virtual-assistant', lastModified: '2026-10-22' },
  { path: '/about', lastModified: '2026-11-03' },
  { path: '/faq', lastModified: '2026-11-03' },
  { path: '/verify', lastModified: '2026-10-22' },
  // { path: '/guides', lastModified: '' }, // add when the page is live
  { path: '/privacy', lastModified: '2026-10-30' },
  { path: '/terms', lastModified: '2026-11-03' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [...PAGES];
  // One page per affidavit customers can order. Hidden types (notOrderable) stay out.
  for (const t of ORDERABLE_AFFIDAVIT_TYPES) {
    pages.push({ path: `/services/affidavits/${t.slug}`, lastModified: AFFIDAVIT_PAGES_CHANGED });
  }
  // NPC pages only once the switch is on; until then they only say "coming soon".
  if (NPC_ON) pages.push({ path: '/services/npc', lastModified: '2026-11-02' });
  return pages.map((p) => ({ url: `${SITE_URL}${p.path}`, lastModified: p.lastModified }));
}
