"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Sidebar from "@/components/ui/Sidebar";
import TopBar from "@/components/ui/TopBar";
import { supabase } from "@/lib/supabase";
import { Landmark, Receipt, Briefcase, ShieldCheck, FileCheck, Radio, CalendarClock } from "lucide-react";
import AppFooter from "@/components/ui/AppFooter";

const OBLIGATION_TYPES = [
  { name: "CAC Annual Returns", detail: "Penalty: ₦50,000 first month + ₦25,000/month", icon: Landmark },
  { name: "FIRS Tax Returns", detail: "Company Income Tax, VAT, Withholding Tax", icon: Receipt },
  { name: "LIRS Obligations", detail: "PAYE annual returns by 31 January", icon: Briefcase },
  { name: "NDPC Audit Return", detail: "Annual by 31 March", icon: ShieldCheck },
  { name: "SCUML Annual Declaration", detail: "AML/CFT activities, STRs, CDD updates", icon: FileCheck },
  { name: "NITDA Renewal", detail: "Provisional 6 months; substantive 2 years", icon: Radio },
];

const REMINDER_SCHEDULE = [
  { days: "90 days", desc: "First advisory (email + WhatsApp)" },
  { days: "60 days", desc: "Second reminder, with penalty consequence" },
  { days: "30 days", desc: "Direct CTA to file through Docufast, with quote" },
  { days: "14 days", desc: "Urgent alert in dashboard" },
  { days: "7 days", desc: "Daily reminders until filed or deadline passes" },
];

interface Deadline {
  id: string;
  obligation_type: string;
  due_date: string;
  status: string;
}

export default function CalendarPage() {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/sign-in";
        return;
      }
      setFullName(user.user_metadata?.full_name || "Your account");

      // Real query against compliance_deadlines — empty until an entity
      // has a filing that seeds a deadline.
      const { data } = await supabase
        .from("compliance_deadlines")
        .select("id, obligation_type, due_date, status")
        .order("due_date", { ascending: true });

      if (data) setDeadlines(data);
      setLoading(false);
    }
    loadData();
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
          {/* Hero banner */}
          <div className="flex items-center justify-between overflow-hidden rounded-card border-4 border-brand-black bg-gradient-to-r from-brand-yellow/20 to-brand-yellow/5 px-6 py-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">
                Calendar
              </div>
              <h1 className="text-3xl font-extrabold text-brand-black">Compliance calendar</h1>
              <p className="mt-1 text-sm text-brand-gray">
                We don't just process your documents. We remember when the next one is due.
              </p>
            </div>
            <div className="hidden items-center gap-4 lg:flex">
              <div className="text-right">
                <p className="text-lg font-bold text-brand-black">Never miss</p>
                <p className="text-lg font-bold text-brand-black">a deadline.</p>
                <span className="mt-1 inline-block h-1 w-10 bg-brand-yellow" />
              </div>
              <div className="relative h-24 w-24 shrink-0">
                <Image src="/images/hero-documents.png" alt="" fill className="object-contain" />
              </div>
            </div>
          </div>

          {/* Deadlines list or honest empty state */}
          {deadlines.length === 0 ? (
            <div className="mt-6 rounded-card border-2 border-dashed border-brand-gray-light p-10 text-center">
              <CalendarClock size={32} className="mx-auto text-brand-gray" />
              <p className="mt-2 font-bold text-brand-black">No deadlines tracked yet.</p>
              <p className="mt-1 text-sm text-brand-gray">
                Once you register a business or file through Docufast, upcoming obligations for
                that entity will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="mt-6 divide-y-2 divide-brand-black rounded-card border-2 border-brand-black bg-white">
              {deadlines.map((d) => (
                <div key={d.id} className="flex items-center gap-4 px-4 py-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-yellow/20">
                    <CalendarClock size={20} className="text-brand-black" />
                  </div>
                  <div className="mr-auto">
                    <div className="font-bold text-brand-black">
                      {d.obligation_type.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}
                    </div>
                    <div className="text-xs text-brand-gray">
                      Due{" "}
                      {new Date(d.due_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <span className="rounded-card bg-brand-yellow px-3 py-1.5 text-xs font-bold uppercase">
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* What gets tracked */}
            <section>
              <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                What we track
              </h2>
              <div className="mt-3 divide-y-2 divide-brand-black rounded-card border-2 border-brand-black bg-white">
                {OBLIGATION_TYPES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.name} className="flex items-center gap-3 px-4 py-3">
                      <Icon size={18} className="shrink-0 text-brand-black" />
                      <div>
                        <div className="text-sm font-bold text-brand-black">{item.name}</div>
                        <div className="text-xs text-brand-gray">{item.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Reminder schedule */}
            <section>
              <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                How reminders work
              </h2>
              <div className="mt-3 divide-y-2 divide-brand-black rounded-card border-2 border-brand-black bg-white">
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
          <AppFooter />
        </div>
      </div>
    </main>
  );
}
