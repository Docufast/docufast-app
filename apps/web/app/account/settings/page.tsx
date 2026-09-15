"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";
import StatusBadge from "@/components/ui/StatusBadge";

// TODO: replace with real data + mutations via Supabase once connected.
const MOCK_ORGS = [
  { name: "Personal", role: "INDIVIDUAL" },
  { name: "Adeyemi & Co", role: "MEMBER" },
  { name: "Kessa Logistics Ltd", role: "OWNER" },
];

export default function AccountSettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [whatsappNotif, setWhatsappNotif] = useState(true);
  const [twoFA, setTwoFA] = useState(true);

  return (
    <main className="mx-auto min-h-screen max-w-sm px-4 py-6 pb-24">
      <div className="flex items-center gap-2">
        <Link href="/account" className="text-brand-black">←</Link>
        <h1 className="text-lg font-bold text-brand-black">Settings</h1>
      </div>

      {/* Personal information */}
      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
          Personal information
        </h2>
        <Card className="mt-2 divide-y divide-brand-gray-light p-0">
          <Link href="/account" className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-brand-black">Name, email and phone</span>
            <span className="text-brand-gray">›</span>
          </Link>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-brand-black">Verification status</span>
            <StatusBadge status="success">KYC VERIFIED</StatusBadge>
          </div>
        </Card>
      </section>

      {/* Security */}
      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
          Security
        </h2>
        <Card className="mt-2 divide-y divide-brand-gray-light p-0">
          <button className="flex w-full items-center justify-between px-4 py-3 text-left">
            <span className="text-sm text-brand-black">Change password</span>
            <span className="text-xs text-brand-gray">›</span>
          </button>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-brand-black">Two-factor authentication</span>
            <Toggle checked={twoFA} onChange={setTwoFA} label="Two-factor authentication" />
          </div>
          <button className="flex w-full items-center justify-between px-4 py-3 text-left">
            <span className="text-sm text-brand-black">Recovery codes</span>
            <span className="text-xs text-brand-error">NOT DOWNLOADED</span>
          </button>
          <button className="flex w-full items-center justify-between px-4 py-3 text-left">
            <span className="text-sm text-brand-black">Active sessions & devices</span>
            <span className="text-xs text-brand-gray">3 devices ›</span>
          </button>
        </Card>
      </section>

      {/* Notifications */}
      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
          Notifications
        </h2>
        <Card className="mt-2 divide-y divide-brand-gray-light p-0">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-brand-black">Email</span>
            <Toggle checked={emailNotif} onChange={setEmailNotif} label="Email notifications" />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-brand-black">SMS</span>
            <Toggle checked={smsNotif} onChange={setSmsNotif} label="SMS notifications" />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-brand-black">WhatsApp</span>
            <Toggle checked={whatsappNotif} onChange={setWhatsappNotif} label="WhatsApp notifications" />
          </div>
        </Card>
      </section>

      {/* Organisations */}
      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
          Organisations · {MOCK_ORGS.length}
        </h2>
        <Card className="mt-2 divide-y divide-brand-gray-light p-0">
          {MOCK_ORGS.map((org) => (
            <div key={org.name} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-brand-black">{org.name}</span>
              <span className="text-xs font-semibold text-brand-gray">{org.role}</span>
            </div>
          ))}
          <Link
            href="/account/organizations/add"
            className="block px-4 py-3 text-sm font-semibold text-brand-black"
          >
            + Add or manage
          </Link>
        </Card>
      </section>

      {/* Referral */}
      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
          Referral
        </h2>
        <Card className="mt-2">
          <p className="text-xs text-brand-gray">Your code</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-mono text-sm font-semibold text-brand-black">NKEM-4417</span>
            <button className="rounded-card bg-brand-black px-3 py-1.5 text-xs font-semibold text-brand-white">
              Copy link
            </button>
          </div>
          <p className="mt-2 text-xs text-brand-gray">7 signed up · ₦14,000 earned</p>
        </Card>
      </section>

      <section className="mt-6">
        <Card className="divide-y divide-brand-gray-light p-0">
          <button className="flex w-full items-center justify-between px-4 py-3 text-left">
            <span className="text-sm text-brand-black">Help & support</span>
            <span className="text-xs text-brand-gray">WhatsApp, email</span>
          </button>
          <button className="flex w-full items-center justify-between px-4 py-3 text-left">
            <span className="text-sm text-brand-black">Data & NDPR requests</span>
            <span className="text-xs text-brand-gray">›</span>
          </button>
        </Card>
      </section>

      <button className="mt-6 w-full rounded-card border border-brand-error px-4 py-3 text-sm font-semibold text-brand-error">
        Log out
      </button>
    </main>
  );
}
