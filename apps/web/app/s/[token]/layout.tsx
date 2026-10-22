import type { Metadata } from "next";

// Share links are private: never indexed, and the link is not passed on to other sites.
export const metadata: Metadata = {
  title: "Shared document | Docufast",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
