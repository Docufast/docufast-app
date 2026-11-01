import type { Metadata } from "next";

// Signed-in and account areas are never indexed, whatever SITE_INDEXABLE says (JSB, 1 Nov 2026).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
