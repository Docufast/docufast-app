import Link from "next/link";
import Image from "next/image";
import AuthNavLink from "@/components/ui/AuthNavLink";

import HomeLink from "@/components/ui/HomeLink";
// Full service catalogue — 46 services across 5 categories, per the Platform Playbook.
const CATEGORIES = [
  {
    slug: "affidavits",
    name: "Affidavits",
    count: 31,
    turnaround: "Standard 48h",
    desc: "Change of name, loss, marriage, birth/age, death, student and status affidavits.",
  },
  {
    slug: "cac",
    name: "CAC & Compliance",
    count: 6,
    turnaround: "3–10 working days",
    desc: "Business name, LTD incorporation, incorporated trustees, annual returns, amendments.",
  },
  {
    slug: "publications",
    name: "Newspaper Publications",
    count: 3,
    turnaround: "24–72 hours",
    desc: "Name change, loss of documents, and incorporated trustees public notices.",
  },
  {
    slug: "virtual-assistant",
    name: "Virtual Office & Clerical",
    count: 3,
    turnaround: "Standard 48h",
    desc: "Document typing, data entry, and audio/video transcription.",
  },
  {
    slug: "notarization",
    name: "Platform-Native",
    count: 3,
    turnaround: "Varies",
    desc: "Digital notarization, document vault subscription, compliance reminder setup.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-6 lg:px-16 lg:py-10">
        <nav className="flex items-center gap-6 border-b-4 border-brand-black pb-4">
          <HomeLink />
          <span className="text-sm font-semibold uppercase tracking-wide">Services</span>
          <Link
            href="/sign-in"
            className="ml-auto text-sm font-bold uppercase tracking-wide"
          >
            Sign in
          </Link>
        </nav>

        <div className="mt-10 max-w-2xl">
          <span className="w-fit rounded-card bg-brand-yellow px-2.5 py-1 text-xs font-bold uppercase tracking-widest">
            46 services · one platform
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-brand-black">
            Every service quoted before work starts, tracked end to end.
          </h1>
          <p className="mt-3 text-brand-gray">
            Pick a category to see what's covered. No prices shown here — every order gets a
            real quote within 2 business hours before anything is charged.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/services/${cat.slug}`}
              className="rounded-card border-4 border-brand-black p-6 hover:bg-brand-yellow/10"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-brand-black">{cat.name}</h2>
                <span className="rounded-card bg-brand-black px-2.5 py-1 text-xs font-bold text-brand-white">
                  {cat.count} types
                </span>
              </div>
              <p className="mt-2 text-sm text-brand-gray">{cat.desc}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">
                {cat.turnaround}
              </p>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t-4 border-brand-black bg-brand-black px-6 py-10 text-brand-white lg:px-16">
        <div className="flex flex-col gap-2 text-xs text-neutral-400">
          <span>SCUML SC251840209 | NDPC DCP/07770 | SMEDAN SUIN426476832438 | RC1893484</span>
          <span>© 2026 Docufast Integrated Services Ltd</span>
        </div>
      </footer>
</>
  );
}
