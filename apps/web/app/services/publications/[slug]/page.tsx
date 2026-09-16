"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPublicationType } from "@/lib/publicationTypes";

export default function PublicationOrderPage() {
  const params = useParams();
  const slug = params.slug as string;
  const pubType = getPublicationType(slug);
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  if (!pubType) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-black">Service not found</h1>
        <Link href="/services/publications" className="mt-4 inline-block font-bold underline">
          ← Back to publications
        </Link>
      </main>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        <div className="rounded-card border-4 border-brand-black bg-brand-yellow/10 p-8">
          <h1 className="text-2xl font-extrabold text-brand-black">Quote request captured</h1>
          <p className="mt-3 text-sm text-brand-gray">
            For {pubType!.label.toLowerCase()}, you'd normally receive a quote within 2
            business hours — this order is paired with its supporting affidavit or CAC
            filing under one parent order.
          </p>
          <p className="mt-3 rounded-card border-2 border-dashed border-brand-gray-light p-3 text-xs text-brand-gray">
            Note: this isn't connected to a live backend yet — pairing with a parent order
            and payment go live once Phase 3–5 are built.
          </p>
          <Link
            href="/services/publications"
            className="mt-5 inline-block rounded-card bg-brand-black px-5 py-3 text-sm font-bold text-brand-white"
          >
            ← Back to publications
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
        <Link href="/services/publications" className="text-sm font-semibold uppercase tracking-wide">
          ← Publications
        </Link>
      </nav>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-black">{pubType.label}</h1>
          <p className="mt-1 text-sm text-brand-gray">{pubType.desc}</p>
        </div>

        <div className="rounded-card border-l-4 border-brand-yellow bg-brand-yellow/10 px-4 py-3 text-sm text-brand-black">
          This publication is always paired with a supporting affidavit or CAC filing —
          tracked under one parent order.
        </div>

        <div className="rounded-card border-2 border-brand-black">
          <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
            Publication details
          </div>
          <div className="flex flex-col gap-4 p-4">
            {pubType.fields.map((field) => (
              <div key={field.label}>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <div className="flex gap-2">
                    {field.options?.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setValues({ ...values, [field.label]: opt })}
                        className={`flex-1 rounded-card border-4 border-brand-black px-3 py-2 text-sm font-bold ${
                          values[field.label] === opt ? "bg-brand-black text-brand-white" : ""
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    placeholder={field.placeholder}
                    value={values[field.label] || ""}
                    onChange={(e) => setValues({ ...values, [field.label]: e.target.value })}
                    className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="rounded-card bg-brand-black px-4 py-4 text-base font-bold text-brand-white"
        >
          Request quote →
        </button>
        <p className="text-center text-xs text-brand-gray">
          Quote arrives within 2 business hours. No payment at this step.
        </p>
      </form>
    </main>
  );
}
