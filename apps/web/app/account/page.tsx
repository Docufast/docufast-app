"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import { supabase } from "@/lib/supabase";

// Real account starts with only "Personal" — no fake companies until an
// organisations table exists and the user actually adds a business.
const REAL_ORGS = [
  { id: "personal", name: "Personal", role: "Individual", detail: "0 vault files" },
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function formatMemberSince(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default function AccountHomePage() {
  const [activeContext, setActiveContext] = useState("personal");
  const [user, setUser] = useState<{
    fullName: string;
    email: string;
    phone: string;
    memberSince: string;
  } | null>(null);
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
        memberSince: formatMemberSince(authUser.created_at),
      });
      setLoading(false);
    }
    loadUser();
  }, []);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-brand-gray">Loading your account…</p>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <Sidebar active="Account" />

      <div className="px-6 py-6 lg:px-12 lg:py-8">
        <div className="flex items-end justify-between border-b-4 border-brand-black pb-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">
              Account
            </div>
            <h1 className="text-3xl font-extrabold text-brand-black">Profile</h1>
          </div>
          <Link
            href="/account/settings"
            className="border-4 border-brand-black px-4 py-2.5 text-sm font-bold"
          >
            Account settings →
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 border-4 border-brand-black p-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-brand-yellow text-2xl font-extrabold">
                {initials(user.fullName)}
              </div>
              <div className="mr-auto">
                <div className="text-xl font-extrabold text-brand-black">{user.fullName}</div>
                <div className="text-xs text-brand-gray">Member since {user.memberSince}</div>
                <span className="mt-2 inline-block border-2 border-brand-black px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                  Not yet KYC verified
                </span>
              </div>
              <button className="border-4 border-brand-black px-3 py-2 text-sm font-bold">
                Change photo
              </button>
            </div>

            <div>
              <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                Personal details
              </h2>
              <div className="mt-3 divide-y-2 divide-brand-black border-2 border-brand-black">
                {[
                  { label: "Full name", value: user.fullName, action: "Edit" },
                  { label: "Email", value: user.email, action: "Edit" },
                  { label: "Phone", value: user.phone, action: "Edit" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-36 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                      {row.label}
                    </span>
                    <span className="mr-auto text-sm">{row.value}</span>
                    <span className="text-xs font-bold uppercase tracking-wide">{row.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-baseline justify-between border-b-4 border-brand-black pb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                  Organisations
                </span>
                <span className="text-xs text-brand-gray">Click to switch</span>
              </div>
              <div className="mt-3 divide-y-2 divide-brand-black border-2 border-brand-black">
                {REAL_ORGS.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => setActiveContext(org.id)}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left ${
                      activeContext === org.id ? "border-l-4 border-brand-yellow bg-brand-yellow/10" : ""
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold">{org.name}</div>
                      <div className="text-xs text-brand-gray">
                        {org.role} · {org.detail}
                      </div>
                    </div>
                    {activeContext === org.id && <span>✓</span>}
                  </button>
                ))}
                <Link
                  href="/account/organizations/add"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-bold"
                >
                  + Add a business
                </Link>
              </div>
            </div>

            <div>
              <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                Security at a glance
              </h2>
              <div className="mt-3 divide-y-2 divide-brand-black border-2 border-brand-black text-sm">
                <div className="flex items-center justify-between px-4 py-3">
                  <span>Two-factor</span>
                  <span className="border-2 border-brand-black px-2 py-0.5 text-xs font-bold uppercase">
                    Off
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span>Recovery codes</span>
                  <span className="border-2 border-brand-black px-2 py-0.5 text-xs font-bold uppercase">
                    Not downloaded
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span>Active devices</span>
                  <span className="text-brand-gray">1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}