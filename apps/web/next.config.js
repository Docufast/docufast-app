/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // H4 (#68): no X-Powered-By: Next.js header.
  poweredByHeader: false,
  async redirects() {
    return [
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
