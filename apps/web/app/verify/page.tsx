// app/verify/page.tsx
// Public landing page for document verification (Blueprint board W5).
// The lookup itself arrives with the QR and credential layer, so the form is switched off for now.
// Result pages at /verify/[id] are blocked in robots.ts and must also send noindex when built.

import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { FACTS } from "@/lib/seo/facts";
import { breadcrumbs } from "@/lib/seo/schema";
import { pageMetadata } from "@/lib/seo/pages";

export const metadata = pageMetadata("/verify");

const CHECKS = [
  { title: "Genuine", text: "Signed by Docufast." },
  { title: "Unchanged", text: "The file fingerprint matches." },
  { title: "Not revoked", text: "Still active today." },
];

const pill =
  "inline-flex h-10 items-center rounded-full border border-[#BFBFBF] bg-brand-white px-4 text-sm text-brand-black disabled:opacity-50";

export default function VerifyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Verify a Docufast document", path: "/verify" },
        ])}
      />
      <SiteHeader />
      <main className="bg-brand-offwhite px-4 py-12 md:px-12 md:py-14">
        <div className="mx-auto max-w-[1104px]">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand-yellow-dark">
            Verify
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.1] text-brand-black md:text-5xl">
            Check a Docufast document
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-gray">
            Make sure a document is genuine, unchanged and not revoked. We never show a
            document&apos;s contents here.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
            <div>
              <div className="rounded-[14px] border border-brand-gray-light bg-brand-white p-6">
                <p className="rounded-[10px] bg-[#FDF0C4] px-4 py-3 text-sm leading-relaxed text-brand-black">
                  Online checking opens when our first documents are issued. Until then this form is
                  switched off. Every document we deliver will carry a QR code and a reference number
                  you can check here.
                </p>
                <label htmlFor="document-id" className="mt-5 mb-1.5 block text-sm font-semibold text-brand-black">
                  Document ID
                </label>
                <input
                  id="document-id"
                  disabled
                  placeholder="DF-..."
                  className="h-11 w-full rounded-[10px] border border-[#BFBFBF] bg-brand-white px-3.5 font-mono text-sm outline-none disabled:opacity-50"
                />
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-10 items-center rounded-[10px] bg-brand-black px-5 text-sm font-semibold text-brand-white disabled:opacity-50"
                  >
                    Check document
                  </button>
                  <button type="button" disabled className={pill}>
                    Scan QR code
                  </button>
                  <button type="button" disabled className={pill}>
                    Upload the PDF
                  </button>
                </div>
              </div>

              <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                {CHECKS.map((c) => (
                  <li key={c.title} className="rounded-[14px] border border-brand-gray-light bg-brand-white p-5">
                    <h2 className="text-base font-semibold text-brand-black">{c.title}</h2>
                    <p className="mt-1 text-sm text-brand-gray">{c.text}</p>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="flex flex-col gap-4">
              <div className="rounded-[14px] border border-brand-gray-light bg-brand-white p-5">
                <h2 className="text-base font-semibold text-brand-black">
                  For banks, embassies and employers
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-brand-gray">
                  Check credentials automatically through our API. Message us on WhatsApp at{" "}
                  {FACTS.support.whatsappDisplay} for access.
                </p>
              </div>
              <p className="rounded-[14px] bg-[#FDF0C4] px-4 py-3 text-sm leading-relaxed text-brand-black">
                Result pages for individual documents are kept out of search engines.
              </p>
            </aside>
          </div>

          <p className="mt-8 text-sm text-brand-gray">{FACTS.notALawFirm}</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
