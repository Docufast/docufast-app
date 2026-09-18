"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getVaType } from "@/lib/virtualAssistantTypes";
import FileUpload from "@/components/ui/FileUpload";
import { supabase } from "@/lib/supabase";
import { useOrg } from "@/contexts/OrgContext";

import HomeLink from "@/components/ui/HomeLink";
export default function VaOrderPage() {
  const params = useParams();
  const slug = params.slug as string;
  const vaType = getVaType(slug);
  const [submitted, setSubmitted] = useState(false);
  const [format, setFormat] = useState<string | null>(null);
  const [turnaround, setTurnaround] = useState<"standard" | "rush">("standard");
  const [instructions, setInstructions] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState<string | null>(null);
  const { activeOrgId } = useOrg();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = `/sign-in?redirect=/services/virtual-assistant/${slug}`;
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      entity_id: activeOrgId === "personal" ? null : activeOrgId,
      service_category: "virtual_assistant",
      order_type: slug,
      status: "quote_pending",
      form_data: { source_file: fileName, source_file_r2_key: fileKey, output_format: format, turnaround, instructions },
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
            Your request for {vaType!.label.toLowerCase()} has been saved. You'll receive a
            quote within 2 business hours. No identity verification is needed for this
            service.
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
        <HomeLink />
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
              <FileUpload
                onFileSelect={(file) => setFileName(file?.name || null)}
                onUploadComplete={(key) => setFileKey(key)}
              />
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
