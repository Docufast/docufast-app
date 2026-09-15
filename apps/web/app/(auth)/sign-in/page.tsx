"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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
      // TODO: wire up to Supabase Auth once the project is connected.
      // const { error } = await supabase.auth.signInWithPassword({ email: identifier, password });
      // If the account has 2FA enabled, redirect to /sign-in/verify next.
      console.log("Sign in submitted", { identifier, keepSignedIn });
    } catch (err) {
      setError("Incorrect email/phone or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-black">
        Docu<span className="text-brand-yellow">fast</span>
      </h1>
      <p className="mt-1 text-sm text-brand-gray">Welcome back</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          id="identifier"
          label="Email or phone"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="you@example.ng"
        />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-brand-gray">
            <input
              type="checkbox"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
            />
            Keep me signed in
          </label>
          <Link href="/forgot-password" className="font-semibold text-brand-black underline">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-sm text-brand-error">{error}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-center text-sm text-brand-gray">
          New to Docufast?{" "}
          <Link href="/sign-up" className="font-semibold text-brand-black underline">
            Create an account
          </Link>
        </p>
        <p className="text-center text-xs text-brand-gray">
          A 6-digit code follows if two-factor is on.
        </p>
      </form>
    </main>
  );
}
