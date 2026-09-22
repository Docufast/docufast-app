"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getPasswordStrength, strengthLabel } from "@/lib/passwordStrength";
import { unwrapPrivateKey, wrapPrivateKey } from "@/lib/vaultCrypto";
import { storeUnlockedPrivateKey } from "@/lib/vaultSession";

export default function ResetPasswordPage() {
  const [checkingMfa, setCheckingMfa] = useState(true);
  const [needsMfa, setNeedsMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaVerifying, setMfaVerifying] = useState(false);

  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const strength = password ? getPasswordStrength(password) : null;

  useEffect(() => {
    async function checkMfaRequirement() {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aal && aal.nextLevel === "aal2" && aal.nextLevel !== aal.currentLevel) {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors?.totp?.find((f) => f.status === "verified");
        if (totpFactor) {
          setFactorId(totpFactor.id);
          setNeedsMfa(true);
        }
      }
      setCheckingMfa(false);
    }
    checkMfaRequirement();
  }, []);

  async function handleMfaVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || mfaCode.length !== 6) return;

    setMfaVerifying(true);
    setMfaError(null);

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });
    if (challengeError) {
      setMfaError(challengeError.message);
      setMfaVerifying(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: mfaCode,
    });
    setMfaVerifying(false);

    if (verifyError) {
      setMfaError("Incorrect code. Check your authenticator app and try again.");
      return;
    }
    setNeedsMfa(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!recoveryPhrase.trim()) {
      setError("Enter your 12-word recovery phrase.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Your reset link has expired. Please request a new one.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "vault_encrypted_private_key_recovery, vault_recovery_salt, vault_recovery_iv"
        )
        .eq("id", user.id)
        .single();

      let unwrappedPrivateKey = null;

      if (
        profile?.vault_encrypted_private_key_recovery &&
        profile.vault_recovery_salt &&
        profile.vault_recovery_iv
      ) {
        try {
          unwrappedPrivateKey = await unwrapPrivateKey(
            {
              ciphertext: profile.vault_encrypted_private_key_recovery,
              salt: profile.vault_recovery_salt,
              iv: profile.vault_recovery_iv,
            },
            recoveryPhrase.trim().toLowerCase()
          );
        } catch (err) {
          setError(
            "That recovery phrase doesn't match our records. Check the words and try again."
          );
          return;
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }

      if (unwrappedPrivateKey) {
        const rewrapped = await wrapPrivateKey(unwrappedPrivateKey, password);
        await supabase
          .from("profiles")
          .update({
            vault_encrypted_private_key_pw: rewrapped.ciphertext,
            vault_pw_salt: rewrapped.salt,
            vault_pw_iv: rewrapped.iv,
          })
          .eq("id", user.id);

        await storeUnlockedPrivateKey(user.id, unwrappedPrivateKey);
      }

      setDone(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingMfa) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-brand-gray">Loading…</p>
      </main>
    );
  }

  if (needsMfa) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
        <div className="flex items-center gap-2">
          <Image src="/images/logo-black.png" alt="Docufast" width={24} height={24} />
          <span className="text-xl font-extrabold tracking-wide text-brand-black">DOCUFAST</span>
        </div>

        <div className="mt-8">
          <h1 className="text-2xl font-extrabold text-brand-black">Verify it's you</h1>
          <p className="mt-1 text-sm text-brand-gray">
            Enter the 6-digit code from your authenticator app to continue resetting your
            password.
          </p>
        </div>

        <form onSubmit={handleMfaVerify} className="mt-6 flex flex-col gap-4">
          <input
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="rounded-input border-4 border-brand-black px-3 py-3 text-center text-lg tracking-widest outline-none"
            placeholder="000000"
            inputMode="numeric"
          />
          {mfaError && <p className="text-sm text-brand-error">{mfaError}</p>}
          <button
            type="submit"
            disabled={mfaVerifying || mfaCode.length !== 6}
            className="rounded-card bg-brand-black px-4 py-3.5 text-base font-bold text-brand-white disabled:opacity-50"
          >
            {mfaVerifying ? "Verifying…" : "Verify and continue"}
          </button>
        </form>
      </main>
    );
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
            Your password has been changed, and your vault access has been restored. You can
            now sign in with your new password.
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

          <div className="rounded-card border-l-4 border-brand-yellow bg-brand-yellow/10 px-3 py-2 text-xs text-brand-black">
            Enter your 12-word recovery phrase to restore access to your vault documents
            under your new password.
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
              Recovery phrase
            </label>
            <textarea
              value={recoveryPhrase}
              onChange={(e) => setRecoveryPhrase(e.target.value)}
              rows={2}
              placeholder="word1 word2 word3 ..."
              className="w-full rounded-input border-4 border-brand-black px-3 py-3 text-sm outline-none"
            />
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
