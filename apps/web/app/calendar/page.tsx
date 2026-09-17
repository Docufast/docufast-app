"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import TopBar from "@/components/ui/TopBar";
import { supabase } from "@/lib/supabase";

// Real obligation types tracked by the compliance automation engine.
const OBLIGATION_TYPES = [
  { name: "CAC Annual Returns", detail: "Penalty: ₦50,000 first month + ₦25,000/month" },
  { name: "FIRS Tax Returns", detail: "Company Income Tax, VAT, Withholding Tax" },
  { name: "LIRS Obligations", detail: "PAYE annual returns by 31 January" },
  { name: "NDPC Audit Return", detail: "Annual by 31 March" },
  { name: "SCUML Annual Declaration", detail: "AML/CFT activities, STRs, CDD updates" },
  { name: "NITDA Renewal", detail: "Provisional 6 months; substantive 2 years" },
];

const REMINDER_SCHEDULE = [
  { days: "90 days", desc: "First advisory (email + WhatsApp)" },
  { days: "60 days", desc: "Second reminder, with penalty consequence" },
  { days: "30 days", desc: "Direct CTA to file through Docufast, with quote" },
  { days: "14 days", desc: "Urgent alert in dashboard" },
  { days: "7 days", desc: "Daily reminders until filed or deadline passes" },
];

export default function CalendarPage() {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/sign-in";
        return;
      }
      setFullName(user.user_metadata?.full_name || "Your account");
      setLoading(false);
    }
    checkAuth();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-brand-gray">Loading…</p>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <Sidebar active="Calendar" />

      <div>
        <TopBar userName={fullName} />
        <div className="px-6 py-6 lg:px-12 lg:py-8">
        <div className="border-b-4 border-brand-black pb-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">
            Calendar
          </div>
          <h1 className="text-3xl font-extrabold text-brand-black">Compliance calendar</h1>
        </div>

        {/* The real headline feature statement */}
        <div className="mt-6 rounded-card border-4 border-brand-black bg-brand-yellow/10 p-5">
          <p className="text-sm text-brand-black">
            <span className="font-bold">
              We don't just process your documents. We remember when the next one is due.
            </span>{" "}
            Every affidavit, CAC registration, or publication processed through Docufast
            automatically seeds a compliance calendar entry for that entity.
          </p>
        </div>

        {/* Honest empty state — no entities/deadlines exist yet, no fake dates */}
        <div className="mt-6 rounded-card border-2 border-dashed border-brand-gray-light p-10 text-center">
          <p className="font-bold text-brand-black">No deadlines tracked yet.</p>
          <p className="mt-1 text-sm text-brand-gray">
            Once you register a business or file through Docufast, upcoming obligations for
            that entity will appear here automatically.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* What gets tracked */}
          <section>
            <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
              What we track
            </h2>
            <div className="mt-3 divide-y-2 divide-brand-black rounded-card border-2 border-brand-black">
              {OBLIGATION_TYPES.map((item) => (
                <div key={item.name} className="px-4 py-3">
                  <div className="text-sm font-bold text-brand-black">{item.name}</div>
                  <div className="text-xs text-brand-gray">{item.detail}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Reminder schedule */}
          <section>
            <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
              How reminders work
            </h2>
            <div className="mt-3 divide-y-2 divide-brand-black rounded-card border-2 border-brand-black">
              {REMINDER_SCHEDULE.map((r) => (
                <div key={r.days} className="flex items-center gap-4 px-4 py-3">
                  <span className="w-16 shrink-0 rounded-card bg-brand-yellow px-2 py-1 text-center text-xs font-bold">
                    {r.days}
                  </span>
                  <span className="text-sm text-brand-gray">{r.desc}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
        </div>
      </div>
    </main>
  );
}
