"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";

// TODO: replace with real data from Supabase once connected.
const MOCK_USER = {
  fullName: "Nkem Chidinma Eze",
  email: "nkem@ezeventures.ng",
  phone: "+234 802 441 7788",
  memberSince: "July 2026",
  orderCount: 18,
  kycVerified: true,
  verificationDetail: "NIN and BVN matched · 22 Jul 2026",
};

const MOCK_ORGS = [
  { id: "personal", name: "Personal", role: "Individual", detail: "6 vault files" },
  { id: "org1", name: "Adeyemi & Co", role: "Member", detail: "RC 1904882" },
  { id: "org2", name: "Kessa Logistics Ltd", role: "Owner", detail: "RC 2277104" },
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function AccountHomePage() {
  const [activeContext, setActiveContext] = useState("personal");

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
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 border-4 border-brand-black p-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-brand-yellow text-2xl font-extrabold">
                {initials(MOCK_USER.fullName)}
              </div>
              <div className="mr-auto">
                <div className="text-xl font-extrabold text-brand-black">{MOCK_USER.fullName}</div>
                <div className="text-xs text-brand-gray">
                  Member since {MOCK_USER.memberSince} · {MOCK_USER.orderCount} orders
                </div>
                {MOCK_USER.kycVerified && (
                  <span className="mt-2 inline-block bg-brand-yellow px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
                    KYC verified
                  </span>
                )}
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
                  { label: "Full name", value: MOCK_USER.fullName, action: "Edit" },
                  { label: "Email", value: MOCK_USER.email, action: "Edit" },
                  { label: "Phone", value: MOCK_USER.phone, action: "Edit" },
                  { label: "Verification", value: MOCK_USER.verificationDetail, action: "Verified" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-36 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                      {row.label}
                    </span>
                    <span className="mr-auto text-sm">{row.value}</span>
                    <span
                      className={`text-xs font-bold uppercase tracking-wide ${
                        row.action === "Verified" ? "bg-brand-yellow px-2 py-0.5" : ""
                      }`}
                    >
                      {row.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-baseline justify-between border-b-4 border-brand-black pb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                  Organisations
                </span>
                <span className="text-xs text-brand-gray">Click to switch</span>
              </div>
              <div className="mt-3 divide-y-2 divide-brand-black border-2 border-brand-black">
                {MOCK_ORGS.map((org) => (
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
                  <span className="bg-brand-yellow px-2 py-0.5 text-xs font-bold uppercase">On · app</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span>Recovery codes</span>
                  <span className="border-2 border-brand-black px-2 py-0.5 text-xs font-bold uppercase">
                    Not downloaded
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span>Active devices</span>
                  <span className="text-brand-gray">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
