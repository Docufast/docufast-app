"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import { getPasswordStrength, strengthLabel } from "@/lib/passwordStrength";
import { supabase } from "@/lib/supabase";
import * as bip39 from "bip39";
import { checkAdult, AGE_MESSAGES, lagosToday } from "@/lib/consent";
import {
  generateVaultKeyPair,
  exportPublicKeyBase64,
  wrapPrivateKey,
} from "@/lib/vaultCrypto";

// Blueprint styling (#119). Sign-up logic below is unchanged.
const labelCls = "mb-1.5 block text-sm font-semibold text-brand-black";
const inputCls =
  "h-12 w-full rounded-[10px] border border-[#BFBFBF] bg-brand-white px-3.5 text-base text-brand-black outline-none focus:border-brand-black";
const goldBtn =
  "inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-brand-yellow px-5 text-base font-semibold text-brand-black hover:bg-brand-yellow-hover disabled:opacity-50";
const outlineBtn =
  "inline-flex h-11 w-full items-center justify-center rounded-[10px] border border-[#BFBFBF] bg-brand-white px-4 text-sm font-semibold text-brand-black hover:border-brand-black";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recoveryPhrase, setRecoveryPhrase] = useState<string | null>(null);
  const [savedConfirmed, setSavedConfirmed] = useState(false);

  const strength = password ? getPasswordStrength(password) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName || !email || !phone || !password || !dateOfBirth) {
      setError("Please fill in every field.");
      return;
    }
    // Accounts are for adults only (Terms s.3, #199). Checked here first so no account is
    // created for someone under 18, and again on the server.
    const age = checkAdult(dateOfBirth);
    if (!age.ok) {
      setError(AGE_MESSAGES[age.reason]);
      return;
    }
    if (!ageConfirmed) {
      setError("Please confirm that you are 18 or over.");
      return;
    }
    if (!agreed) {
      setError("You need to agree to the Terms and Privacy Notice to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const user = data.user;
      if (!user) {
        setError("Something went wrong creating your account. Please try again.");
        return;
      }

      // Record the age check and every consent on the server, with the wording version shown
      // on this page (#75, #199). Append-only: later changes are new records, never edits.
      const accessToken = data.session?.access_token;
      const consentRes = accessToken
        ? await fetch("/api/account/consents", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({
              dateOfBirth,
              ageConfirmed,
              termsAccepted: agreed,
              marketingConsent,
            }),
          })
        : null;
      if (!consentRes || !consentRes.ok) {
        const message = consentRes
          ? ((await consentRes.json().catch(() => null)) as { error?: string } | null)?.error
          : null;
        setError(message ?? "Account created, but we could not record your choices. Please try again.");
        return;
      }

      const keyPair = await generateVaultKeyPair();
      const publicKeyBase64 = await exportPublicKeyBase64(keyPair.publicKey);
      const phrase = bip39.generateMnemonic();

      const wrappedWithPassword = await wrapPrivateKey(keyPair.privateKey, password);
      const wrappedWithRecovery = await wrapPrivateKey(keyPair.privateKey, phrase);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          vault_public_key: publicKeyBase64,
          vault_encrypted_private_key_pw: wrappedWithPassword.ciphertext,
          vault_pw_salt: wrappedWithPassword.salt,
          vault_pw_iv: wrappedWithPassword.iv,
          vault_encrypted_private_key_recovery: wrappedWithRecovery.ciphertext,
          vault_recovery_salt: wrappedWithRecovery.salt,
          vault_recovery_iv: wrappedWithRecovery.iv,
        })
        .eq("id", user.id);

      if (profileError) {
        setError("Account created, but vault setup failed: " + profileError.message);
        return;
      }

      setRecoveryPhrase(phrase);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDownloadPhrase() {
    if (!recoveryPhrase) return;

    const contents = [
      "DOCUFAST VAULT RECOVERY PHRASE",
      "",
      "Keep this safe and private. Anyone with these words can unlock your",
      "vault documents. Docufast cannot recover this phrase for you if lost.",
      "",
      recoveryPhrase,
      "",
      `Generated: ${new Date().toLocaleString("en-GB")}`,
    ].join("\n");

    const blob = new Blob([contents], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "docufast-recovery-phrase.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleContinue() {
    window.location.href = "/account/security/2fa";
  }

  if (recoveryPhrase) {
    const words = recoveryPhrase.split(" ");
    return (
      <>
        <SiteHeader />
        <main className="bg-brand-offwhite px-4 py-12 md:px-12 md:py-16">
          <div className="mx-auto max-w-lg rounded-[14px] border border-brand-yellow bg-[#FFF6D6] p-6 md:p-8">
            <h1 className="text-3xl font-semibold text-brand-black">Save your recovery phrase</h1>
            <p className="mt-2 text-sm leading-relaxed text-brand-black">
              This 12-word phrase is the only way to recover your vault documents if you ever
              forget your password. It will only be shown once. Write it down, or download it,
              and keep it somewhere safe.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {words.map((word, i) => (
                <div
                  key={i}
                  className="rounded-[10px] border border-[#BFBFBF] bg-brand-white px-3 py-2 text-sm"
                >
                  <span className="mr-1.5 font-mono text-xs text-brand-gray">{i + 1}.</span>
                  <span className="font-semibold text-brand-black">{word}</span>
                </div>
              ))}
            </div>

            <button onClick={handleDownloadPhrase} className={`${outlineBtn} mt-4`}>
              Download as file
            </button>

            <label className="mt-5 flex items-start gap-2 text-sm text-brand-black">
              <input
                type="checkbox"
                checked={savedConfirmed}
                onChange={(e) => setSavedConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-black"
              />
              I've saved my recovery phrase somewhere safe. I understand Docufast cannot
              recover it for me if I lose it.
            </label>

            <button onClick={handleContinue} disabled={!savedConfirmed} className={`${goldBtn} mt-5`}>
              Continue
            </button>
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
        <div className="mx-auto max-w-xl rounded-[14px] border border-brand-gray-light bg-brand-white p-6 md:p-8">
          <h1 className="text-3xl font-semibold text-brand-black md:text-4xl">Create your account</h1>
          <p className="mt-2 text-sm leading-relaxed text-brand-gray">
            One account covers you personally and every business you manage.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="full-name" className={labelCls}>Full name</label>
              <input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputCls}
                placeholder="e.g. Nkem Chidinma Eze"
                autoComplete="name"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className={labelCls}>Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputCls}
                  placeholder="you@example.ng"
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="phone" className={labelCls}>Phone</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                  placeholder="+234 800 000 0000"
                  autoComplete="tel"
                />
              </div>
            </div>
            <div>
              <label htmlFor="date-of-birth" className={labelCls}>Date of birth</label>
              <input
                id="date-of-birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={inputCls}
                max={lagosToday()}
                autoComplete="bday"
              />
              <p className="mt-1.5 text-xs text-brand-gray">
                Accounts are for adults (18 and over). A parent or guardian orders for a child.
              </p>
            </div>
            <div>
              <label htmlFor="new-password" className={labelCls}>Password</label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                autoComplete="new-password"
              />
              {strength && (
                <p className="mt-1.5 text-xs font-semibold text-brand-black">
                  {strengthLabel[strength]}
                </p>
              )}
            </div>

            <label className="flex items-start gap-2 text-sm text-brand-black">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-black"
              />
              <span>I am 18 or over.</span>
            </label>

            <label className="flex items-start gap-2 text-sm text-brand-black">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-black"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="font-semibold underline" target="_blank">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-semibold underline" target="_blank">
                  Privacy Notice
                </Link>
                , including NDPA 2023 data handling.
              </span>
            </label>

            <label className="flex items-start gap-2 text-sm text-brand-black">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-black"
              />
              <span>
                Send me tips, deadline news and offers from Docufast by email, SMS or WhatsApp.
                I can stop at any time.
                <span className="mt-1 block text-xs text-brand-gray">
                  Order updates come either way. Change this any time in Privacy choices.
                </span>
              </span>
            </label>

            {error && <p role="alert" className="text-sm text-brand-error">{error}</p>}

            <button type="submit" disabled={submitting} className={goldBtn}>
              {submitting ? "Creating account…" : "Create account"}
            </button>

            <p className="text-xs leading-relaxed text-brand-gray">
              Businesses are added later, when you place an order under one. You'll set up
              two-factor authentication next, for account security.
            </p>
          </form>

          <p className="mt-5 text-sm text-brand-gray">
            Already registered?{" "}
            <Link href="/sign-in" className="font-semibold text-brand-black underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
