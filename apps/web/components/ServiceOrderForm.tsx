"use client";

// One order form for CAC, newspaper notices and virtual office work (JSB, 1 Nov 2026), driven by
// lib/serviceForms.ts. Shows the price as the customer fills it in; on submit it saves the order,
// asks the API to price it (quote or estimate, emailed at once) and shows the result.

import { useMemo, useState } from "react";
import Link from "next/link";
import HomeLink from "@/components/ui/HomeLink";
import FileUpload from "@/components/ui/FileUpload";
import { supabase } from "@/lib/supabase";
import { useOrg } from "@/contexts/OrgContext";
import { FACTS } from "@/lib/seo/facts";
import { quoteFor, naira, amountText, type Quote } from "@/lib/pricing";
import { initialValues, isVisible, type FormField, type ServiceForm } from "@/lib/serviceForms";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const input = "w-full rounded-input border-4 border-brand-black bg-brand-white px-3 py-2.5 outline-none";

export default function ServiceOrderForm({ form, backHref, backLabel }: { form: ServiceForm; backHref: string; backLabel: string }) {
  const { activeOrgId } = useOrg();
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(form));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{ id: string; ref: string; quote: Quote | null; final: boolean } | null>(null);

  const set = (k: string, v: string) => setValues((prev) => ({ ...prev, [k]: v }));
  const quote = useMemo(() => quoteFor(form.category, form.slug, undefined, values), [form, values]);
  const visibleFields = form.sections.flatMap((s) => s.fields.filter((f) => isVisible(f, values)));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const missing = visibleFields.find((f) => f.required && !(values[f.key] ?? "").trim());
    if (missing) return setError(`Please fill in: ${missing.label}.`);
    const stopped = visibleFields.find((f) => f.stop && f.stop.in.includes(values[f.key] ?? ""));
    if (stopped?.stop) return setError(stopped.stop.message);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = `/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    setSubmitting(true);
    const formData: Record<string, string> = {};
    for (const f of visibleFields) if (values[f.key] !== undefined && values[f.key] !== "") formData[f.key] = values[f.key];
    for (const k of Object.keys(values)) if (k.endsWith("_r2_key")) formData[k] = values[k];

    const { data: inserted, error: insertError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        entity_id: activeOrgId === "personal" ? null : activeOrgId,
        service_category: form.category,
        order_type: form.slug,
        status: "quote_pending",
        form_data: formData,
      })
      .select("id")
      .single();
    if (insertError || !inserted) {
      setSubmitting(false);
      return setError("We could not save your order. Please try again, or message us on WhatsApp.");
    }

    let final = false;
    let ref = `DF-${inserted.id.slice(0, 8).toUpperCase()}`;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/orders/${inserted.id}/auto-quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) { final = !!body.auto; ref = body.ref || ref; }
    } catch { /* a person sends the quote */ }
    setSubmitting(false);
    setPlaced({ id: inserted.id, ref, quote, final });
  }

  if (placed) {
    return (
      <main className="mx-auto max-w-xl px-6 py-12 pb-40 sm:pb-12">
        <QuoteResult title={form.title} placed={placed} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-6 pb-40 sm:pb-6 lg:px-16 lg:py-10">
      <nav className="flex items-center gap-6 border-b-4 border-brand-black pb-4">
        <HomeLink />
        <Link href={backHref} className="text-sm font-semibold uppercase tracking-wide">← {backLabel}</Link>
      </nav>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-6" noValidate>
        <div>
          <h1 className="break-words text-3xl font-extrabold text-brand-black">{form.title}</h1>
          <p className="mt-1 text-sm text-brand-gray">{form.intro}</p>
        </div>

        {form.notOrderable ? (
          <div className="rounded-card border-2 border-brand-black p-4 text-sm">
            <p>{form.notOrderable.message}</p>
            <Link href={form.notOrderable.href} className="mt-3 inline-block rounded-card bg-brand-yellow px-4 py-2 font-bold text-brand-black">
              {form.notOrderable.linkText} →
            </Link>
          </div>
        ) : (
          <>
            {form.sections.map((section) => (
              <div key={section.title} className="rounded-card border-2 border-brand-black">
                <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">{section.title}</div>
                <div className="flex flex-col gap-4 p-4">
                  {section.fields.filter((f) => isVisible(f, values)).map((f) => (
                    <Field key={f.key} field={f} value={values[f.key] ?? ""} onChange={(v) => set(f.key, v)} onUploaded={(key) => set(`${f.key}_r2_key`, key)} />
                  ))}
                  {form.slug.endsWith("_publication") && values.has_affidavit === "no" && (
                    <p className="rounded-card bg-brand-yellow/10 p-3 text-sm">
                      You need the affidavit first. <Link className="font-bold underline" href="/services/affidavits">Order your affidavit</Link>, then come back for the notice. We can do both together.
                    </p>
                  )}
                </div>
              </div>
            ))}

            {form.note && (
              <div className="rounded-card border-l-4 border-brand-yellow bg-brand-yellow/10 px-4 py-3 text-sm text-brand-black">{form.note}</div>
            )}

            {visibleFields.filter((f) => f.stop && f.stop.in.includes(values[f.key] ?? "")).map((f) => (
              <div key={`stop-${f.key}`} role="alert" className="rounded-card border-2 border-brand-error p-3 text-sm text-brand-black">{f.stop!.message}</div>
            ))}

            {quote && <PriceBox quote={quote} />}

            {error && <p className="text-sm text-brand-error">{error}</p>}
            <button type="submit" disabled={submitting} className="rounded-card bg-brand-black px-4 py-4 text-base font-bold text-brand-white disabled:opacity-50">
              {submitting ? "Placing your order…" : "Place order and get my quote →"}
            </button>
            <p className="text-center text-xs text-brand-gray">We email your quote at once. You pay only when you are ready.</p>
          </>
        )}
      </form>
    </main>
  );
}

function Field({ field, value, onChange, onUploaded }: { field: FormField; value: string; onChange: (v: string) => void; onUploaded: (key: string) => void }) {
  const id = `f-${field.key}`;
  const label = (
    <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
      {field.label}{field.required ? "" : " (optional)"}
    </label>
  );
  const help = field.help ? <p className="mt-1 text-xs text-brand-gray">{field.help}</p> : null;

  if (field.type === "choice") {
    return (
      <div role="group" aria-labelledby={`${id}-l`}>
        <p id={`${id}-l`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">{field.label}</p>
        <div className="flex flex-wrap gap-2">
          {field.options?.map((opt) => (
            <button key={opt.value} type="button" aria-pressed={value === opt.value} onClick={() => onChange(opt.value)}
              className={`rounded-card border-4 border-brand-black px-3 py-2 text-sm font-bold ${value === opt.value ? "bg-brand-black text-brand-white" : ""}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {help}
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div>
        {label}
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={input}>
          <option value="">Choose one</option>
          {field.options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {help}
      </div>
    );
  }
  if (field.type === "file") {
    return (
      <div>
        <p className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">{field.label}{field.required ? "" : " (optional)"}</p>
        <FileUpload onFileSelect={(file) => onChange(file?.name || "")} onUploadComplete={onUploaded} />
        {help}
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div>
        {label}
        <textarea id={id} rows={3} placeholder={field.placeholder} value={value} onChange={(e) => onChange(e.target.value)} className={input} />
        {help}
      </div>
    );
  }
  return (
    <div>
      {label}
      <input id={id} type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
        inputMode={field.type === "number" ? "numeric" : undefined} min={field.type === "number" ? 1 : undefined}
        placeholder={field.placeholder} value={value} onChange={(e) => onChange(e.target.value)} className={input} />
      {help}
    </div>
  );
}

