// app/about/page.tsx
// The fact sheet as a public page (Blueprint W3, #119). Every fact comes from lib/seo/facts.ts,
// never typed here, so the page, the structured data and llms.txt cannot disagree.
// The "Where data is kept" row is deliberately not shown until #128 is approved.

import Link from "next/link";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { FACTS } from "@/lib/seo/facts";
import { breadcrumbs } from "@/lib/seo/schema";
import { pageMetadata } from "@/lib/seo/pages";

export const metadata = pageMetadata("/about");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
// "2022-02-15" -> "15 February 2022", read from the string so no time zone can shift the day.
const longDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS.at(m - 1)} ${y}`;
};

const STEPS = [
  "Choose your service",
  "Give us your details",
  "Get your price",
  "Upload your documents and verify your identity",
  "Pay on docufast.ng",
  "Receive your documents in your Vault",
];

const SERVICES: { href: string; label: string; note: string }[] = [
  { href: "/services/affidavits", label: "Affidavits", note: "Sworn through the Lagos court system" },
  { href: "/services/publications", label: "Newspaper publications", note: "With proof of publication in your Vault" },
  { href: "/services/cac", label: "CAC registration and filings", note: "Business names, companies, incorporated trustees, annual returns and status reports" },
  { href: "/services/virtual-assistant", label: "Typing, data entry and transcription", note: "A clean Word or Excel file back" },
  { href: "/services/notarization", label: "Document Vault and reminders", note: "Digital notarization is coming soon" },
];

const card = "rounded-[14px] border border-brand-gray-light bg-brand-white p-6";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-brand-gray-light py-3 last:border-b-0 sm:grid-cols-[180px_1fr] sm:gap-6">
      <dt className="text-sm text-brand-black">{label}</dt>
      <dd className="text-sm text-brand-black sm:text-right">{children}</dd>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: "Home", path: "/" },
          { name: "About Docufast", path: "/about" },
        ])}
      />
      <SiteHeader />
      <main className="bg-brand-offwhite px-4 py-12 md:px-12 md:py-14">
        <div className="mx-auto max-w-[1104px]">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand-yellow-dark">
            About Docufast
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.1] text-brand-black md:text-5xl">
            Your documents. Handled properly. Every time.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-gray">{FACTS.oneLine}</p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="flex flex-col gap-6">
              <section className={card}>
                <h2 className="text-xl font-semibold text-brand-black">Fact sheet</h2>
                <dl className="mt-3">
                  <Row label="Legal name">{FACTS.legalName}</Row>
                  <Row label="Incorporated">{longDate(FACTS.incorporated)}</Row>
                  <Row label="Founder">{FACTS.founder.name}, {FACTS.founder.jobTitle}</Row>
                  <Row label="Registered address">
                    {FACTS.address.street}, {FACTS.address.locality}, {FACTS.address.region}
                    <span className="mt-1 block text-xs text-brand-gray">
                      We work online only. No walk-ins.
                    </span>
                  </Row>
                  <Row label="What we do">{FACTS.servicesLine}</Row>
                  <Row label="Quotes">{FACTS.quotePromise}</Row>
                  <Row label="Delivery">{FACTS.affidavitDelivery}. Other services to follow</Row>
                  <Row label="Notarization">
                    <span className="rounded-full bg-[#FDF0C4] px-2.5 py-0.5 text-xs font-semibold">
                      {FACTS.notarization}
                    </span>
                  </Row>
                  <Row label="Languages">
                    {FACTS.languagesNow.join(", ")} now. {FACTS.languagesComing.join(", ")} coming
                  </Row>
                </dl>
              </section>

              <section className={card}>
                <h2 className="text-xl font-semibold text-brand-black">What we do</h2>
                <p className="mt-2 text-sm text-brand-gray">{FACTS.servicesLine}.</p>
                <ul className="mt-4 flex flex-col gap-3 text-sm">
                  {SERVICES.map((s) => (
                    <li key={s.href}>
                      <Link href={s.href} className="font-semibold text-brand-black underline">
                        {s.label}
                      </Link>
                      <span className="text-brand-gray">: {s.note}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className={card}>
                <h2 className="text-xl font-semibold text-brand-black">How an order works</h2>
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-brand-gray">
                  {STEPS.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                <p className="mt-3 text-sm text-brand-gray">
                  {FACTS.quotePromise}. {FACTS.affidavitDelivery}. A person checks every document before
                  it is delivered to your encrypted Vault, where it carries a QR code anyone can verify.
                </p>
                <p className="mt-4 text-sm">
                  <Link href="/faq" className="font-semibold text-brand-black underline">
                    Read the frequently asked questions
                  </Link>
                </p>
              </section>
            </div>

            <aside className="flex flex-col gap-4">
              <section className={card}>
                <h2 className="text-base font-semibold text-brand-black">Registrations</h2>
                <dl className="mt-2">
                  {FACTS.registrations.map((r) => (
                    <div
                      key={r.name}
                      className="flex items-baseline justify-between gap-4 border-b border-brand-gray-light py-2.5 last:border-b-0"
                    >
                      <dt className="text-sm text-brand-black">{r.name}</dt>
                      <dd className="font-mono text-xs text-brand-black">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className={card}>
                <h2 className="text-base font-semibold text-brand-black">Contact</h2>
                <p className="mt-2 text-sm text-brand-black">
                  WhatsApp support {FACTS.support.whatsappDisplay}
                </p>
                <p className="text-sm text-brand-black">{FACTS.support.hours}</p>
              </section>

              <p className="rounded-[14px] bg-[#FDF0C4] px-4 py-3 text-sm leading-relaxed text-brand-black">
                {FACTS.notALawFirm} {FACTS.payment}
              </p>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
