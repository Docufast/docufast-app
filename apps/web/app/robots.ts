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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: isIndexable
      ? { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
