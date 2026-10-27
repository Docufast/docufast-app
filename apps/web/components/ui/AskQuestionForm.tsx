"use client";

import { useState } from "react";
import Link from "next/link";

// Help chat question form (JSB, 27 Oct 2026). Questions are saved to public.enquiries through
// /api/enquiries and appear on the admin dashboard for the team to answer.

type Status = "idle" | "sending" | "done" | "error";

const inputClass =
  "h-10 rounded-input border-2 border-brand-black bg-brand-white px-2 text-sm font-normal text-brand-black outline-none focus:border-brand-yellow";

export default function AskQuestionForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [question, setQuestion] = useState("");
  const [company, setCompany] = useState(""); // honeypot, hidden from people
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) {
      setStatus("error");
      setMessage("Please type your question.");
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setStatus("error");
      setMessage("Please give an email address or WhatsApp number so we can reply.");
      return;
    }
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, question, company, page: window.location.pathname }),
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
      <p role="status" className="mt-3 rounded-card border-2 border-brand-black bg-brand-yellow/10 p-3 text-sm text-brand-black">
        Thank you. Your question has reached our team, and we will reply by email or WhatsApp,
        Monday to Saturday, 8am to 6pm WAT.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2" noValidate>
      <label className="flex flex-col gap-1 text-xs font-semibold text-brand-black">
        Your question
        <textarea
          required
          rows={3}
          maxLength={2000}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="rounded-input border-2 border-brand-black bg-brand-white p-2 text-sm font-normal text-brand-black outline-none focus:border-brand-yellow"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-brand-black">
        Name (optional)
        <input type="text" autoComplete="name" maxLength={120} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-brand-black">
        Email address
        <input type="email" autoComplete="email" inputMode="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-brand-black">
        or WhatsApp number
        <input type="tel" autoComplete="tel" inputMode="tel" maxLength={32} value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
      </label>

      {/* Honeypot for bots. Hidden from people and from screen readers. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label>
          Company
          <input tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 rounded-card bg-brand-yellow px-4 py-2 text-sm font-bold text-brand-black hover:bg-brand-yellow-hover disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send question"}
      </button>

      <p className="text-xs leading-relaxed text-brand-gray">
        We only use your details to answer this question.{" "}
        <Link href="/privacy" className="font-semibold text-brand-black underline">
          Privacy notice
        </Link>
        .
      </p>

      {status === "error" && (
        <p role="alert" className="text-xs text-brand-error">
          {message}
        </p>
      )}
    </form>
  );
}
