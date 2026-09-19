"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getAffidavitType } from "@/lib/affidavitTypes";

// NOTE: this page currently only checks that someone is logged in — it does
// NOT yet check for a Founder/Admin role, since there's no roles table in
// Supabase yet. Any signed-in user can reach this URL directly right now.
// Real role-based access control needs to be added before this goes live.

const STATUS_LABELS: Record<string, string> = {
  quote_pending: "Quote pending",
  quote_sent: "Quote sent",
  paid: "Paid",
  sent_to_partner: "Sent to partner",
  in_processing: "In processing",
  qa_review: "QA review",
  ready_for_delivery: "Ready for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  name_rejected: "Name rejected",
};

interface Order {
  id: string;
  service_category: string;
  order_type: string;
  status: string;
  created_at: string;
}

interface Summary {
  totalOrders: number;
  ordersThisMonth: number;
  statusBreakdown: Record<string, number>;
  liveQueue: Order[];
}

function orderTypeLabel(serviceCategory: string, orderType: string) {
  if (serviceCategory === "affidavit") {
    return getAffidavitType(orderType)?.label || orderType;
  }
  return orderType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function shortRef(id: string) {
  return `DF-${id.slice(0, 8).toUpperCase()}`;
}

function MetricCard({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="rounded-card border-4 border-brand-black p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-gray">{label}</div>
      <div className="mt-1 text-3xl font-extrabold text-brand-black">{value}</div>
      {sublabel && <div className="mt-1 text-xs text-brand-gray">{sublabel}</div>}
    </div>
  );
}

function Module({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border-2 border-brand-black">
      <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-3">
        <h2 className="font-bold text-brand-black">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="rounded-card border-2 border-dashed border-brand-gray-light px-4 py-6 text-center text-sm text-brand-gray">
      {text}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/sign-in";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "founder") {
        window.location.href = "/home";
        return;
      }

      setLoading(false);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const res = await fetch("/api/admin/summary", {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          setSummaryError(data.error || "Failed to load dashboard data.");
          return;
        }
        setSummary(data);
      } catch (err) {
        setSummaryError("Failed to load dashboard data.");
      }
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
    <main className="min-h-screen bg-white">
      <nav className="flex items-center gap-6 border-b-4 border-brand-black px-6 py-4 lg:px-12">
        <Link href="/home" className="flex items-center gap-2">
          <Image src="/images/logo-black.png" alt="Docufast" width={26} height={26} />
          <span className="text-lg font-extrabold tracking-wide text-brand-black">DOCUFAST</span>
        </Link>
        <span className="rounded-card bg-brand-black px-2.5 py-1 text-xs font-bold uppercase text-brand-white">
          Admin Dashboard
        </span>
        <Link href="/home" className="ml-auto text-sm font-bold uppercase tracking-wide">
          ← Back to app
        </Link>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-12">
        {summaryError && (
          <div className="mb-6 rounded-card border-2 border-brand-error bg-brand-error/5 px-4 py-3 text-sm text-brand-error">
            {summaryError}
          </div>
        )}

        {/* Four core metrics — always visible */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Monthly net revenue" value="₦0" sublabel="Month-to-date · ₦0 YTD" />
          <MetricCard
            label="Orders this month"
            value={summary ? String(summary.ordersThisMonth) : "—"}
            sublabel={summary ? `${summary.totalOrders} total, all time` : undefined}
          />
          <MetricCard label="Cash runway" value="Not set" sublabel="Manual input required" />
          <MetricCard label="Open issues" value="0" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Module 1 — Commercial & Revenue */}
          <Module title="Commercial & Revenue">
            <div className="flex flex-col gap-3">
              {!summary || Object.keys(summary.statusBreakdown).length === 0 ? (
                <EmptyRow text="No orders yet — breakdown by status appears once orders exist." />
              ) : (
                <div className="flex flex-col gap-2">
                  {Object.entries(summary.statusBreakdown).map(([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between rounded-card border-2 border-brand-black px-3 py-2 text-sm"
                    >
                      <span>{STATUS_LABELS[status] || status}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-card border-2 border-brand-black p-3">
                  <div className="text-xs text-brand-gray">Average order value</div>
                  <div className="font-bold">—</div>
                </div>
                <div className="rounded-card border-2 border-brand-black p-3">
                  <div className="text-xs text-brand-gray">Conversion rate</div>
                  <div className="font-bold">—</div>
                </div>
                <div className="rounded-card border-2 border-brand-black p-3">
                  <div className="text-xs text-brand-gray">Referral-driven orders</div>
                  <div className="font-bold">0% <span className="text-xs text-brand-gray">/ 30% target</span></div>
                </div>
                <div className="rounded-card border-2 border-brand-black p-3">
                  <div className="text-xs text-brand-gray">Active vault subscribers</div>
                  <div className="font-bold">0</div>
                </div>
              </div>
            </div>
          </Module>

          {/* Module 2 — Operations & Quality (incl. QR Verification Feed) */}
          <Module title="Operations & Quality">
            <div className="flex flex-col gap-3">
              {!summary || summary.liveQueue.length === 0 ? (
                <EmptyRow text="Live order queue is empty." />
              ) : (
                <div className="flex flex-col divide-y-2 divide-brand-black rounded-card border-2 border-brand-black">
                  {summary.liveQueue.map((order) => (
                    <div key={order.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <div>
                        <div className="font-semibold">
                          {orderTypeLabel(order.service_category, order.order_type)}
                        </div>
                        <div className="text-xs text-brand-gray">{shortRef(order.id)}</div>
                      </div>
                      <span className="rounded-card bg-brand-yellow px-2 py-1 text-xs font-bold uppercase">
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-card border-2 border-brand-black p-3">
                  <div className="text-xs text-brand-gray">QA pass rate</div>
                  <div className="font-bold">—</div>
                </div>
                <div className="rounded-card border-2 border-brand-black p-3">
                  <div className="text-xs text-brand-gray">BluetentBC SLA</div>
                  <div className="font-bold">—</div>
                </div>
              </div>
              <div className="rounded-card border-2 border-brand-black">
                <div className="border-b-2 border-brand-black px-3 py-2 text-xs font-bold uppercase tracking-wide">
                  QR Verification Feed
                </div>
                <div className="grid grid-cols-2 gap-3 p-3 text-sm">
                  <div>
                    <div className="text-xs text-brand-gray">Scans today / this month</div>
                    <div className="font-bold">0 / 0</div>
                  </div>
                  <div>
                    <div className="text-xs text-brand-gray">Revocations this month</div>
                    <div className="font-bold">0</div>
                  </div>
                </div>
                <p className="border-t-2 border-brand-black px-3 py-2 text-xs text-brand-gray">
                  Not built yet — this feed goes live once the QR Verification Layer (Phase 8) is
                  implemented.
                </p>
              </div>
            </div>
          </Module>

          {/* Module 3 — Financial & Cash */}
          <Module title="Financial & Cash">
            <div className="flex flex-col gap-3 text-sm">
              <div className="rounded-card border-2 border-dashed border-brand-gray-light p-3 text-center text-brand-gray">
                Cash position hasn't been entered yet.
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-card border-2 border-brand-black p-3">
                  <div className="text-xs text-brand-gray">Monthly burn rate</div>
                  <div className="font-bold">—</div>
                </div>
                <div className="rounded-card border-2 border-brand-black p-3">
                  <div className="text-xs text-brand-gray">Payroll summary</div>
                  <div className="font-bold">—</div>
                </div>
              </div>
              <div className="rounded-card border-2 border-brand-black p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                  Platform costs
                </div>
                <div className="mt-1 text-xs text-brand-gray">
                  Vercel · Railway · Supabase · Cloudflare · SendGrid · 360Dialog — not yet tracked
                </div>
              </div>
            </div>
          </Module>

          {/* Module 4 — Compliance & Regulatory */}
          <Module title="Compliance & Regulatory">
            <div className="flex flex-col gap-3 text-sm">
              <EmptyRow text="No compliance deadlines tracked yet." />
              <div className="rounded-card border-2 border-brand-black p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                  Filing status
                </div>
                <div className="mt-1 text-xs text-brand-gray">
                  CAC · SCUML · NDPC · FIRS · LIRS · NITDA · BPP · NSITF · ITF
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-card border-2 border-brand-black p-3">
                  <div className="text-xs text-brand-gray">NDPC audit countdown</div>
                  <div className="font-bold">—</div>
                </div>
                <div className="rounded-card border-2 border-brand-black p-3">
                  <div className="text-xs text-brand-gray">AML/CFT training</div>
                  <div className="font-bold">—</div>
                </div>
              </div>
            </div>
          </Module>
        </div>
      </div>
    </main>
  );
}
