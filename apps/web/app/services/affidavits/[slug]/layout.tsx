// app/services/affidavits/[slug]/layout.tsx
// Test report D9 (4 Nov 2026): a mistyped affidavit link used to return 200 and "index, follow",
// which search engines treat as a real page. The order page is a client component, so this server
// layout checks the slug first and returns a proper 404 for anything that is not an affidavit type.
import { notFound } from "next/navigation";
import { getAffidavitType } from "@/lib/affidavitTypes";

export default function AffidavitSlugLayout({ children, params }: { children: React.ReactNode; params: { slug: string } }) {
  if (!getAffidavitType(params.slug)) notFound();
  return children;
}
