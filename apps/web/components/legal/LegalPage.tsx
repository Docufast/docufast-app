import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

// Shared layout for /privacy and /terms (#32). Text comes from "Docufast Privacy Notice and
// Terms of Service (final for publication, 21 Oct 2026)" in Team Drafts, reviewed by Sheriff.
// Anything still in [BRACKETS] is an open item: the page shows it highlighted so reviewers
// see it, and it must be filled before this ships to production.

export const LEGAL_LAST_UPDATED = "[DATE]";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  const isProduction = process.env.VERCEL_ENV === "production";
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-16">
      <div className="flex items-center gap-2 border-b-4 border-brand-black pb-4">
        <Image src="/images/logo-black.png" alt="Docufast" width={28} height={28} />
        <span className="text-xl font-extrabold tracking-wide text-brand-black">DOCUFAST</span>
        <Link href="/" className="ml-auto text-sm font-bold uppercase tracking-wide">
          ← Home
        </Link>
      </div>

      {!isProduction && (
        <div className="mt-6 rounded-card border-l-4 border-brand-yellow bg-brand-yellow/10 px-4 py-3 text-sm text-brand-black">
          Staging review copy. Waiting for Sheriff&apos;s sign-off and the items highlighted in
          brackets. This notice does not appear on the live site.
        </div>
      )}

      <h1 className="mt-6 text-3xl font-extrabold text-brand-black">{title}</h1>
      <p className="mt-1 text-sm text-brand-gray">
        Last updated: <Open>{LEGAL_LAST_UPDATED}</Open>
      </p>

      <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-brand-black">{children}</div>
    </main>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-brand-black">{title}</h2>
      <div className="mt-2 flex flex-col gap-3 text-brand-gray">{children}</div>
    </section>
  );
}

export function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} className="border-b border-brand-gray-light py-2 pr-4 font-semibold text-brand-black">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="align-top">
              {row.map((cell, j) => (
                <td key={j} className="border-b border-brand-gray-light py-2 pr-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// An open item still to be filled. Highlighted so it is never missed in review.
export function Open({ children }: { children: ReactNode }) {
  return <mark className="rounded bg-[#FDF0C4] px-1 text-brand-black">{children}</mark>;
}
