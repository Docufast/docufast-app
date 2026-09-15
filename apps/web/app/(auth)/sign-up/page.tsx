"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getPasswordStrength, strengthLabel, strengthColor } from "@/lib/passwordStrength";

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
      // const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, phone } } });
      console.log("Sign up submitted", { fullName, email, phone });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-black">
        Docu<span className="text-brand-yellow">fast</span>
      </h1>
      <p className="mt-1 text-sm text-brand-gray">Create your account</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          id="fullName"
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Nkem Chidinma Eze"
        />
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.ng"
        />
        <Input
          id="phone"
          label="Phone number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+234 800 000 0000"
        />
        <div>
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {strength && (
            <p className={`mt-1 text-xs font-medium ${strengthColor[strength]}`}>
              {strengthLabel[strength]}
            </p>
          )}
        </div>

        <label className="flex items-start gap-2 text-xs text-brand-gray">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5"
          />
          I agree to the Terms of Service and Privacy Policy, including NDPR
          data handling.
        </label>

        {error && <p className="text-sm text-brand-error">{error}</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-center text-sm text-brand-gray">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-brand-black underline">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
