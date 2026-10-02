import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { OrgProvider } from "@/contexts/OrgContext";
import SupportChat from "@/components/ui/SupportChat";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import InactivityLogout from "@/components/ui/InactivityLogout";
import { SITE_URL, isIndexable } from "../lib/site";

export const metadata: Metadata = {
  title: "Docufast — Nigeria's Document Platform",
  description: "Sworn documents, CAC registration, publications and notarization — every matter quoted before work starts, tracked end to end, and stored encrypted.",
  metadataBase: new URL(SITE_URL),
  // Indexing is controlled by the SITE_INDEXABLE env var (see lib/site.ts).
  // app/robots.ts reads the same switch, so both always change together.
  robots: {
    index: isIndexable,
    follow: isIndexable,
  },
  openGraph: {
    title: "Docufast — Nigeria's Regulatory Compliance Platform",
    description:
      "Sworn documents, CAC filings, notarization and compliance services " +
      "for Nigerian individuals and businesses. Licenced by NDPC, SCUML, SMEDAN.",
    url: SITE_URL,
    siteName: "Docufast",
    images: [
      {
        url: "/og-image.png?v=2",
        width: 1200,
        height: 630,
        alt: "Docufast — Nigeria Document Platform",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Docufast — Nigeria's Document Platform",
    description:
      "Sworn documents, CAC registration, notarization and compliance " +
      "services for Nigerian individuals and businesses.",
    images: ["/og-image.png?v=2"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-white text-brand-black antialiased">
        <Script
          id="schema-docufast"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Docufast Integrated Services Ltd",
              alternateName: ["Docufast", "Docufast NG", "docufast.ng"],
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              foundingDate: "2022",
              founder: {
                "@type": "Person",
                name: "Ajibola Adeboye",
                jobTitle: "Founder & CEO",
                sameAs: "https://www.linkedin.com/in/jsb1218",
              },
              address: {
                "@type": "PostalAddress",
                streetAddress: "38 Opebi Road",
                addressLocality: "Opebi",
                addressRegion: "Lagos State",
                addressCountry: "NG",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+234-905-495-1918",
                contactType: "customer service",
              },
              sameAs: [
                "https://www.wikidata.org/wiki/Q141570074",
                "https://www.linkedin.com/company/docufast",
                "https://twitter.com/docufastng",
              ],
              identifier: [
                {
                  "@type": "PropertyValue",
                  name: "CAC Registration Number",
                  value: "RC1893484",
                },
                {
                  "@type": "PropertyValue",
                  name: "SCUML Licence",
                  value: "SC251840209",
                },
                {
                  "@type": "PropertyValue",
                  name: "NDPC Licence",
                  value: "DCP/07770",
                },
                {
                  "@type": "PropertyValue",
                  name: "SMEDAN Registration",
                  value: "SUIN426476832438",
                },
                {
                  "@type": "PropertyValue",
                  name: "Wikidata QID",
                  value: "Q141570074",
                },
              ],
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Docufast Services",
                numberOfItems: 43,
              },
            }),
          }}
        />
        <OrgProvider>{children}</OrgProvider>
        <SupportChat />
        <WhatsAppButton />
        <InactivityLogout />
      </body>
    </html>
  );
}
