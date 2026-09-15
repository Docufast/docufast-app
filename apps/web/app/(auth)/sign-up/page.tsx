"use client";

import { useState } from "react";
import Link from "next/link";
import HeroPanel from "@/components/ui/HeroPanel";
import { getPasswordStrength, strengthLabel } from "@/lib/passwordStrength";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = password ? getPasswordStrength(password) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName || !email || !phone || !password) {
      setError("Please fill in every field.");
      return;
    }
    if (!agreed) {
      setError("You need to agree to the Terms and Privacy Policy to continue.");
      return;
    }

    setSubmitting(true);
    try {
      // TODO: wire up to Supabase Auth once the project is connected.
      console.log("Sign up submitted", { fullName, email, phone });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 lg:px-16 lg:py-10">
        <div className="flex items-center gap-2 border-b-4 border-brand-black pb-4">
          <span className="h-5 w-5 bg-brand-yellow" />
          <span className="mr-auto text-xl font-extrabold tracking-wide text-brand-black">
            DOCUFAST
          </span>
          <span className="text-sm text-brand-gray">Already registered?</span>
          <Link href="/sign-in" className="text-sm font-bold uppercase tracking-wide">
            Sign in
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex max-w-md flex-1 flex-col gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-brand-black">Create your account</h1>
            <p className="mt-2 text-brand-gray">
              One account covers you personally and every business you manage.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                Full name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border-4 border-brand-black px-3 py-3 text-base outline-none"
                placeholder="e.g. Nkem Chidinma Eze"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-4 border-brand-black px-3 py-3 text-base outline-none"
                  placeholder="you@example.ng"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border-4 border-brand-black px-3 py-3 text-base outline-none"
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-4 border-brand-black px-3 py-3 text-base outline-none"
              />
              {strength && (
                <p className="mt-1.5 text-xs font-semibold text-brand-black">
                  {strengthLabel[strength]}
                </p>
              )}
            </div>

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 border-4 border-brand-black"
              />
              I agree to the Terms of Service and Privacy Policy, including
              NDPR data handling.
            </label>

            {error && <p className="text-sm text-brand-error">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-between bg-brand-black px-4 py-4 text-base font-bold text-brand-white disabled:opacity-50"
            >
              {submitting ? "Creating account…" : "Create account"} →
            </button>

            <p className="text-xs text-brand-gray">
              Businesses are added later, when you place an order under one.
            </p>
          </div>
        </form>
      </div>

      <HeroPanel
        variant="yellow"
        caption="Yellow panel on Home and Sign up; the darker variant marks the returning-user path."
      />
    </main>
  );
}
