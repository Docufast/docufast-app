// app/robots.ts
// Generates /robots.txt. Replaces any static public/robots.txt (delete that file if it exists).
//
// Two environment variables on Vercel control everything:
//   SITE_INDEXABLE=true       -> public pages open to search engines and AI tools (launch, or earlier if JSB decides D7)
//                               anything else -> beta mode: only social link previews may read the site (today's behaviour)
//   AI_TRAINING_ALLOWED=false -> keep AI *training* crawlers out (decision D6). Default: allowed on public pages.
//
// The same SITE_INDEXABLE value must drive the robots meta tag in app/layout.tsx (see lib/seo/pages.ts),
// so the two can never disagree.

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/facts';

// Only a Vercel production build can be indexable (staging and previews never are).
const INDEXABLE =
  process.env.SITE_INDEXABLE === 'true' && process.env.VERCEL_ENV === 'production';
const TRAINING_ALLOWED = process.env.AI_TRAINING_ALLOWED !== 'false';

// Private areas: closed to every bot in every mode.
// '/verify/' (with the slash) hides individual credential pages but keeps the /verify landing page public.
const PRIVATE = [
  '/admin',
  '/account',
  '/home',
  '/vault',
  '/orders',
  '/calendar',
  '/api',
  '/reset-password',
  '/forgot-password',
  '/verify/',
];

// Link previews on WhatsApp, LinkedIn, X, Facebook and Slack (kept from the current robots.txt).
const SOCIAL = ['LinkedInBot', 'facebookexternalhit', 'Facebot', 'Twitterbot', 'WhatsApp', 'Slackbot'];

// Search engines and AI search: these decide whether Google, Bing, ChatGPT, Gemini, Copilot,
// Meta AI, Perplexity and Claude can find and cite us.
const SEARCH = [
  'Googlebot',
  'Bingbot',
  'Applebot',
  'DuckDuckBot',
  'OAI-SearchBot', // ChatGPT search index
  'ChatGPT-User', // ChatGPT fetching a page a user asked about
  'Claude-SearchBot', // Claude search index
  'Claude-User', // Claude fetching a page a user asked about
  'PerplexityBot', // Perplexity search index
  'Perplexity-User', // Perplexity fetching a page a user asked about
  'meta-externalfetcher', // Meta AI fetching a page for a user
];

// AI training: decides whether future models learn that Docufast exists. Decision D6.
const TRAINING = [
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'Applebot-Extended',
  'meta-externalagent',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) {
    // Beta mode: identical to the robots.txt live on 11 Oct 2026.
    return {
      rules: [
        { userAgent: SOCIAL, allow: '/', disallow: PRIVATE },
        { userAgent: '*', disallow: '/' },
      ],
      sitemap: `${SITE_URL}/sitemap.xml`,
    };
  }

  // A crawler obeys only the most specific group that names it, so each group repeats the private list.
  const rules: MetadataRoute.Robots['rules'] = [
    { userAgent: SOCIAL, allow: '/', disallow: PRIVATE },
    { userAgent: SEARCH, allow: '/', disallow: PRIVATE },
    TRAINING_ALLOWED
      ? { userAgent: TRAINING, allow: '/', disallow: PRIVATE }
      : { userAgent: TRAINING, disallow: '/' },
    { userAgent: '*', allow: '/', disallow: PRIVATE },
  ];

  return { rules, sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL };
}
