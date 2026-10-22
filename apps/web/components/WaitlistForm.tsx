"use client";

import { useState } from "react";
import Link from "next/link";

// Waitlist form (#38). During the paid beta only invited friends and family sign up, so the
// public site collects interest here instead of sending people to sign-up (JSB, 21 Oct 2026).
// Wording approved by Sheriff, 21 Oct 2026. If you change it, bump CONSENT_WORDING_VERSION
// in app/api/waitlist/route.ts.

type Status = "idle" | "sending" | "done" | "error";

export default function WaitlistForm({ source = "home" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState(""); // honeypot, hidden from people
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, source, marketingConsent, company }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("We could not reach Docufast. Check your connection and try again.");
    }
  }

  if (status === "done") {
    return (
      <p role="status" className="rounded-[14px] bg-brand-white p-5 text-base text-brand-black">
        Thank you. You are on the list, and we will email you when Docufast opens to you.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-semibold text-brand-black">
          Email address
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-[10px] border border-brand-gray-light bg-brand-white px-3 font-normal text-brand-black outline-none focus:border-brand-black"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold text-brand-black">
          First name (optional)
          <input
            type="text"
            autoComplete="given-name"
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-[10px] border border-brand-gray-light bg-brand-white px-3 font-normal text-brand-black outline-none focus:border-brand-black"
          />
        </label>
      </div>

      {/* Honeypot for bots. Hidden from people and from screen readers. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label>
          Company
          <input tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
      </div>

      <label className="flex items-start gap-2 text-sm text-brand-black">
        <input
          type="checkbox"
          checked={marketingConsent}
          onChange={(e) => setMarketingConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-brand-black"
        />
        <span>
          Send me tips, deadline news and offers from Docufast by email, SMS or WhatsApp. I can
          stop at any time.
        </span>
      </label>

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-brand-yellow px-5 text-base font-semibold text-brand-black hover:bg-brand-yellow-hover disabled:opacity-50 sm:w-auto"
      >
        {status === "sending" ? "Adding you…" : "Join the waitlist"}
      </button>

      <p className="text-xs leading-relaxed text-brand-gray">
        We&apos;ll only use your details to tell you when Docufast opens to you.{" "}
        <Link href="/privacy" className="font-semibold text-brand-black underline">
          Privacy notice
        </Link>
        .
      </p>

      {status === "error" && (
        <p role="alert" className="text-sm text-brand-error">
          {message}
        </p>
      )}
    </form>
  );
}
