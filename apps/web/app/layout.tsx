import "./globals.css";
import { OrgProvider } from "@/contexts/OrgContext";
import SupportChat from "@/components/ui/SupportChat";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import InactivityLogout from "@/components/ui/InactivityLogout";
import { JsonLd } from "@/components/JsonLd";
import { organization, website } from "@/lib/seo/schema";
import { rootMetadata } from "@/lib/seo/pages";

export const metadata = rootMetadata;

// Pages render per request so the CSP nonce from middleware.ts can be applied (#68 H1).
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-NG">
      <body className="min-h-screen bg-brand-white text-brand-black antialiased">
        <JsonLd data={[organization(), website()]} />
        <OrgProvider>{children}</OrgProvider>
        <SupportChat />
        <WhatsAppButton />
        <InactivityLogout />
      </body>
    </html>
  );
}
