"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getPasswordStrength, strengthLabel } from "@/lib/passwordStrength";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const strength = password ? getPasswordStrength(password) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
      <div className="flex items-center gap-2">
        <Image src="/images/logo-black.png" alt="Docufast" width={24} height={24} />
        <span className="text-xl font-extrabold tracking-wide text-brand-black">DOCUFAST</span>
      </div>

      {done ? (
        <div className="mt-8 rounded-card border-4 border-brand-black bg-brand-yellow/10 p-5">
          <h1 className="text-xl font-extrabold text-brand-black">Password updated</h1>
          <p className="mt-2 text-sm text-brand-gray">
            Your password has been changed. You can now sign in with your new password.
          </p>
          <a href="/sign-in" className="mt-4 inline-block text-sm font-bold underline">
            Go to sign in
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-black">Set a new password</h1>
            <p className="mt-1 text-sm text-brand-gray">
              This link is only valid for a short time.
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-input border-4 border-brand-black px-3 py-3 outline-none"
            />
            {strength && (
              <p className="mt-1.5 text-xs font-semibold text-brand-black">
                {strengthLabel[strength]}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-input border-4 border-brand-black px-3 py-3 outline-none"
            />
          </div>
          {error && <p className="text-sm text-brand-error">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-card bg-brand-black px-4 py-3.5 text-base font-bold text-brand-white disabled:opacity-50"
          >
            {submitting ? "Updating…" : "Set new password"}
          </button>
        </form>
      )}
    </main>
  );
}
