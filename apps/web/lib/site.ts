// Single source of truth for the public site URL and search-engine indexing.
//
// Indexing is ON only when BOTH are true:
//   - SITE_INDEXABLE is exactly "true" (unset, "false", or a typo keeps the site blocked)
//   - this is a Vercel production build (staging/preview can never be indexed by accident)
//
// Changing SITE_INDEXABLE requires a redeploy to take effect.
export const SITE_URL = "https://www.docufast.ng";

export const isIndexable =
  process.env.SITE_INDEXABLE === "true" &&
  process.env.VERCEL_ENV === "production";
