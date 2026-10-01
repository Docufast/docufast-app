import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

// Public marketing pages only. Add new public pages here.
const PUBLIC_PATHS = [
  "",
  "/services",
  "/services/affidavits",
  "/services/cac",
  "/services/notarization",
  "/services/publications",
  "/services/virtual-assistant",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PUBLIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
  }));
}
