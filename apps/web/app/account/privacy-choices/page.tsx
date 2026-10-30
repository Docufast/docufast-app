"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import TopBar from "@/components/ui/TopBar";
import AppFooter from "@/components/ui/AppFooter";
import { supabase } from "@/lib/supabase";

function ToggleBox({ on }: { on: boolean }) {
  return (
    <span
      className={`flex h-6 w-11 shrink-0 items-center border-2 border-brand-black p-0.5 ${
        on ? "justify-end bg-brand-black" : "justify-start bg-white"
      }`}
    >
      <span className={`h-4 w-4 ${on ? "bg-brand-yellow" : "bg-brand-gray-light"}`} />
    </span>
  );
}

export default function PrivacyChoicesPage() {
  const [fullName, setFullName] = useState<string | null>(null);
  const [marketing, setMarketing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/sign-in";
        return;
      }
      // Latest marketing decision for this person (row security shows only their own).
      const { data } = await supabase
        .from("current_consents")
        .select("granted")
        .eq("kind", "marketing")
        .maybeSingle();
      setMarketing(data?.granted === true);
      setFullName(user.user_metadata?.full_name || "Your name");
    }
    load();
  }, []);

  async function changeMarketing(next: boolean) {
    setSaving(true);
    setError(null);
    setMessage(null);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const res = await fetch("/api/account/marketing-consent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (session?.access_token ?? ""),
      },
      body: JSON.stringify({ marketingConsent: next }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Something went wrong. Please try again.");
      return;
    }
    setMarketing(next);
    setMessage(
      next
        ? "Saved. You will get tips, deadline news and offers from us."
        : "Saved. We will stop sending you tips, deadline news and offers."
    );
  }

  if (fullName === null) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-brand-gray">Loading your privacy choices…</p>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <Sidebar
        active="Account"
        subItem={[
          { label: "Settings", href: "/account/settings", active: false },
          { label: "Privacy choices", href: "/account/privacy-choices", active: true },
          { label: "Profile", href: "/account", active: false },
        ]}
      />

      <div>
        <TopBar userName={fullName} />
        <div className="px-6 py-6 lg:px-12 lg:py-8">
          <div className="border-b-4 border-brand-black pb-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">
              Account
            </div>
            <h1 className="text-3xl font-extrabold text-brand-black">Privacy choices</h1>
            <p className="mt-2 max-w-2xl text-sm text-brand-gray">
              You decide what we send you and how we use your information. You can change
              these choices at any time.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section>
              <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                Messages from us
              </h2>
              <div className="mt-3 border-2 border-brand-black text-sm rounded-card">
                <button
                  type="button"
                  role="switch"
                  aria-checked={marketing}
                  disabled={saving}
                  onClick={() => changeMarketing(!marketing)}
                  className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left disabled:opacity-50"
                >
                  <span>
                    Send me tips, deadline news and offers from Docufast by email, SMS or
                    WhatsApp. I can stop at any time.
                    <span className="mt-1 block text-xs text-brand-gray">
                      Order updates come either way.
                    </span>
                  </span>
                  <ToggleBox on={marketing} />
                </button>
              </div>
              {message && (
                <p role="status" className="mt-3 text-sm text-brand-black">
                  {message}
                </p>
              )}
              {error && (
                <p role="alert" className="mt-3 text-sm text-brand-error">
                  {error}
                </p>
              )}
            </section>

            <section>
              <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                Your information
              </h2>
              <div className="mt-3 border-2 border-brand-black px-4 py-4 text-sm rounded-card">
                <p>
                  You can ask us for a copy of the information we hold about you, ask us to
                  correct it, or ask us to delete it. Email{" "}
                  <a href="mailto:privacy@docufast.ng" className="font-bold underline">
                    privacy@docufast.ng
                  </a>{" "}
                  from the email address on your account and we will reply as soon as we can,
                  within the time the law allows.
                </p>
                <p className="mt-3 text-xs text-brand-gray">
                  We do not use analytics on this site yet. If we start, we will ask you first
                  and you will be able to change your answer here.
                </p>
                <p className="mt-3">
                  <Link href="/privacy" className="text-xs font-bold uppercase underline">
                    Read our Privacy Notice
                  </Link>
                </p>
              </div>
            </section>
          </div>
        </div>
        <AppFooter />
      </div>
    </main>
  );
}
