"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function formatSecretForDisplay(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(" ") || secret;
}

export default function TwoFactorSetupPage() {
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function startEnrollment() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/sign-in";
        return;
      }

      const { data: factorsData } = await supabase.auth.mfa.listFactors();

      const verifiedFactor = factorsData?.totp?.find((f) => f.status === "verified");
      if (verifiedFactor) {
        window.location.href = "/home";
        return;
      }

      const unverifiedFactors = factorsData?.totp?.filter((f) => f.status !== "verified") || [];
      for (const factor of unverifiedFactors) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "Docufast",
        friendlyName: `Docufast ${Date.now()}`,
      });

      if (enrollError) {
        setError(enrollError.message);
        setLoading(false);
        return;
      }

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setLoading(false);
    }
    startEnrollment();
  }, []);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || code.length !== 6) return;

    setVerifying(true);
    setError(null);

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });
    if (challengeError) {
      setError(challengeError.message);
      setVerifying(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });
    setVerifying(false);

    if (verifyError) {
      setError("Incorrect code. Check your authenticator app and try again.");
      return;
    }
    setVerified(true);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-brand-gray">Setting up two-factor authentication…</p>
      </main>
    );
  }

  if (verified) {
    return (
      <main className="mx-auto max-w-md px-6 py-16 text-center">
        <div className="rounded-card border-4 border-brand-black bg-brand-yellow/10 p-8">
          <h1 className="text-2xl font-extrabold text-brand-black">Two-factor turned on</h1>
          <p className="mt-3 text-sm text-brand-gray">
            You'll now be asked for a 6-digit code from your authenticator app whenever you
            sign in.
          </p>
          <a
            href="/home"
            className="mt-5 inline-block rounded-card bg-brand-black px-5 py-3 text-sm font-bold text-brand-white"
          >
            Continue to Docufast →
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <div className="rounded-card border-l-4 border-brand-yellow bg-brand-yellow/10 px-4 py-3 text-sm text-brand-black">
        Two-factor authentication is required on every Docufast account to keep your
        documents secure.
      </div>

      <h1 className="mt-6 text-2xl font-extrabold text-brand-black">Set up two-factor authentication</h1>
      <p className="mt-2 text-sm text-brand-gray">
        Scan this QR code with Google Authenticator, Authy, or 1Password.
      </p>

      {error && !factorId && <p className="mt-4 text-sm text-brand-error">{error}</p>}

      {qrCode && (
        <div className="mt-6 flex justify-center rounded-card border-4 border-brand-black p-6">
          <img src={qrCode} alt="2FA QR code" className="h-48 w-48" />
        </div>
      )}

      {secret && (
        <div className="mt-4 rounded-card border-2 border-dashed border-brand-gray-light p-3 text-center">
          <p className="text-xs text-brand-gray">Can't scan? Enter this key manually instead</p>
          <p className="mt-1 break-all font-mono text-base font-bold tracking-wider">
            {formatSecretForDisplay(secret)}
          </p>
        </div>
      )}

      <form onSubmit={handleVerify} className="mt-6 flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-wide">
          Enter the 6-digit code to confirm
        </label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="rounded-input border-4 border-brand-black px-3 py-3 text-center text-lg tracking-widest outline-none"
          placeholder="000000"
          inputMode="numeric"
        />
        {error && factorId && <p className="text-sm text-brand-error">{error}</p>}
        <button
          type="submit"
          disabled={verifying || code.length !== 6}
          className="rounded-card bg-brand-black px-4 py-3.5 text-base font-bold text-brand-white disabled:opacity-50"
        >
          {verifying ? "Verifying…" : "Confirm and turn on"}
        </button>
      </form>
    </main>
  );
}
