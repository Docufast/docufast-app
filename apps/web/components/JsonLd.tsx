// components/JsonLd.tsx
// Server component: writes structured data straight into the HTML the server sends.
// Do NOT add 'use client' and do NOT use next/script for this. The current site injects its
// Organization data with <Script strategy="afterInteractive">, which text-only AI crawlers never see.

type Json = Record<string, unknown>;

export function JsonLd({ data }: { data: Json | Json[] }) {
  // Escaping "<" stops a value from closing the script tag early.
  const html = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: html }} />;
}
