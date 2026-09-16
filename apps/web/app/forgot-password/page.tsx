"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("Enter your email address.");
      return;
    }

    setSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
      <div className="flex items-center gap-2">
        <Image src="/images/logo-black.png" alt="Docufast" width={24} height={24} />
        <span className="text-xl font-extrabold tracking-wide text-brand-black">DOCUFAST</span>
      </div>

      {sent ? (
        <div className="mt-8 rounded-card border-4 border-brand-black bg-brand-yellow/10 p-5">
          <h1 className="text-xl font-extrabold text-brand-black">Check your email</h1>
          <p className="mt-2 text-sm text-brand-gray">
            We've sent a password reset link to {email}. Click it to set a new password.
          </p>
          <Link href="/sign-in" className="mt-4 inline-block text-sm font-bold underline">
            ← Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-black">Reset password</h1>
            <p className="mt-1 text-sm text-brand-gray">
              Enter your email and we'll send you a reset link.
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-input border-4 border-brand-black px-3 py-3 outline-none"
              placeholder="you@example.ng"
            />
          </div>
          {error && <p className="text-sm text-brand-error">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-card bg-brand-black px-4 py-3.5 text-base font-bold text-brand-white disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send reset link"}
          </button>
          <Link href="/sign-in" className="text-center text-sm font-bold underline">
            Back to sign in
          </Link>
        </form>
      )}
    </main>
  );
}
