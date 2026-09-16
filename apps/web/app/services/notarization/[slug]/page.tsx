"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPlatformNativeType } from "@/lib/platformNativeTypes";
import FileUpload from "@/components/ui/FileUpload";

export default function PlatformNativeOrderPage() {
  const params = useParams();
  const slug = params.slug as string;
  const item = getPlatformNativeType(slug);
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  if (!item) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-black">Service not found</h1>
        <Link href="/services/notarization" className="mt-4 inline-block font-bold underline">
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
          <h1 className="text-2xl font-extrabold text-brand-black">Request captured</h1>
          <p className="mt-3 text-sm text-brand-gray">
            For {item!.label.toLowerCase()}, you'd normally receive next steps by email and
            WhatsApp within 2 business hours.
          </p>
          <p className="mt-3 rounded-card border-2 border-dashed border-brand-gray-light p-3 text-xs text-brand-gray">
            Note: this isn't connected to a live backend yet — scheduling, subscriptions, and
            payment go live once Phase 9–10 are built.
          </p>
          <Link
            href="/services/notarization"
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
        <Link href="/services/notarization" className="text-sm font-semibold uppercase tracking-wide">
          ← Platform-Native
        </Link>
      </nav>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-black">{item.label}</h1>
          <p className="mt-1 text-sm text-brand-gray">{item.desc}</p>
        </div>

        {/* Digital Notarization — document + signer + session */}
        {slug === "digital_notarization" && (
          <>
            <div className="rounded-card border-l-4 border-brand-yellow bg-brand-yellow/10 px-4 py-3 text-sm text-brand-black">
              A live video session with the notary is required by law. It takes about 10
              minutes. A registered Notary Public conducts every session.
            </div>
            <div className="rounded-card border-2 border-brand-black">
              <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
                Document & signer
              </div>
              <div className="flex flex-col gap-4 p-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                    Document to notarize
                  </label>
                  <FileUpload
                    onFileSelect={(file) => setValues({ ...values, docFile: file?.name || "" })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                    What is this document?
                  </label>
                  <input
                    placeholder="e.g. Deed of assignment — land, Lekki Phase 1"
                    value={values.doc || ""}
                    onChange={(e) => setValues({ ...values, doc: e.target.value })}
                    className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                    Signer's full name (as on ID)
                  </label>
                  <input
                    value={values.signer || ""}
                    onChange={(e) => setValues({ ...values, signer: e.target.value })}
                    className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Vault Subscription — plan info, no payment yet */}
        {slug === "document_vault_subscription" && (
          <div className="rounded-card border-2 border-brand-black">
            <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
              Subscription
            </div>
            <div className="flex flex-col gap-3 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Free access period</span>
                <span className="font-bold">1 month after delivery</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Permanent storage plan</span>
                <span className="font-bold">Annual flat fee</span>
              </div>
              <div>
                <label className="mb-1.5 mt-2 block text-xs font-semibold uppercase tracking-wide">
                  Which entity is this for?
                </label>
                <input
                  placeholder="e.g. Personal, or a registered business name"
                  value={values.entity || ""}
                  onChange={(e) => setValues({ ...values, entity: e.target.value })}
                  className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Compliance Reminder Setup — entity + obligations */}
        {slug === "compliance_reminder_setup" && (
          <div className="rounded-card border-2 border-brand-black">
            <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
              Entity & obligations
            </div>
            <div className="flex flex-col gap-4 p-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                  Entity name
                </label>
                <input
                  value={values.entityName || ""}
                  onChange={(e) => setValues({ ...values, entityName: e.target.value })}
                  className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                  Entity registration number (RC/BN)
                </label>
                <input
                  value={values.rc || ""}
                  onChange={(e) => setValues({ ...values, rc: e.target.value })}
                  className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
                />
              </div>
              <p className="text-xs text-brand-gray">
                Tracks CAC Annual Returns, FIRS, LIRS, NDPC, SCUML, and NITDA deadlines with
                reminders at 90, 60, 30, 14 and 7 days before each is due.
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="rounded-card bg-brand-black px-4 py-4 text-base font-bold text-brand-white"
        >
          {slug === "digital_notarization" ? "Schedule session →" : "Continue →"}
        </button>
      </form>
    </main>
  );
}
