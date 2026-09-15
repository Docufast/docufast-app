"use client";

import { useState } from "react";
import Sidebar from "@/components/ui/Sidebar";

// TODO: replace with real data + mutations via Supabase once connected.
const MOCK_ORGS = [
  { name: "Personal", role: "Individual", highlight: false },
  { name: "Adeyemi & Co", role: "Member", highlight: false },
  { name: "Kessa Logistics Ltd", role: "Owner", highlight: true },
];

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

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <Sidebar
        active="Account"
        subItem={[
          { label: "Settings", active: true },
          { label: "Profile", active: false },
        ]}
      />

      <div className="px-6 py-6 lg:px-12 lg:py-8">
        <div className="flex items-end justify-between border-b-4 border-brand-black pb-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">
              Account
            </div>
            <h1 className="text-3xl font-extrabold text-brand-black">Settings</h1>
          </div>
          <button className="border-4 border-brand-error px-4 py-2.5 text-sm font-bold text-brand-error">
            Log out
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Personal information */}
          <section>
            <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
              Personal information
            </h2>
            <div className="mt-3 divide-y-2 divide-brand-black border-2 border-brand-black text-sm">
              <div className="flex items-center justify-between px-4 py-3">
                <span>Name, email and phone</span>
                <span className="text-xs font-bold uppercase">Edit</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span>Verification status</span>
                <span className="bg-brand-yellow px-2 py-0.5 text-xs font-bold uppercase">KYC verified</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span>Profile photo</span>
                <span className="text-xs font-bold uppercase">Change</span>
              </div>
            </div>
          </section>

          {/* Security */}
          <section>
            <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
              Security
            </h2>
            <div className="mt-3 divide-y-2 divide-brand-black border-2 border-brand-black text-sm">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="mr-auto">Change password</span>
                <span className="mr-3 text-xs text-brand-gray">Last changed July</span>
                <span className="text-xs font-bold uppercase">Update</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="mr-auto">Two-factor authentication</span>
                <span className="mr-3 bg-brand-yellow px-2 py-0.5 text-xs font-bold uppercase">On · app</span>
                <span className="text-xs font-bold uppercase">Manage</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="mr-auto">Recovery codes</span>
                <span className="border-2 border-brand-black px-2 py-0.5 text-xs font-bold uppercase">
                  Not downloaded
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="mr-auto">Active sessions & devices</span>
                <span className="mr-3 text-xs text-brand-gray">3 devices</span>
                <span className="text-xs font-bold uppercase">Review</span>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
              Notifications
            </h2>
            <div className="mt-3 divide-y-2 divide-brand-black border-2 border-brand-black text-sm">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="mr-auto">Email</span>
                <span className="mr-3 text-xs text-brand-gray">Order updates, quotes</span>
                <button onClick={() => setEmailNotif(!emailNotif)}>
                  <ToggleBox on={emailNotif} />
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="mr-auto">SMS</span>
                <span className="mr-3 text-xs text-brand-gray">Off</span>
                <button onClick={() => setSmsNotif(!smsNotif)}>
                  <ToggleBox on={smsNotif} />
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="mr-auto">WhatsApp</span>
                <span className="mr-3 text-xs text-brand-gray">Status changes only</span>
                <button onClick={() => setWhatsappNotif(!whatsappNotif)}>
                  <ToggleBox on={whatsappNotif} />
                </button>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="mr-auto">Deadline reminders</span>
                <span className="mr-3 text-xs text-brand-gray">60, 30 and 7 days before</span>
                <span className="text-xs font-bold uppercase">Edit</span>
              </div>
            </div>
          </section>

          {/* Organisations */}
          <section>
            <div className="flex items-baseline justify-between border-b-4 border-brand-black pb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                Organisations
              </span>
              <span className="text-xs text-brand-gray">Role per organisation</span>
            </div>
            <div className="mt-3 divide-y-2 divide-brand-black border-2 border-brand-black text-sm">
              {MOCK_ORGS.map((org) => (
                <div key={org.name} className="flex items-center justify-between px-4 py-3">
                  <span className="mr-auto">{org.name}</span>
                  <span
                    className={`mr-3 px-2 py-0.5 text-xs font-bold uppercase ${
                      org.highlight
                        ? "bg-brand-black text-brand-yellow"
                        : "border-2 border-brand-black"
                    }`}
                  >
                    {org.role}
                  </span>
                  <span className="text-xs font-bold uppercase">Manage</span>
                </div>
              ))}
              <button className="flex items-center gap-2 px-4 py-3 text-sm font-bold">
                + Add a business
              </button>
            </div>
          </section>

          {/* Referral */}
          <section>
            <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
              Referral
            </h2>
            <div className="mt-3 border-4 border-brand-black p-4">
              <div className="flex items-center gap-3">
                <div className="mr-auto">
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                    Your code
                  </div>
                  <div className="text-2xl font-extrabold tracking-wide">NKEM-4417</div>
                </div>
                <button className="bg-brand-black px-3 py-2.5 text-sm font-bold text-brand-white">
                  Copy link
                </button>
              </div>
              <div className="mt-3 border-l-4 border-brand-yellow bg-brand-yellow/10 px-3 py-2 text-xs">
                docufast.ng/r/NKEM-4417
              </div>
              <div className="mt-3 flex gap-6 border-t-2 border-brand-black pt-3">
                <div>
                  <div className="text-xl font-extrabold">7</div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                    Signed up
                  </div>
                </div>
                <div>
                  <div className="text-xl font-extrabold">₦14,000</div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                    Earned
                  </div>
                </div>
                <div>
                  <div className="text-xl font-extrabold">₦6,000</div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                    Pending
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
            <div className="mt-3 divide-y-2 divide-brand-black border-2 border-brand-black text-sm">
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
                <span className="text-xs font-bold uppercase">Open</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span>Terms & privacy</span>
                <span className="text-xs font-bold uppercase">View</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
