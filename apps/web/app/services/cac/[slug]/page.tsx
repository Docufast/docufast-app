"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCacType } from "@/lib/cacTypes";

export default function CacOrderPage() {
  const params = useParams();
  const slug = params.slug as string;
  const cacType = getCacType(slug);
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  if (!cacType) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-black">Service not found</h1>
        <Link href="/services/cac" className="mt-4 inline-block font-bold underline">
          ← Back to CAC & Compliance
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
            For {cacType!.label.toLowerCase()}, you'd normally receive a quote by email and
            WhatsApp within 2 business hours, including any government fees.
          </p>
          <p className="mt-3 rounded-card border-2 border-dashed border-brand-gray-light p-3 text-xs text-brand-gray">
            Note: this isn't connected to a live backend yet — name checking, filing, and
            payment go live once Phase 3–4 are built.
          </p>
          <Link
            href="/services/cac"
            className="mt-5 inline-block rounded-card bg-brand-black px-5 py-3 text-sm font-bold text-brand-white"
          >
            ← Back to CAC & Compliance
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
        <Link href="/services/cac" className="text-sm font-semibold uppercase tracking-wide">
          ← CAC & Compliance
        </Link>
      </nav>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-black">{cacType.label}</h1>
          <p className="mt-1 text-sm text-brand-gray">{cacType.desc}</p>
        </div>

        <div className="rounded-card border-2 border-brand-black">
          <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
            Filing details
          </div>
          <div className="flex flex-col gap-4 p-4">
            {cacType.fields.map((field) => (
              <div key={field.label}>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    rows={3}
                    placeholder={field.placeholder}
                    value={values[field.label] || ""}
                    onChange={(e) => setValues({ ...values, [field.label]: e.target.value })}
                    className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
                  />
                ) : field.type === "file" ? (
                  <div className="rounded-input border-4 border-dashed border-brand-black px-3 py-4 text-center text-sm text-brand-gray">
                    Click or drag a file here
                  </div>
                ) : (
                  <input
                    type={field.type === "date" ? "date" : "text"}
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

        {cacType.note && (
          <div className="rounded-card border-l-4 border-brand-yellow bg-brand-yellow/10 px-4 py-3 text-sm text-brand-black">
            {cacType.note}
          </div>
        )}

        <button
          type="submit"
          className="rounded-card bg-brand-black px-4 py-4 text-base font-bold text-brand-white"
        >
          Request quote →
        </button>
        <p className="text-center text-xs text-brand-gray">
          Quote arrives within 2 business hours, itemising any government fees. No payment
          at this step.
        </p>
      </form>
    </main>
  );
}
