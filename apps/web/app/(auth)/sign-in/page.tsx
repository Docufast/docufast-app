"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import HeroPanel from "@/components/ui/HeroPanel";
import { supabase } from "@/lib/supabase";

export default function SignInPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!identifier || !password) {
      setError("Enter your email/phone and password.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      // TODO: once 2FA is configured, check for that requirement here
      // before redirecting straight to /account.
      window.location.href = "/account";
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
          <Image src="/images/logo-black.png" alt="Docufast" width={24} height={24} />
          <span className="mr-auto text-xl font-extrabold tracking-wide text-brand-black">
            DOCUFAST
          </span>
          <span className="text-sm text-brand-gray">New here?</span>
          <Link href="/sign-up" className="text-sm font-bold uppercase tracking-wide">
            Create account
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 flex max-w-md flex-1 flex-col gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-brand-black">Welcome back</h1>
            <p className="mt-2 text-brand-gray">
              Sign in to track orders, open your vault and check upcoming deadlines.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                Email or phone
              </label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full border-4 border-brand-black px-3 py-3 text-base outline-none"
                placeholder="you@example.ng"
              />
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
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="h-4 w-4 border-4 border-brand-black"
                />
                Keep me signed in
              </label>
              <Link href="/forgot-password" className="font-bold underline">
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-sm text-brand-error">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-between bg-brand-black px-4 py-4 text-base font-bold text-brand-white disabled:opacity-50"
            >
              {submitting ? "Signing in…" : "Sign in"} →
            </button>

            <div className="border-l-4 border-brand-yellow bg-brand-yellow/10 px-3 py-2 text-xs text-brand-black">
              A 6-digit code follows if two-factor is switched on.
            </div>
          </div>
        </form>

        <p className="mt-auto pt-6 text-xs text-brand-gray">
          Having trouble? Support on WhatsApp, Mon–Sat 08:00–20:00.
        </p>
      </div>

      <HeroPanel src="/images/hero-signin.png" alt="Docufast — secure sign in" bg="dark" />
    </main>
  );
}
