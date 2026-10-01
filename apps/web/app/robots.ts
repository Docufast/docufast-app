import type { MetadataRoute } from "next";
import { SITE_URL, isIndexable } from "../lib/site";

// Never crawlable, even after launch.
const PRIVATE_PATHS = [
  "/admin",
  "/account",
  "/vault",
  "/orders",
  "/calendar",
  "/api",
  "/reset-password",
  "/forgot-password",
];

// Link-preview crawlers (LinkedIn, Facebook/WhatsApp, X, Slack).
// They build share previews and do not add pages to search results,
// so they may read public pages even while search engines are blocked.
const SOCIAL_PREVIEW_BOTS = [
  "LinkedInBot",
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "WhatsApp",
  "Slackbot",
];

export default function robots(): MetadataRoute.Robots {
  const sitemap = `${SITE_URL}/sitemap.xml`;

  if (isIndexable) {
    return {
      rules: { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      sitemap,
    };
  }

  return {
    rules: [
      { userAgent: SOCIAL_PREVIEW_BOTS, allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "*", disallow: "/" },
    ],
    sitemap,
  };
}
