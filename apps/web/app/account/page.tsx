"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";

// TODO: replace with real data from Supabase (users, organisations tables)
// once the project is connected.
const MOCK_USER = {
  fullName: "Nkem Chidinma Eze",
  email: "nkem@ezeventures.ng",
  phone: "+234 802 441 7788",
  memberSince: "Jul 2026",
  kycVerified: true,
};

const MOCK_ORGS = [
  { id: "personal", name: "Personal", role: "Individual", detail: "6 vault files" },
  { id: "org1", name: "Adeyemi & Co", role: "Member", detail: "RC 1904882" },
  { id: "org2", name: "Kessa Logistics Ltd", role: "Owner", detail: "1 deadline under 30 days" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AccountHomePage() {
  const [activeContext, setActiveContext] = useState("personal");

  return (
    <main className="mx-auto min-h-screen max-w-sm px-4 py-6 pb-24">
      <h1 className="text-lg font-bold text-brand-black">Account</h1>

      {/* Identity header */}
      <Card className="mt-4 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-black text-lg font-bold text-brand-white">
          {initials(MOCK_USER.fullName)}
        </div>
        <div>
          <p className="font-semibold text-brand-black">{MOCK_USER.fullName}</p>
          <p className="text-xs text-brand-gray">Member since {MOCK_USER.memberSince}</p>
        </div>
      </Card>

      {/* KYC status */}
      <Card className="mt-3 flex items-center justify-between">
        <span className="text-sm font-medium text-brand-black">
          {MOCK_USER.kycVerified ? "KYC verified" : "Not yet verified"}
        </span>
        <StatusBadge status={MOCK_USER.kycVerified ? "success" : "pending"}>
          {MOCK_USER.kycVerified ? "Verified" : "Pending"}
        </StatusBadge>
      </Card>

      {/* Personal details */}
      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
          Personal details
        </h2>
        <Card className="mt-2 divide-y divide-brand-gray-light p-0">
          {[
            { label: "Full name", value: MOCK_USER.fullName },
            { label: "Email", value: MOCK_USER.email },
            { label: "Phone", value: MOCK_USER.phone },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-xs text-brand-gray">{row.label}</p>
                <p className="text-sm text-brand-black">{row.value}</p>
              </div>
              <button className="text-xs font-semibold text-brand-black underline">
                Edit
              </button>
            </div>
          ))}
        </Card>
      </section>

      {/* Active context / org switcher */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
            Active context
          </h2>
          <span className="text-xs text-brand-gray">Tap to switch</span>
        </div>
        <Card className="mt-2 divide-y divide-brand-gray-light p-0">
          {MOCK_ORGS.map((org) => (
            <button
              key={org.id}
              onClick={() => setActiveContext(org.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div>
                <p className="text-sm font-medium text-brand-black">{org.name}</p>
                <p className="text-xs text-brand-gray">
                  {org.role} · {org.detail}
                </p>
              </div>
              {activeContext === org.id && (
                <span className="text-brand-yellow">✓</span>
              )}
            </button>
          ))}
          <Link
            href="/account/organizations/add"
            className="block px-4 py-3 text-sm font-semibold text-brand-black"
          >
            + Add a business
          </Link>
        </Card>
      </section>

      <Link
        href="/account/settings"
        className="mt-6 block rounded-card border border-brand-gray-light px-4 py-3 text-center text-sm font-semibold text-brand-black"
      >
        Account settings
      </Link>
    </main>
  );
}
