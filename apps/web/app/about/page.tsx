// app/about/page.tsx
// The fact sheet as a public page. Every fact comes from lib/seo/facts.ts, never typed here,
// so the page, the structured data and llms.txt cannot disagree.

import Link from "next/link";
import HomeLink from "@/components/ui/HomeLink";
import AuthNavLink from "@/components/ui/AuthNavLink";
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

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: "Home", path: "/" },
          { name: "About Docufast", path: "/about" },
        ])}
      />
      <main className="mx-auto max-w-3xl px-6 py-6 lg:px-16 lg:py-10">
        <nav className="flex items-center gap-6 border-b-4 border-brand-black pb-4">
          <HomeLink />
          <AuthNavLink />
        </nav>

        <h1 className="mt-8 text-3xl font-extrabold text-brand-black">About Docufast</h1>
        <p className="mt-3 text-lg text-brand-black">{FACTS.oneLine}</p>
        <p className="mt-3 text-brand-gray">{FACTS.notALawFirm}</p>

        <h2 className="mt-10 text-2xl font-extrabold text-brand-black">What we do</h2>
        <p className="mt-2 text-brand-gray">{FACTS.servicesLine}.</p>
        <ul className="mt-4 flex flex-col gap-3">
          {SERVICES.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="font-bold underline">
                {s.label}
              </Link>
              <span className="text-brand-gray">: {s.note}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-2xl font-extrabold text-brand-black">How an order works</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-6 text-brand-gray">
          {STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="mt-3 text-brand-gray">
          {FACTS.quotePromise}. {FACTS.affidavitDelivery}. A person checks every document before it is
          delivered to your encrypted Vault, where it carries a QR code anyone can verify.
        </p>

        <h2 className="mt-10 text-2xl font-extrabold text-brand-black">Company details</h2>
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-[14rem_1fr]">
          <dt className="font-bold">Legal name</dt>
          <dd className="text-brand-gray">{FACTS.legalName}</dd>
          <dt className="font-bold">CAC registration</dt>
          <dd className="text-brand-gray">{FACTS.rcNumber}</dd>
          <dt className="font-bold">Incorporated</dt>
          <dd className="text-brand-gray">{longDate(FACTS.incorporated)}</dd>
          <dt className="font-bold">Registered address</dt>
          <dd className="text-brand-gray">
            {FACTS.address.street}, {FACTS.address.locality}, {FACTS.address.region}. We work online only,
            with no walk-in customers.
          </dd>
          <dt className="font-bold">Founder</dt>
          <dd className="text-brand-gray">{FACTS.founder.name}, {FACTS.founder.jobTitle}</dd>
        </dl>

        <h2 className="mt-10 text-2xl font-extrabold text-brand-black">Registrations</h2>
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-[14rem_1fr]">
          {FACTS.registrations.map((r) => (
            <div key={r.name} className="contents">
              <dt className="font-bold">{r.name}</dt>
              <dd className="text-brand-gray">{r.value}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-10 text-2xl font-extrabold text-brand-black">Contact and payment safety</h2>
        <p className="mt-2 text-brand-gray">
          WhatsApp support: {FACTS.support.whatsappDisplay}. {FACTS.support.hours}.
        </p>
        <p className="mt-2 text-brand-gray">{FACTS.payment}</p>
        <p className="mt-4">
          <Link href="/faq" className="font-bold underline">
            Read the frequently asked questions
          </Link>
        </p>
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