export function PriceBox({ quote }: { quote: Quote }) {
  return (
    <div className="rounded-card border-2 border-brand-black p-4" aria-live="polite">
      <p className="text-xs font-bold uppercase tracking-wide">{quote.complete ? "Your price" : "Estimated price"}</p>
      <table className="mt-2 w-full text-sm">
        <tbody>
          {quote.lines.map((l) => (
            <tr key={l.label}><td className="py-1 pr-3">{l.label}</td><td className="py-1 text-right">{amountText(l.amount)}</td></tr>
          ))}
          <tr className="border-t-2 border-brand-black font-bold">
            <td className="py-1.5">{quote.complete ? "Total" : "Estimated total"}</td><td className="py-1.5 text-right">{naira(quote.total)}</td>
          </tr>
        </tbody>
      </table>
      {quote.note && <p className="mt-1 text-xs text-brand-black">{quote.note}</p>}
      <p className="mt-1 text-xs text-brand-gray">Prices include VAT. Nothing to pay at this step.</p>
    </div>
  );
}

export function QuoteResult({ title, placed }: { title: string; placed: { id: string; ref: string; quote: Quote | null; final: boolean } }) {
  const q = placed.quote;
  return (
    <div className="rounded-card border-4 border-brand-black p-6">
      <p className="text-xs font-bold uppercase tracking-wide text-brand-gray">Order {placed.ref}</p>
      <h1 className="mt-1 text-2xl font-extrabold text-brand-black">{placed.final ? "Your quote is ready" : "Order received"}</h1>
      <p className="mt-1 text-sm text-brand-black">{title}</p>
      {q && (
        <table className="mt-4 w-full text-sm">
          <tbody>
            {q.lines.map((l) => (
              <tr key={l.label}><td className="py-1.5 pr-3">{l.label}</td><td className="py-1.5 text-right">{amountText(l.amount)}</td></tr>
            ))}
            <tr className="border-t-2 border-brand-black font-bold">
              <td className="py-2">{placed.final ? "Total" : "Estimated total"}</td><td className="py-2 text-right">{naira(q.total)}</td>
            </tr>
          </tbody>
        </table>
      )}
      {q?.note && <p className="mt-2 text-xs text-brand-black">{q.note}</p>}
      {placed.final ? (
        <>
          <p className="mt-3 text-sm text-brand-black">
            We have emailed this quote to you. It is valid for {FACTS.pricing.quoteValidHours} hours, and work starts once payment is confirmed.
          </p>
          <Link href={`/orders/${placed.id}/pay`} className="mt-4 block rounded-card bg-brand-yellow px-5 py-3 text-center text-base font-bold text-brand-black">
            Pay securely now →
          </Link>
        </>
      ) : (
        <p className="mt-3 text-sm text-brand-black">
          {q ? "We have emailed this estimate to you. " : ""}We check the details and email your {q ? "final " : ""}quote; you can then pay from your orders page.
        </p>
      )}
      <Link href="/orders" className="mt-3 block text-center text-sm font-semibold underline">View your orders</Link>
    </div>
  );
}
