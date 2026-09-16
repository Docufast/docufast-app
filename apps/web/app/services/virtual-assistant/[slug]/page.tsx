"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getVaType } from "@/lib/virtualAssistantTypes";
import FileUpload from "@/components/ui/FileUpload";

export default function VaOrderPage() {
  const params = useParams();
  const slug = params.slug as string;
  const vaType = getVaType(slug);
  const [submitted, setSubmitted] = useState(false);
  const [format, setFormat] = useState<string | null>(null);
  const [turnaround, setTurnaround] = useState<"standard" | "rush">("standard");
  const [instructions, setInstructions] = useState("");

  if (!vaType) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-black">Service not found</h1>
        <Link href="/services/virtual-assistant" className="mt-4 inline-block font-bold underline">
          ← Back
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
            For {vaType!.label.toLowerCase()}, you'd normally receive a quote within 2
            business hours. No identity verification is needed for this service.
          </p>
          <p className="mt-3 rounded-card border-2 border-dashed border-brand-gray-light p-3 text-xs text-brand-gray">
            Note: this isn't connected to a live backend yet — file upload and payment go
            live once Phase 3 and 10 are built.
          </p>
          <Link
            href="/services/virtual-assistant"
            className="mt-5 inline-block rounded-card bg-brand-black px-5 py-3 text-sm font-bold text-brand-white"
          >
            ← Back
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
        <Link href="/services/virtual-assistant" className="text-sm font-semibold uppercase tracking-wide">
          ← Virtual Office & Clerical
        </Link>
      </nav>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-black">{vaType.label}</h1>
          <p className="mt-1 text-sm text-brand-gray">{vaType.desc}</p>
        </div>

        <div className="rounded-card border-2 border-brand-black">
          <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
            Brief
          </div>
          <div className="flex flex-col gap-4 p-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                Source file
              </label>
              <FileUpload />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                Output format
              </label>
              <div className="flex gap-2">
                {vaType.outputFormats.map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormat(fmt)}
                    className={`flex-1 rounded-card border-4 border-brand-black px-3 py-2 text-sm font-bold ${
                      format === fmt ? "bg-brand-black text-brand-white" : ""
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                Turnaround
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTurnaround("standard")}
                  className={`flex-1 rounded-card border-4 border-brand-black px-3 py-2 text-sm font-bold ${
                    turnaround === "standard" ? "bg-brand-black text-brand-white" : ""
                  }`}
                >
                  Standard · 48h
                </button>
                <button
                  type="button"
                  onClick={() => setTurnaround("rush")}
                  className={`flex-1 rounded-card border-4 border-brand-black px-3 py-2 text-sm font-bold ${
                    turnaround === "rush" ? "bg-brand-black text-brand-white" : ""
                  }`}
                >
                  Rush · 12h
                </button>
              </div>
              {turnaround === "rush" && (
                <p className="mt-1 text-xs text-brand-gray">Rush work is quoted at a premium.</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                Special instructions
              </label>
              <textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
              />
            </div>
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
