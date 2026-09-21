import type { Metadata } from "next";
import "./globals.css";
import { OrgProvider } from "@/contexts/OrgContext";
import SupportChat from "@/components/ui/SupportChat";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import InactivityLogout from "@/components/ui/InactivityLogout";

export const metadata: Metadata = {
  title: "Docufast — Nigeria's Document Platform",
  description: "Sworn documents, CAC registration, publications and notarization — every matter quoted before work starts, tracked end to end, and stored encrypted.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-white text-brand-black antialiased">
        <OrgProvider>{children}</OrgProvider>
        <SupportChat />
        <WhatsAppButton />
        <InactivityLogout />
      </body>
    </html>
  );
}
