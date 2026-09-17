import type { Metadata } from "next";
import "./globals.css";
import { OrgProvider } from "@/contexts/OrgContext";

export const metadata: Metadata = {
  title: "Docufast — Documents. Faster.",
  description: "API-first document infrastructure for Nigeria.",
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
      </body>
    </html>
  );
}
