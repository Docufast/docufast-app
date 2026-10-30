"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import { FACTS } from "@/lib/seo/facts";
import { supabase } from "@/lib/supabase";
import { unwrapPrivateKey } from "@/lib/vaultCrypto";
import { storeUnlockedPrivateKey } from "@/lib/vaultSession";

// Only same-site paths are allowed. Blocks https://other.site, //other.site and javascript: values.
function safeRedirect(value?: string): string {
  if (value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) {
    return value;
  }
  return "/home";
}

// Blueprint U1 (#119): sign-in styling only. The sign-in and two-factor logic is unchanged.
const labelCls = "mb-1.5 block text-sm font-semibold text-brand-black";
const inputCls =
  "h-12 w-full rounded-[10px] border border-[#BFBFBF] bg-brand-white px-3.5 text-base text-brand-black outline-none focus:border-brand-black";
const goldBtn =
  "inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-brand-yellow px-5 text-base font-semibold text-brand-black hover:bg-brand-yellow-hover disabled:opacity-50";

export default function SignInForm({ redirect }: { redirect?: string }) {
  const redirectTo = safeRedirect(redirect);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsMfa, setNeedsMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);

  async function unlockVaultKey(userId: string, plainPassword: string) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("vault_encrypted_private_key_pw, vault_pw_salt, vault_pw_iv")
        .eq("id", userId)
        .single();

      if (
        profile?.vault_encrypted_private_key_pw &&
        profile.vault_pw_salt &&
        profile.vault_pw_iv
      ) {
        const unwrapped = await unwrapPrivateKey(
          {
            ciphertext: profile.vault_encrypted_private_key_pw,
            salt: profile.vault_pw_salt,
            iv: profile.vault_pw_iv,
          },
          plainPassword
        );
        await storeUnlockedPrivateKey(userId, unwrapped);
      }
    } catch (err) {
      // Vault unlock is best-effort at sign-in — if it fails, the customer
      // can still use the rest of the app; only Vault decryption would be
      // affected, and that's handled gracefully on that page separately.
      console.error("Vault key unlock failed:", err);
    }
  }

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

      if (data.user) {
        await unlockVaultKey(data.user.id, password);
      }

      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal && aal.nextLevel === "aal2" && aal.nextLevel !== aal.currentLevel) {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors?.totp?.[0];
        if (totpFactor) {
          setFactorId(totpFactor.id);
          setNeedsMfa(true);
          return;
        }
      }

      window.location.href = redirectTo;
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMfaVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || mfaCode.length !== 6) return;

    setSubmitting(true);
    setError(null);

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });
    if (challengeError) {
      setError(challengeError.message);
      setSubmitting(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: mfaCode,
    });
    setSubmitting(false);

    if (verifyError) {
      setError("Incorrect code.");
      return;
    }
    window.location.href = redirectTo;
  }

  if (needsMfa) {
    return (
      <>
        <SiteHeader />
        <main className="bg-brand-offwhite px-4 py-12 md:px-12 md:py-16">
          <div className="mx-auto max-w-md rounded-[14px] border border-brand-gray-light bg-brand-white p-6 md:p-8">
            <h1 className="text-3xl font-semibold text-brand-black">Enter your 6-digit code</h1>
            <p className="mt-2 text-sm text-brand-gray">From your authenticator app.</p>
            <form onSubmit={handleMfaVerify} className="mt-6 flex flex-col gap-4">
              <label htmlFor="mfa-code" className="sr-only">6-digit code</label>
              <input
                id="mfa-code"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={`${inputCls} text-center font-mono text-lg tracking-[0.4em]`}
                placeholder="000000"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              {error && <p role="alert" className="text-sm text-brand-error">{error}</p>}
              <button type="submit" disabled={submitting || mfaCode.length !== 6} className={goldBtn}>
                {submitting ? "Verifying…" : "Verify and continue"}
              </button>
            </form>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="bg-brand-offwhite px-4 py-12 md:px-12 md:py-16">
        <div className="mx-auto max-w-md rounded-[14px] border border-brand-gray-light bg-brand-white p-6 md:p-8">
          <h1 className="text-3xl font-semibold text-brand-black md:text-4xl">Welcome back</h1>
          <p className="mt-2 text-sm leading-relaxed text-brand-gray">
            Sign in to track orders, open your vault and check upcoming deadlines.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="identifier" className={labelCls}>Email or phone</label>
              <input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={inputCls}
                placeholder="you@example.ng"
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="password" className={labelCls}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                autoComplete="current-password"
              />
            </div>

            <div className="text-right text-sm">
              <Link href="/forgot-password" className="font-semibold text-brand-black underline">
                Forgot password?
              </Link>
            </div>

            {error && <p role="alert" className="text-sm text-brand-error">{error}</p>}

            <div className="rounded-[14px] border border-brand-yellow bg-[#FFF6D6] px-4 py-3 text-sm text-brand-black">
              A 6-digit code follows if two-factor is switched on.
            </div>

            <button type="submit" disabled={submitting} className={goldBtn}>
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-sm text-brand-gray">
            New here?{" "}
            <Link href="/sign-up" className="font-semibold text-brand-black underline">
              Create an account
            </Link>
          </p>
          <p className="mt-6 text-xs text-brand-gray">
            Having trouble? Support on WhatsApp {FACTS.support.whatsappDisplay}, {FACTS.support.hours}.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
