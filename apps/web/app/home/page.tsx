"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import { supabase } from "@/lib/supabase";

const QUICK_ACTIONS = [
  { label: "Affidavit", href: "/services/affidavits", desc: "32 types, court-ready" },
  { label: "CAC Registration", href: "/services/cac", desc: "Business name, LTD, trustees" },
  { label: "Publications", href: "/services/publications", desc: "Newspaper notices" },
  { label: "Notarization", href: "/services/notarization", desc: "Digital, video session" },
];

export default function HomeDashboardPage() {
  const [firstName, setFirstName] = useState("");
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

      const fullName = authUser.user_metadata?.full_name || "";
      setFirstName(fullName.split(" ")[0] || "there");
      setLoading(false);
    }
    loadUser();
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
      <Sidebar active="Home" />

      <div className="px-6 py-6 lg:px-12 lg:py-8">
        <div className="border-b-4 border-brand-black pb-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">
            Home
          </div>
          <h1 className="text-3xl font-extrabold text-brand-black">Welcome back, {firstName}</h1>
        </div>

        {/* Quick actions */}
        <div className="mt-6">
          <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
            Start something new
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col gap-1 border-4 border-brand-black p-4 hover:bg-brand-yellow/10 rounded-card"
              >
                <span className="font-bold text-brand-black">{action.label}</span>
                <span className="text-xs text-brand-gray">{action.desc}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent orders — honest empty state, no fake data */}
          <section>
            <div className="flex items-baseline justify-between border-b-4 border-brand-black pb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                Recent orders
              </span>
              <Link href="/orders" className="text-xs font-bold uppercase">
                View all
              </Link>
            </div>
            <div className="mt-3 border-2 border-dashed border-brand-gray-light p-8 text-center rounded-card">
              <p className="text-sm text-brand-gray">You haven't placed any orders yet.</p>
              <Link
                href="/services/affidavits"
                className="mt-3 inline-block text-sm font-bold underline"
              >
                Start your first order →
              </Link>
            </div>
          </section>

          {/* Upcoming deadlines — honest empty state */}
          <section>
            <div className="flex items-baseline justify-between border-b-4 border-brand-black pb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                Upcoming deadlines
              </span>
              <Link href="/calendar" className="text-xs font-bold uppercase">
                View calendar
              </Link>
            </div>
            <div className="mt-3 border-2 border-dashed border-brand-gray-light p-8 text-center rounded-card">
              <p className="text-sm text-brand-gray">No compliance deadlines tracked yet.</p>
            </div>
          </section>
        </div>

        {/* Vault preview — honest empty state */}
        <section className="mt-6">
          <div className="flex items-baseline justify-between border-b-4 border-brand-black pb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
              Document vault
            </span>
            <Link href="/vault" className="text-xs font-bold uppercase">
              Open vault
            </Link>
          </div>
          <div className="mt-3 border-2 border-dashed border-brand-gray-light p-8 text-center rounded-card">
            <p className="text-sm text-brand-gray">Your vault is empty. Completed documents will appear here.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
