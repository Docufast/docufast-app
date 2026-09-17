"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import TopBar from "@/components/ui/TopBar";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useOrg } from "@/contexts/OrgContext";
import AppFooter from "@/components/ui/AppFooter";

function ToggleBox({ on }: { on: boolean }) {
  return (
    <span
      className={`flex h-6 w-11 items-center border-2 border-brand-black p-0.5 ${
        on ? "justify-end bg-brand-black" : "justify-start bg-white"
      }`}
    >
      <span className={`h-4 w-4 ${on ? "bg-brand-yellow" : "bg-brand-gray-light"}`} />
    </span>
  );
}

export default function AccountSettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [whatsappNotif, setWhatsappNotif] = useState(true);
  const { orgs } = useOrg();
  const [user, setUser] = useState<{ fullName: string; email: string; phone: string } | null>(
    null
  );
  const [has2fa, setHas2fa] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [turningOff, setTurningOff] = useState(false);
  const [twoFaError, setTwoFaError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        window.location.href = "/sign-in";
        return;
      }

      setUser({
        fullName: authUser.user_metadata?.full_name || "Your name",
        email: authUser.email || "",
        phone: authUser.user_metadata?.phone || "Not provided",
      });

      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];
      setHas2fa(!!totpFactor);
      setFactorId(totpFactor?.id || null);
      setLoading(false);
    }
    loadUser();
  }, []);

  async function handleTurnOff2fa() {
    if (!factorId) return;
    const confirmed = window.confirm(
      "Turn off two-factor authentication? Your account will only need a password to sign in."
    );
    if (!confirmed) return;

    setTurningOff(true);
    setTwoFaError(null);
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setTurningOff(false);

    if (error) {
      setTwoFaError(error.message);
      return;
    }
    setHas2fa(false);
    setFactorId(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-brand-gray">Loading your settings…</p>
      </main>
    );
  }

  // Referral code derived from the real signed-up email — no fake code.
  const referralCode = user.email.split("@")[0].toUpperCase().slice(0, 6) + "-" + user.email.length;

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <Sidebar
        active="Account"
        subItem={[
          { label: "Settings", href: "/account/settings", active: true },
          { label: "Profile", href: "/account", active: false },
        ]}
      />

      <div>
        <TopBar userName={user.fullName} />
        <div className="px-6 py-6 lg:px-12 lg:py-8">
        <div className="flex items-end justify-between border-b-4 border-brand-black pb-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">
              Account
            </div>
            <h1 className="text-3xl font-extrabold text-brand-black">Settings</h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-card border-4 border-brand-error px-4 py-2.5 text-sm font-bold text-brand-error"
          >
            Log out
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Personal information */}
          <section>
            <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
              Personal information
            </h2>
            <div className="mt-3 divide-y-2 divide-brand-black border-2 border-brand-black text-sm rounded-card">
              <div className="flex items-center justify-between px-4 py-3">
                <span>{user.fullName}</span>
                <Link href="/account" className="text-xs font-bold uppercase underline">
                  Edit
                </Link>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span>{user.email}</span>
                <Link href="/account" className="text-xs font-bold uppercase underline">
                  Edit
                </Link>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span>{user.phone}</span>
                <Link href="/account" className="text-xs font-bold uppercase underline">
                  Edit
                </Link>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span>Verification status</span>
                <span className="border-2 border-brand-black px-2 py-0.5 text-xs font-bold uppercase">
                  Not yet verified
                </span>
              </div>
            </div>
          </section>

          {/* Security */}
          <section>
            <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
              Security
            </h2>
            <div className="mt-3 divide-y-2 divide-brand-black border-2 border-brand-black text-sm rounded-card">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="mr-auto">Change password</span>
                <Link href="/forgot-password" className="text-xs font-bold uppercase underline">
                  Update
                </Link>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="mr-auto">Two-factor authentication</span>
                <span
                  className={`mr-3 px-2 py-0.5 text-xs font-bold uppercase ${
                    has2fa ? "bg-brand-yellow" : "border-2 border-brand-black"
                  }`}
                >
                  {has2fa ? "On" : "Off"}
                </span>
                {has2fa ? (
                  <button
                    onClick={handleTurnOff2fa}
                    disabled={turningOff}
                    className="text-xs font-bold uppercase text-brand-error underline disabled:opacity-50"
                  >
                    {turningOff ? "Turning off…" : "Turn off"}
                  </button>
                ) : (
                  <Link href="/account/security/2fa" className="text-xs font-bold uppercase underline">
                    Set up
                  </Link>
                )}
              </div>
              {twoFaError && (
                <p className="px-4 pb-2 text-xs text-brand-error">{twoFaError}</p>
              )}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="mr-auto">Recovery codes</span>
                <span className="border-2 border-brand-black px-2 py-0.5 text-xs font-bold uppercase">
                  Not downloaded
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="mr-auto">Active sessions & devices</span>
                <span className="text-xs text-brand-gray">1 device (this one)</span>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
              Notifications
            </h2>
            <div className="mt-3 divide-y-2 divide-brand-black border-2 border-brand-black text-sm rounded-card">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="mr-auto">Email</span>
                <button onClick={() => setEmailNotif(!emailNotif)}>
                  <ToggleBox on={emailNotif} />
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="mr-auto">SMS</span>
                <button onClick={() => setSmsNotif(!smsNotif)}>
                  <ToggleBox on={smsNotif} />
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="mr-auto">WhatsApp</span>
                <button onClick={() => setWhatsappNotif(!whatsappNotif)}>
                  <ToggleBox on={whatsappNotif} />
                </button>
              </div>
            </div>
          </section>

          {/* Organisations */}
          <section>
            <div className="flex items-baseline justify-between border-b-4 border-brand-black pb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                Organisations
              </span>
            </div>
            <div className="mt-3 divide-y-2 divide-brand-black border-2 border-brand-black text-sm rounded-card">
              {orgs.map((org) => (
                <div key={org.id} className="flex items-center justify-between px-4 py-3">
                  <span className="mr-auto">{org.name}</span>
                  <span className="border-2 border-brand-black px-2 py-0.5 text-xs font-bold uppercase">
                    {org.role}
                  </span>
                </div>
              ))}
              <Link
                href="/account/organizations/add"
                className="flex items-center gap-2 px-4 py-3 text-sm font-bold"
              >
                + Add a business
              </Link>
            </div>
          </section>

          {/* Referral */}
          <section>
            <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
              Referral
            </h2>
            <div className="mt-3 rounded-card border-4 border-brand-black p-4">
              <div className="flex items-center gap-3">
                <div className="mr-auto">
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                    Your code
                  </div>
                  <div className="text-2xl font-extrabold tracking-wide">{referralCode}</div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://docufast.ng/r/${referralCode}`);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  }}
                  className="rounded-card bg-brand-black px-3 py-2.5 text-sm font-bold text-brand-white"
                >
                  {linkCopied ? "Copied!" : "Copy link"}
                </button>
              </div>
              <div className="mt-3 flex gap-6 border-t-2 border-brand-black pt-3">
                <div>
                  <div className="text-xl font-extrabold">0</div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                    Signed up
                  </div>
                </div>
                <div>
                  <div className="text-xl font-extrabold">₦0</div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                    Earned
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Help & support */}
          <section>
            <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
              Help & support
            </h2>
            <div className="mt-3 divide-y-2 divide-brand-black border-2 border-brand-black text-sm rounded-card">
              <div className="flex items-center justify-between px-4 py-3">
                <span>WhatsApp support</span>
                <span className="text-xs text-brand-gray">Mon–Sat, 08:00–20:00</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span>Email support</span>
                <span className="text-xs text-brand-gray">help@docufast.ng</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span>Data & NDPR requests</span>
                <a
                  href="mailto:help@docufast.ng?subject=Data%20%26%20NDPR%20Request"
                  className="text-xs font-bold uppercase underline"
                >
                  Open
                </a>
              </div>
            </div>
          </section>
        </div>
          <AppFooter />
        </div>
      </div>
    </main>
  );
}
