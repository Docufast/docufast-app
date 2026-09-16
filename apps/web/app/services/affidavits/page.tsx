"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Exact order_type values and groupings from the Platform Playbook.
const CATEGORIES = [
  {
    name: "Name",
    types: [
      { slug: "change_of_name", label: "Change of Name" },
      { slug: "correction_of_name", label: "Correction of Name" },
      { slug: "confirmation_of_name", label: "Confirmation of Name" },
      { slug: "addition_removal_of_name", label: "Addition/Removal of Name" },
      { slug: "rearrangement_of_name", label: "Re-Arrangement of Name" },
      { slug: "combined_correction_name_dob", label: "Combined Correction of Name & DOB" },
    ],
  },
  {
    name: "Birth / Age",
    types: [
      { slug: "age_declaration_adult", label: "Age Declaration (Adult)" },
      { slug: "age_declaration_minor_male", label: "Age Declaration (Minor, Male)" },
      { slug: "age_declaration_minor_female", label: "Age Declaration (Minor, Female)" },
      { slug: "correction_of_dob", label: "Correction of Date of Birth" },
      { slug: "attestation_birth_cert", label: "Attestation of Birth Certificate" },
    ],
  },
  {
    name: "Loss",
    types: [
      { slug: "loss_general", label: "Loss of Items (General)" },
      { slug: "loss_workplace_id", label: "Loss of Workplace ID" },
      { slug: "loss_sim_card", label: "Loss of SIM Card" },
      { slug: "loss_sim_no_id", label: "Loss of SIM (No ID)" },
      { slug: "loss_jamb_sim", label: "Loss of JAMB/UTME SIM" },
      { slug: "loss_intl_passport", label: "Loss of International Passport" },
      { slug: "loss_drivers_licence", label: "Loss of Driver's Licence" },
      { slug: "loss_vehicle_docs", label: "Loss of Vehicle Documents" },
    ],
  },
  {
    name: "Marriage",
    types: [
      { slug: "bachelorhood_spinsterhood", label: "Bachelorhood/Spinsterhood" },
      { slug: "declaration_of_marriage", label: "Declaration of Marriage" },
      { slug: "dissolution_of_marriage", label: "Dissolution of Marriage" },
    ],
  },
  {
    name: "Death",
    types: [
      { slug: "declaration_of_death", label: "Declaration of Death" },
      { slug: "release_of_corpse", label: "Release of Corpse" },
    ],
  },
  {
    name: "Student",
    types: [
      { slug: "loss_school_id", label: "Loss of School ID" },
      { slug: "confirmation_of_result", label: "Confirmation of Result" },
      { slug: "good_conduct", label: "Good Conduct" },
      { slug: "support_sponsorship", label: "Support/Sponsorship" },
    ],
  },
  {
    name: "Status",
    types: [
      { slug: "change_car_ownership", label: "Change of Car Ownership" },
      { slug: "change_of_residence", label: "Change of Residence" },
      { slug: "change_of_signature", label: "Change of Signature" },
    ],
  },
];

const TOTAL = CATEGORIES.reduce((sum, cat) => sum + cat.types.length, 0);

export default function AffidavitsPage() {
  const [search, setSearch] = useState("");

  const filtered = CATEGORIES.map((cat) => ({
    ...cat,
    types: cat.types.filter((t) =>
      t.label.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.types.length > 0);

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
            Affidavits <span className="text-brand-gray">· {TOTAL} types</span>
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
          {filtered.map((cat) => (
            <div key={cat.name}>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">
                {cat.name} <span className="text-brand-gray">· {cat.types.length}</span>
              </h2>
              <div className="mt-2 divide-y-2 divide-brand-black rounded-card border-2 border-brand-black">
                {cat.types.map((t) => (
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

          {filtered.length === 0 && (
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
