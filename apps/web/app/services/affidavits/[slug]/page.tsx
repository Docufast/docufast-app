"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAffidavitType, AffidavitCategory } from "@/lib/affidavitTypes";
import { supabase } from "@/lib/supabase";
import { useOrg } from "@/contexts/OrgContext";

// Extra fields shown depending on the affidavit's category — the pattern
// repeats across all types, only the category-specific block changes.
const CATEGORY_FIELDS: Record<AffidavitCategory, { key: string; label: string; placeholder: string }[]> = {
  name: [
    { key: "old_name", label: "Current/old name", placeholder: "As it appears on your ID" },
    { key: "new_name", label: "New/correct name", placeholder: "The name to be used going forward" },
    { key: "reason", label: "Reason for change", placeholder: "e.g. marriage, personal preference" },
  ],
  birth_age: [
    { key: "declared_dob", label: "Declared date of birth", placeholder: "DD/MM/YYYY" },
    { key: "context", label: "Supporting context", placeholder: "Why this declaration is needed" },
  ],
  loss: [
    { key: "item_lost", label: "Item lost", placeholder: "Describe what was lost" },
    { key: "date_lost", label: "Approximate date lost", placeholder: "e.g. Early September 2026" },
    { key: "location_lost", label: "Where it was lost", placeholder: "e.g. In transit, Oshodi to Ikeja" },
  ],
  marriage: [
    { key: "spouse_name", label: "Spouse's full name", placeholder: "If applicable" },
    { key: "relevant_date", label: "Relevant date", placeholder: "Marriage or dissolution date" },
  ],
  death: [
    { key: "deceased_name", label: "Deceased's full name", placeholder: "" },
    { key: "date_of_death", label: "Date of death", placeholder: "DD/MM/YYYY" },
  ],
  student: [
    { key: "institution", label: "Institution name", placeholder: "" },
    { key: "reg_number", label: "Matriculation/registration number", placeholder: "" },
  ],
  status: [
    { key: "previous_detail", label: "Previous detail", placeholder: "e.g. old address, old vehicle owner" },
    { key: "new_detail", label: "New detail", placeholder: "e.g. new address, new vehicle owner" },
  ],
};

export default function AffidavitOrderPage() {
  const params = useParams();
  const slug = params.slug as string;
  const affidavitType = getAffidavitType(slug);
  const { activeOrgId } = useOrg();

  const [deponentName, setDeponentName] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [purpose, setPurpose] = useState("");
  const [authenticatedBy, setAuthenticatedBy] = useState<"commissioner" | "notary">("commissioner");
  const [copies, setCopies] = useState(1);
  const [extraValues, setExtraValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!affidavitType) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-black">Affidavit type not found</h1>
        <Link href="/services/affidavits" className="mt-4 inline-block font-bold underline">
          ← Back to affidavits
        </Link>
      </main>
    );
  }

  const extraFields = CATEGORY_FIELDS[affidavitType.category];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!deponentName || !jurisdiction || !purpose) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Orders require an account — send them to sign in, then back here.
      window.location.href = `/sign-in?redirect=/services/affidavits/${slug}`;
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      entity_id: activeOrgId === "personal" ? null : activeOrgId,
      service_category: "affidavit",
      order_type: slug,
      status: "quote_pending",
      form_data: {
        deponent_name: deponentName,
        jurisdiction,
        purpose,
        authenticated_by: authenticatedBy,
        copies,
        ...extraValues,
      },
    });

    setSubmitting(false);
    if (error) {
      setSubmitError(error.message);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        <div className="rounded-card border-4 border-brand-black bg-brand-yellow/10 p-8">
          <h1 className="text-2xl font-extrabold text-brand-black">Order received</h1>
          <p className="mt-3 text-sm text-brand-gray">
            Your request for {affidavitType.label.toLowerCase()} has been saved. You'll
            receive a quote by email and WhatsApp within 2 business hours.
          </p>
          <Link
            href="/orders"
            className="mt-5 inline-block rounded-card bg-brand-black px-5 py-3 text-sm font-bold text-brand-white"
          >
            View your orders →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-6 lg:px-16 lg:py-10">
      <nav className="flex items-center gap-6 border-b-4 border-brand-black pb-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo-black.png" alt="Docufast" width={28} height={28} />
          <span className="text-xl font-extrabold tracking-wide text-brand-black">DOCUFAST</span>
        </Link>
        <Link href="/services/affidavits" className="text-sm font-semibold uppercase tracking-wide">
          ← Affidavits
        </Link>
      </nav>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-black">{affidavitType.label}</h1>
          <p className="mt-1 text-sm text-brand-gray">
            Fields adapt per affidavit type — this pattern repeats across all 31 types.
          </p>
        </div>

        <div className="rounded-card border-2 border-brand-black">
          <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
            Deponent
          </div>
          <div className="flex flex-col gap-4 p-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                Full name
              </label>
              <input
                value={deponentName}
                onChange={(e) => setDeponentName(e.target.value)}
                className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                Jurisdiction / Court
              </label>
              <input
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                placeholder="e.g. High Court of Lagos State — Ikeja"
                className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-card border-2 border-brand-black">
          <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
            {affidavitType.label} details
          </div>
          <div className="flex flex-col gap-4 p-4">
            {extraFields.map((field) => (
              <div key={field.key}>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                  {field.label}
                </label>
                <input
                  placeholder={field.placeholder}
                  value={extraValues[field.key] || ""}
                  onChange={(e) => setExtraValues({ ...extraValues, [field.key]: e.target.value })}
                  className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
                />
              </div>
            ))}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                Purpose of affidavit
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={2}
                className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-card border-2 border-brand-black">
          <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
            Attestation & copies
          </div>
          <div className="flex flex-col gap-4 p-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                Authenticated by
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAuthenticatedBy("commissioner")}
                  className={`flex-1 rounded-card border-4 border-brand-black px-3 py-2 text-sm font-bold ${
                    authenticatedBy === "commissioner" ? "bg-brand-black text-brand-white" : ""
                  }`}
                >
                  Commissioner for Oaths
                </button>
                <button
                  type="button"
                  onClick={() => setAuthenticatedBy("notary")}
                  className={`flex-1 rounded-card border-4 border-brand-black px-3 py-2 text-sm font-bold ${
                    authenticatedBy === "notary" ? "bg-brand-black text-brand-white" : ""
                  }`}
                >
                  Notary Public
                </button>
              </div>
              <p className="mt-1 text-xs text-brand-gray">
                Notary is required for documents going abroad; the court commissioner is
                standard locally.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                Certified copies
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCopies(n)}
                    className={`flex h-10 w-10 items-center justify-center rounded-card border-4 border-brand-black text-sm font-bold ${
                      copies === n ? "bg-brand-black text-brand-white" : ""
                    }`}
                  >
                    {n === 5 ? "5+" : n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {submitError && <p className="text-sm text-brand-error">{submitError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-card bg-brand-black px-4 py-4 text-base font-bold text-brand-white disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Request quote →"}
        </button>
        <p className="text-center text-xs text-brand-gray">
          Quote arrives within 2 business hours. No payment at this step.
        </p>
      </form>
    </main>
  );
}
