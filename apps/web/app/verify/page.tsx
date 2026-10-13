// app/verify/page.tsx
// Public landing page for document verification (Blueprint board W5).
// The lookup itself arrives with the QR and credential layer, so the form is switched off for now.
// Result pages at /verify/[id] are blocked in robots.ts and must also send noindex when built.

import HomeLink from "@/components/ui/HomeLink";
import AuthNavLink from "@/components/ui/AuthNavLink";
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

export default function VerifyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Verify a Docufast document", path: "/verify" },
        ])}
      />
      <main className="mx-auto max-w-4xl px-6 py-6 lg:px-16 lg:py-10">
        <nav className="flex items-center gap-6 border-b-4 border-brand-black pb-4">
          <HomeLink />
          <AuthNavLink />
        </nav>

        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-brand-gray">Verify</p>
        <h1 className="mt-2 text-3xl font-extrabold text-brand-black">Check a Docufast document</h1>
        <p className="mt-3 max-w-2xl text-brand-gray">
          Make sure a document is genuine, unchanged and not revoked. We never show a document's contents
          here.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div>
            <div className="rounded-card border-4 border-brand-black p-5">
              <p className="rounded-card border-l-4 border-brand-yellow bg-brand-yellow/10 px-4 py-3 text-sm text-brand-black">
                Online checking opens when our first documents are issued. Until then this form is switched
                off. Every document we deliver will carry a QR code and a reference number you can check here.
              </p>
              <label
                htmlFor="document-id"
                className="mt-5 mb-1.5 block text-xs font-semibold uppercase tracking-wide"
              >
                Document ID
              </label>
              <input
                id="document-id"
                disabled
                placeholder="DF-..."
                className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none disabled:opacity-50"
              />
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled
                  className="rounded-card bg-brand-black px-4 py-3 text-sm font-bold text-brand-white disabled:opacity-50"
                >
                  Check document
                </button>
                <button
                  type="button"
                  disabled
                  className="rounded-card border-2 border-brand-black px-4 py-3 text-sm font-semibold disabled:opacity-50"
                >
                  Scan QR code
                </button>
                <button
                  type="button"
                  disabled
                  className="rounded-card border-2 border-brand-black px-4 py-3 text-sm font-semibold disabled:opacity-50"
                >
                  Upload the PDF
                </button>
              </div>
            </div>

            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {CHECKS.map((c) => (
                <li key={c.title} className="rounded-card border-2 border-brand-black p-4">
                  <h2 className="font-bold text-brand-black">{c.title}</h2>
                  <p className="mt-1 text-sm text-brand-gray">{c.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-card border-2 border-brand-black p-4">
              <h2 className="font-bold text-brand-black">For banks, embassies and employers</h2>
              <p className="mt-1 text-sm text-brand-gray">
                Check credentials automatically through our API. Message us on WhatsApp at{" "}
                {FACTS.support.whatsappDisplay} for access.
              </p>
            </div>
            <p className="rounded-card bg-brand-yellow/10 px-4 py-3 text-sm text-brand-black">
              Result pages for individual documents are kept out of search engines.
            </p>
          </aside>
        </div>

        <p className="mt-8 text-sm text-brand-gray">{FACTS.notALawFirm}</p>
      </main>

      <footer className="mt-10 border-t-4 border-brand-black bg-brand-black px-6 py-10 text-brand-white lg:px-16">
        <div className="flex flex-col gap-2 text-xs text-neutral-400">
          <span>SCUML SC251840209 | NDPC DCP/07770 | SMEDAN SUIN426476832438 | RC1893484</span>
          <span>© 2026 Docufast Integrated Services Ltd</span>
        </div>
      </footer>
    </>
  );
}
