// app/sitemap.ts
// Replaces the current sitemap. Adds /about, /faq, /verify, /guides and each published guide,
// and gives each page its own last-changed date instead of one build time for all.
// Update a date when that page's content really changes (Bing and IndexNow use it).
// Comment out any page that is not live yet: a sitemap that lists 404s wastes AI crawls.

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/facts';

const PAGES: { path: string; lastModified: string }[] = [
  { path: '', lastModified: '2026-10-11' },
  { path: '/services', lastModified: '2026-10-11' },
  { path: '/services/affidavits', lastModified: '2026-10-11' },
  { path: '/services/cac', lastModified: '2026-10-11' },
  { path: '/services/publications', lastModified: '2026-10-11' },
  { path: '/services/notarization', lastModified: '2026-10-11' },
  { path: '/services/virtual-assistant', lastModified: '2026-10-11' },
  { path: '/about', lastModified: '2026-10-13' },
  { path: '/faq', lastModified: '2026-10-13' },
  // { path: '/verify', lastModified: '2026-10-11' }, // enable when the page is live
  // { path: '/guides', lastModified: '2026-10-11' }, // enable when the page is live
  { path: '/privacy', lastModified: '2026-10-02' },
  { path: '/terms', lastModified: '2026-10-02' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((p) => ({ url: `${SITE_URL}${p.path}`, lastModified: p.lastModified })),
  ];
}
