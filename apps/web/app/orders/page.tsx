"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import { supabase } from "@/lib/supabase";

// Reflects the real order flow from the Platform Playbook — quotes are not
// instant, they arrive within 2 business hours via email + WhatsApp.
const ORDER_STAGES = [
  { label: "Quote requested", desc: "Submitted — quote arrives within 2 business hours" },
  { label: "Quote sent", desc: "Review and accept via email or WhatsApp" },
  { label: "Paid", desc: "Order confirmed, sent to processing" },
  { label: "In processing", desc: "Assigned to a processor, tracked in real time" },
  { label: "QA review", desc: "Checked against your order before sealing" },
  { label: "Delivered", desc: "Sealed with a QR code, added to your vault" },
];

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/sign-in";
        return;
      }
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
      <Sidebar active="Orders" />

      <div className="px-6 py-6 lg:px-12 lg:py-8">
        <div className="border-b-4 border-brand-black pb-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">
            Orders
          </div>
          <h1 className="text-3xl font-extrabold text-brand-black">Your orders</h1>
        </div>

        {/* Honest empty state — no orders table exists yet, no fake data */}
        <div className="mt-6 rounded-card border-2 border-dashed border-brand-gray-light p-10 text-center">
          <p className="font-bold text-brand-black">You haven't placed any orders yet.</p>
          <p className="mt-1 text-sm text-brand-gray">
            Once you do, you'll be able to track every stage right here.
          </p>
          <Link
            href="/services/affidavits"
            className="mt-4 inline-block rounded-card bg-brand-black px-5 py-3 text-sm font-bold text-brand-white"
          >
            Browse services →
          </Link>
        </div>

        {/* What to expect — real process info, not fake order data */}
        <div className="mt-10">
          <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
            What happens after you order
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ORDER_STAGES.map((stage, i) => (
              <div key={stage.label} className="rounded-card border-2 border-brand-black p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-card bg-brand-yellow text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="font-bold text-brand-black">{stage.label}</span>
                </div>
                <p className="mt-2 text-xs text-brand-gray">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}