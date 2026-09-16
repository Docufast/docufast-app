"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AFFIDAVIT_TYPES, AffidavitCategory } from "@/lib/affidavitTypes";

const CATEGORY_LABELS: Record<AffidavitCategory, string> = {
  name: "Name",
  birth_age: "Birth / Age",
  loss: "Loss",
  marriage: "Marriage",
  death: "Death",
  student: "Student",
  status: "Status",
};

const CATEGORY_ORDER: AffidavitCategory[] = [
  "name",
  "birth_age",
  "loss",
  "marriage",
  "death",
  "student",
  "status",
];

export default function AffidavitsPage() {
  const [search, setSearch] = useState("");

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    types: AFFIDAVIT_TYPES.filter(
      (t) => t.category === cat && t.label.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((g) => g.types.length > 0);

  return (
    <>
      <main className="mx-auto max-w-4xl px-6 py-6 lg:px-16 lg:py-10">
        <nav className="flex items-center gap-6 border-b-4 border-brand-black pb-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo-black.png" alt="Docufast" width={28} height={28} />
            <span className="text-xl font-extrabold tracking-wide text-brand-black">
              DOCUFAST
            </span>
          </Link>
          <Link href="/services" className="text-sm font-semibold uppercase tracking-wide">
            ← All services
          </Link>
          <Link
            href="/sign-in"
            className="ml-auto text-sm font-bold uppercase tracking-wide"
          >
            Sign in
          </Link>
        </nav>

        <div className="mt-8">
          <h1 className="text-3xl font-extrabold text-brand-black">
            Affidavits <span className="text-brand-gray">· {AFFIDAVIT_TYPES.length} types</span>
          </h1>
          <p className="mt-2 text-brand-gray">
            Sworn before a Commissioner for Oaths, or a Notary Public for documents going
            abroad. Standard turnaround 48 hours.
          </p>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search affidavit types…"
            className="mt-4 w-full rounded-input border-4 border-brand-black px-4 py-3 text-base outline-none"
          />
        </div>

        <div className="mt-8 flex flex-col gap-6">
          {grouped.map((g) => (
            <div key={g.category}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">
                {g.label} <span className="text-brand-gray">· {g.types.length}</span>
              </h2>
              <div className="mt-2 divide-y-2 divide-brand-black rounded-card border-2 border-brand-black">
                {g.types.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/services/affidavits/${t.slug}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-brand-yellow/10"
                  >
                    <span className="text-sm font-medium text-brand-black">{t.label}</span>
                    <span className="text-brand-gray">→</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {grouped.length === 0 && (
            <p className="text-sm text-brand-gray">
              No matches. Can't find what you need? Chat with us on WhatsApp and we'll match
              the right affidavit for you.
            </p>
          )}
        </div>
      </main>

      <footer className="border-t-4 border-brand-black bg-brand-black px-6 py-10 text-brand-white lg:px-16">
        <div className="flex flex-col gap-2 text-xs text-neutral-400">
          <span>SCUML SC251840209 | NDPC DCP/07770 | SMEDAN SUIN426476832438 | RC1893484</span>
          <span>© 2026 Docufast Integrated Services Ltd</span>
        </div>
      </footer>

      <a
        href="https://wa.me/2347085918205"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-card bg-brand-yellow px-4 py-3 text-sm font-bold text-brand-black shadow-lg hover:bg-brand-yellow-dark"
      >
        Chat with us on WhatsApp
      </a>
    </>
  );
}
