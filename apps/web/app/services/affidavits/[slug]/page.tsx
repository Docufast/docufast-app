"use client";

import { ordersPausedMessage } from "@/lib/ordersPaused";
import { saveDraft, loadDraft, clearDraft } from "@/lib/formDraft";
import { FACTS } from "@/lib/seo/facts";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAffidavitType, AffidavitCategory } from "@/lib/affidavitTypes";
import { supabase } from "@/lib/supabase";
import { useOrg } from "@/contexts/OrgContext";

import HomeLink from "@/components/ui/HomeLink";
import {
  COURTS, DIVISIONS, COURT_HELP, COPIES_HELP, OTHER, USES, ALL_PURPOSES, PURPOSE_MAX_CHARS, jurisdictionText, reasonOptions, suggestedPurpose,
  toggleUse, onePageCheck,
} from "@/lib/affidavitGuide";
import { affidavitQuote, amountText, naira, type Quote } from "@/lib/pricing";
import PaymentFeeRows, { PAYMENT_FEE_NOTE } from "@/components/PaymentFeeRows";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
// Extra fields shown depending on the affidavit's category — the pattern
// repeats across all types, only the category-specific block changes.
const CATEGORY_FIELDS: Record<AffidavitCategory, { key: string; label: string; placeholder: string }[]> = {
  name: [
    { key: "old_name", label: "Current/old name", placeholder: "As it appears on your ID" },
    { key: "new_name", label: "New/correct name", placeholder: "The name to be used going forward" },
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
  const [court, setCourt] = useState<string>(COURTS[0].value);
  const [division, setDivision] = useState<string>(DIVISIONS[0]);
  const [reasonChoice, setReasonChoice] = useState("");
  const [reasonOther, setReasonOther] = useState("");
  const [uses, setUses] = useState<string[]>([]);
  const [purposeEdited, setPurposeEdited] = useState<string | null>(null); // null = use the suggestion
  const [authenticatedBy, setAuthenticatedBy] = useState<"commissioner" | "notary">("commissioner");
  const copies = 1; // one certified copy per order (JSB, 1 Nov 2026)
  const [speed, setSpeed] = useState<"standard" | "express">("standard");
  const [extraValues, setExtraValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{ id: string; ref: string; quote: Quote; auto: boolean } | null>(null);

  // Restore what they had typed before they were sent to sign in (kept in this tab for up to two hours).
  useEffect(() => {
    const d = loadDraft<Record<string, unknown>>(`affidavit:${slug}`);
    if (!d || typeof d !== "object") return;
    if (typeof d.deponentName === "string") setDeponentName(d.deponentName);
    if (typeof d.court === "string") setCourt(d.court);
    if (typeof d.division === "string") setDivision(d.division);
    if (typeof d.reasonChoice === "string") setReasonChoice(d.reasonChoice);
    if (typeof d.reasonOther === "string") setReasonOther(d.reasonOther);
    if (Array.isArray(d.uses)) setUses(d.uses.filter((x): x is string => typeof x === "string"));
    if (typeof d.purposeEdited === "string") setPurposeEdited(d.purposeEdited);
    if (d.authenticatedBy === "commissioner" || d.authenticatedBy === "notary") setAuthenticatedBy(d.authenticatedBy);
    if (d.speed === "standard" || d.speed === "express") setSpeed(d.speed);
    if (d.extraValues && typeof d.extraValues === "object") setExtraValues(d.extraValues as Record<string, string>);
  }, [slug]);

  const reason = affidavitType ? reasonOptions(slug, affidavitType.category) : null;
  const reasonValue = reasonChoice === OTHER ? reasonOther.trim() : reasonChoice;
  const fieldValues = useMemo(
    () => ({ ...extraValues, ...(reason && reasonValue ? { [reason.key]: reasonValue } : {}) }),
    [extraValues, reason, reasonValue]
  );
  const suggestion = affidavitType ? suggestedPurpose(slug, affidavitType.category, fieldValues, uses, deponentName) : "";
  const purpose = purposeEdited ?? suggestion;
  const page = onePageCheck(purpose); // every affidavit fits on one page (JSB, 3 Nov 2026)
  const jurisdiction = jurisdictionText(court, division);
  const quote = affidavitQuote(slug, speed, copies);

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

  if (affidavitType.notOrderable) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="break-words text-2xl font-bold text-brand-black">{affidavitType.label}</h1>
        <p className="mt-3 text-sm text-brand-black">{affidavitType.notOrderable}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="https://wa.me/2349054951918" className="rounded-card bg-brand-yellow px-4 py-3 text-sm font-bold text-brand-black">Message us on WhatsApp</a>
          <Link href="/services/affidavits" className="rounded-card border-4 border-brand-black px-4 py-3 text-sm font-bold">See other affidavits</Link>
        </div>
      </main>
    );
  }

  const extraFields = CATEGORY_FIELDS[affidavitType.category];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!deponentName.trim()) return setSubmitError("Please enter the full name of the person swearing the affidavit.");
    if (!jurisdiction) return setSubmitError("Please choose the court.");
    if (!purpose.trim()) return setSubmitError("Please say what the affidavit is for.");
    if (!page.ok) return setSubmitError(page.message);
    if (/\[[^\]]+\]/.test(purpose)) return setSubmitError("Please replace the words in [brackets] in the affidavit statements.");
    if (reason && !reasonValue) return setSubmitError(`Please choose: ${reason.label.toLowerCase()}.`);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Orders require an account — send them to sign in, then back here.
      saveDraft(`affidavit:${slug}`, {
        deponentName, court, division, reasonChoice, reasonOther, uses, purposeEdited, authenticatedBy, speed, extraValues,
      });
      window.location.href = `/sign-in?redirect=/services/affidavits/${slug}`;
      return;
    }

    setSubmitting(true);

    const { data: inserted, error } = await supabase.from("orders").insert({
      user_id: user.id,
      entity_id: activeOrgId === "personal" ? null : activeOrgId,
      service_category: "affidavit",
      order_type: slug,
      status: "quote_pending",
      speed,
      form_data: {
        deponent_name: deponentName,
        jurisdiction,
        court,
        division,
        purpose,
        purpose_suggested: purposeEdited === null,
        uses,
        authenticated_by: authenticatedBy,
        copies,
        ...fieldValues,
      },
    }).select("id").single();

    if (error || !inserted) {
      setSubmitting(false);
      const pausedMsg = await ordersPausedMessage();
      setSubmitError(pausedMsg ?? "We could not save your order. Please try again, or message us on WhatsApp.");
      return;
    }

    // Price it at once on the server and email the quote (JSB, 1 Nov 2026). If this step fails,
    // the order is still saved and a person sends the quote.
    let auto = false;
    let ref = `DF-${inserted.id.slice(0, 8).toUpperCase()}`;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/orders/${inserted.id}/auto-quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) { auto = !!body.auto; ref = body.ref || ref; }
    } catch { /* a person sends the quote */ }

    setSubmitting(false);
    clearDraft(`affidavit:${slug}`);
    setPlaced({ id: inserted.id, ref, quote, auto });
    setSubmitted(true);
  }

  if (submitted && placed) {
    return (
      <main className="mx-auto max-w-xl px-6 py-12 pb-40 sm:pb-12">
        <div className="rounded-card border-4 border-brand-black p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-gray">Order {placed.ref}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-brand-black">
            {placed.auto ? "Your quote is ready" : "Order received"}
          </h1>
          <p className="mt-1 text-sm text-brand-black">{affidavitType.label}</p>
          <table className="mt-4 w-full text-sm">
            <tbody>
              {placed.quote.lines.map((l) => (
                <tr key={l.label}><td className="py-1.5 pr-3">{l.label}</td><td className="py-1.5 text-right">{amountText(l.amount)}</td></tr>
              ))}
              <tr className="border-t-2 border-brand-black font-bold">
                <td className="py-2">{placed.quote.complete ? "Total" : "Total so far"}</td>
                <td className="py-2 text-right">{naira(placed.quote.total)}</td>
              </tr>
              <PaymentFeeRows total={placed.quote.total} estimate={!placed.quote.complete} cellClass="py-2" />
            </tbody>
          </table>
          <p className="mt-3 text-xs text-brand-gray">Prices include VAT and the court fee. Valid for {FACTS.pricing.quoteValidHours} hours. {PAYMENT_FEE_NOTE}</p>
          {placed.auto ? (
            <>
              <p className="mt-3 text-sm text-brand-black">We have emailed this quote to you. Work starts once payment is confirmed.</p>
              <Link href={`/orders/${placed.id}/pay`} className="mt-4 block rounded-card bg-brand-yellow px-5 py-3 text-center text-base font-bold text-brand-black">
                Pay securely now →
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm text-brand-black">
              {FACTS.quotePromise}. We will email your full quote and you can pay from your orders page.
            </p>
          )}
          <Link href="/orders" className="mt-3 block text-center text-sm font-semibold underline">View your orders</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-6 pb-40 sm:pb-6 lg:px-16 lg:py-10">
      <nav className="flex items-center gap-6 border-b-4 border-brand-black pb-4">
        <HomeLink />
        <Link href="/services/affidavits" className="text-sm font-semibold uppercase tracking-wide">
          ← Affidavits
        </Link>
      </nav>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <div>
          <h1 className="break-words text-3xl font-extrabold text-brand-black">{affidavitType.label}</h1>
          <p className="mt-1 text-sm text-brand-gray">
            The fields adapt to the type of affidavit you choose.
          </p>
        </div>

        <div className="rounded-card border-2 border-brand-black">
          <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
            Deponent
          </div>
          <div className="flex flex-col gap-4 p-4">
            <div>
              <label htmlFor="deponent-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                Full name
              </label>
              <input
                id="deponent-name"
                autoComplete="name"
                value={deponentName}
                onChange={(e) => setDeponentName(e.target.value)}
                className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
              />
            </div>
            <div>
              <label htmlFor="court" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">Court</label>
              <select id="court" value={court} onChange={(e) => setCourt(e.target.value)}
                className="w-full rounded-input border-4 border-brand-black bg-brand-white px-3 py-2.5 outline-none">
                {COURTS.map((c) => <option key={c.value} value={c.value}>{c.value}</option>)}
              </select>
              <p className="mt-1 text-xs text-brand-gray">{COURTS.find((c) => c.value === court)?.hint}</p>
            </div>
            <div>
              <label htmlFor="division" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">Division (area)</label>
              <select id="division" value={division} onChange={(e) => setDivision(e.target.value)}
                className="w-full rounded-input border-4 border-brand-black bg-brand-white px-3 py-2.5 outline-none">
                {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <p className="mt-1 text-xs text-brand-gray">{COURT_HELP}</p>
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
                <label htmlFor={`extra-${field.key}`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                  {field.label}
                </label>
                <input
                  id={`extra-${field.key}`}
                  placeholder={field.placeholder}
                  value={extraValues[field.key] || ""}
                  onChange={(e) => setExtraValues({ ...extraValues, [field.key]: e.target.value })}
                  className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
                />
              </div>
            ))}
            {reason && (
              <div>
                <label htmlFor="reason" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">{reason.label}</label>
                <select id="reason" value={reasonChoice} onChange={(e) => setReasonChoice(e.target.value)}
                  className="w-full rounded-input border-4 border-brand-black bg-brand-white px-3 py-2.5 outline-none">
                  <option value="">Choose one</option>
                  {reason.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {reasonChoice === OTHER && (
                  <input value={reasonOther} onChange={(e) => setReasonOther(e.target.value)} placeholder="Write the reason in a few words" aria-label="Other reason"
                    className="mt-2 w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none" />
                )}
              </div>
            )}
            <div>
              <p className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">Where will you use it? (choose any)</p>
              <div className="flex flex-wrap gap-2">
                {USES.map((u) => {
                  const on = uses.includes(u);
                  return (
                    <button key={u} type="button" aria-pressed={on}
                      onClick={() => setUses(toggleUse(uses, u))}
                      className={`rounded-card border-2 border-brand-black px-3 py-2 text-xs font-semibold ${on ? "bg-brand-black text-brand-white" : ""}`}>
                      {u}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-brand-gray">
                Not sure, or need it for more than one office? Choose &ldquo;{ALL_PURPOSES}&rdquo;.
              </p>
            </div>
            <div>
              <label htmlFor="purpose" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                Purpose of affidavit
              </label>
              <p className="mb-1.5 text-xs text-brand-gray">
                We have written the statements of your affidavit from your answers, one numbered point per line.
                Check every name, date and number, replace anything in [brackets], and change any words so it fits your
                situation. It must fit on one page.
              </p>
              <textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurposeEdited(e.target.value)}
                rows={10}
                aria-describedby="purpose-count"
                className={`w-full rounded-input border-4 px-3 py-2.5 outline-none ${page.ok ? "border-brand-black" : "border-brand-error"}`}
              />
              <p id="purpose-count" className={`mt-1 text-xs ${page.ok ? "text-brand-gray" : "font-semibold text-brand-error"}`} aria-live="polite">
                {page.message ?? `${page.chars.toLocaleString("en-US")} of ${PURPOSE_MAX_CHARS.toLocaleString("en-US")} characters. Fits on one page.`}
              </p>
              {/\[[^\]]+\]/.test(purpose) && (
                <p className="mt-1 text-xs font-semibold text-brand-black">Replace the words in [brackets] before you place your order.</p>
              )}
              {purposeEdited !== null && (
                <button type="button" onClick={() => setPurposeEdited(null)} className="mt-1 text-xs font-semibold underline">
                  Use the suggested wording again
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-card border-2 border-brand-black">
          <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
            Attestation and copy
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
                  disabled
                  aria-disabled="true"
                  className="flex-1 cursor-not-allowed rounded-card border-4 border-brand-gray-light px-3 py-2 text-sm font-bold text-brand-gray"
                >
                  Notary Public ({FACTS.notarization.toLowerCase()})
                </button>
              </div>
              <p className="mt-1 text-xs text-brand-gray">
                A Commissioner for Oaths at the court swears your affidavit. This is what offices in Nigeria
                accept. Notary Public, for documents going abroad, is coming soon.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                Certified copy
              </label>
              <p className="text-sm text-brand-black">1 certified copy, included in the price.</p>
              <p className="mt-1 text-xs text-brand-gray">{COPIES_HELP}</p>
            </div>
          </div>
        </div>

        <div className="rounded-card border-2 border-brand-black">
          <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
            Delivery speed
          </div>
          <div className="flex flex-col gap-2 p-4 sm:flex-row">
            {(
              [
                ["standard", "Standard", naira(affidavitQuote(slug, "standard", 1).total), "Within 2 to 3 working days"],
                [
                  "express",
                  "Express",
                  naira(affidavitQuote(slug, "express", 1).total),
                  "Same day when confirmed before 2 PM on a working day",
                ],
              ] as const
            ).map(([value, label, price, note]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSpeed(value)}
                aria-pressed={speed === value}
                className={`flex-1 rounded-card border-4 border-brand-black px-3 py-2 text-left ${
                  speed === value ? "bg-brand-black text-brand-white" : ""
                }`}
              >
                <span className="block text-sm font-bold">
                  {label} · {price}
                </span>
                <span className="block text-xs opacity-80">{note}</span>
              </button>
            ))}
          </div>
          {speed === "express" && (
            <p className="px-4 pb-4 text-xs text-brand-gray">
              If we miss the Express time for a reason on our side, we refund the Express fee automatically.
            </p>
          )}
        </div>

        <div className="rounded-card border-2 border-brand-black p-4" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-wide">Your price</p>
          <table className="mt-2 w-full text-sm">
            <tbody>
              {quote.lines.map((l) => (
                <tr key={l.label}><td className="py-1 pr-3">{l.label}</td><td className="py-1 text-right">{amountText(l.amount)}</td></tr>
              ))}
              <tr className="border-t-2 border-brand-black font-bold">
                <td className="py-1.5">Total</td><td className="py-1.5 text-right">{naira(quote.total)}</td>
              </tr>
              <PaymentFeeRows total={quote.total} cellClass="py-1" />
            </tbody>
          </table>
          <p className="mt-1 text-xs text-brand-gray">Includes VAT and the court fee. Nothing to pay at this step. {PAYMENT_FEE_NOTE}</p>
        </div>

        {submitError && <p className="text-sm text-brand-error">{submitError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-card bg-brand-black px-4 py-4 text-base font-bold text-brand-white disabled:opacity-50"
        >
          {submitting ? "Placing your order…" : "Place order and get my quote →"}
        </button>
        <p className="text-center text-xs text-brand-gray">
          We email your quote (pro-forma invoice) at once. You pay only when you are ready.
        </p>
      </form>
    </main>
  );
}
