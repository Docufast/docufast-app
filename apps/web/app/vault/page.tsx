"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/ui/Sidebar";
import { supabase } from "@/lib/supabase";

export default function VaultPage() {
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
      <Sidebar active="Vault" />

      <div className="px-6 py-6 lg:px-12 lg:py-8">
        <div className="border-b-4 border-brand-black pb-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">
            Vault
          </div>
          <h1 className="text-3xl font-extrabold text-brand-black">Your document vault</h1>
        </div>

        {/* Trust statement — real policy, not marketing fluff */}
        <div className="mt-6 rounded-card border-4 border-brand-black bg-brand-yellow/10 p-5">
          <p className="text-sm text-brand-black">
            <span className="font-bold">Your documents are encrypted end-to-end.</span> Docufast
            staff cannot read your uploaded documents. Input documents are permanently deleted
            30 days after your order is completed. Every document you receive carries a QR
            code — so any institution can independently verify it's genuine.
          </p>
        </div>

        {/* Honest empty state — no documents table exists yet, no fake files */}
        <div className="mt-6 rounded-card border-2 border-dashed border-brand-gray-light p-10 text-center">
          <p className="font-bold text-brand-black">Your vault is empty.</p>
          <p className="mt-1 text-sm text-brand-gray">
            Completed documents from your orders will appear here, ready to view or download.
          </p>
        </div>

        {/* Storage policy — real terms, not fake usage stats */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-card border-2 border-brand-black p-5">
            <h2 className="font-bold text-brand-black">Free access period</h2>
            <p className="mt-2 text-sm text-brand-gray">
              Every delivered document stays free to view and download in your vault for
              <span className="font-bold text-brand-black"> 1 month</span> after delivery.
            </p>
          </div>
          <div className="rounded-card border-2 border-brand-black p-5">
            <h2 className="font-bold text-brand-black">Permanent storage</h2>
            <p className="mt-2 text-sm text-brand-gray">
              After the free period, an annual subscription keeps your documents stored
              permanently and includes ongoing compliance reminders for your entities.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}