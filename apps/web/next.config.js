/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // H4 (#68): no X-Powered-By: Next.js header.
  poweredByHeader: false,
  // #226: serve images as they are. Removes the /_next/image optimizer endpoint, which has open
  // advisories in Next.js 14 (e.g. GHSA-2464-fhr4-w9xw, fixed only in 15.5.28). The site's images
  // are small logos and icons, so nothing visible changes. Revisit after the Next.js 15 upgrade.
  images: { unoptimized: true },
  async redirects() {
    return [
      // Test report D9 (4 Nov 2026): common guesses for the sign-in and sign-up pages.
      { source: "/login", destination: "/sign-in", permanent: true },
      { source: "/signin", destination: "/sign-in", permanent: true },
      { source: "/register", destination: "/sign-up", permanent: true },
      { source: "/signup", destination: "/sign-up", permanent: true },
      {
        // Old Vercel production URL -> real domain (same path, permanent 308).
        // Matches ONLY this exact host; staging/preview URLs are unaffected.
        source: "/:path*",
        has: [{ type: "host", value: "web-three-wheat-56.vercel.app" }],
        destination: "https://www.docufast.ng/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
