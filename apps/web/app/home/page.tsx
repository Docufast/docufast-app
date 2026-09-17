"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/ui/Sidebar";
import TopBar from "@/components/ui/TopBar";
import { supabase } from "@/lib/supabase";
import { getAffidavitType } from "@/lib/affidavitTypes";
import { FileText, Landmark, Newspaper, Video, Calendar, FolderOpen, Upload } from "lucide-react";
import AppFooter from "@/components/ui/AppFooter";

const QUICK_ACTIONS = [
  { label: "Affidavit", href: "/services/affidavits", desc: "32 types, court-ready", category: "affidavit", icon: FileText },
  { label: "CAC Registration", href: "/services/cac", desc: "Business name, LTD, trustees", category: "cac", icon: Landmark },
  { label: "Publications", href: "/services/publications", desc: "Newspaper notices", category: "publication", icon: Newspaper },
  { label: "Notarization", href: "/services/notarization", desc: "Digital, video session", category: "platform_native", icon: Video },
];

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

const TERMINAL_STATUSES = ["delivered", "cancelled"];

interface Order {
  id: string;
  service_category: string;
  order_type: string;
  status: string;
  created_at: string;
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

// Short, real, unique reference derived from the order's own UUID —
// not a fake sequential number, just a readable slice of a real ID.
function shortRef(id: string) {
  return `DF-${id.slice(0, 8).toUpperCase()}`;
}

export default function HomeDashboardPage() {
  const [fullName, setFullName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showUploadNote, setShowUploadNote] = useState(false);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        window.location.href = "/sign-in";
        return;
      }

      const name = authUser.user_metadata?.full_name || "";
      setFullName(name || "Your account");
      setFirstName(name.split(" ")[0] || "there");

      const { data } = await supabase
        .from("orders")
        .select("id, service_category, order_type, status, created_at")
        .order("created_at", { ascending: false });

      if (data) setOrders(data);
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

  const activeCountFor = (category: string) =>
    orders.filter((o) => o.service_category === category && !TERMINAL_STATUSES.includes(o.status)).length;

  const recentOrders = orders.slice(0, 3);

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <Sidebar active="Home" />

      <div>
        <TopBar userName={fullName} />

        <div className="px-6 py-6 lg:px-12 lg:py-8">
          {/* Hero banner */}
          <div className="flex items-center justify-between overflow-hidden rounded-card border-4 border-brand-black bg-gradient-to-r from-brand-yellow/20 to-brand-yellow/5 px-6 py-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">
                Home
              </div>
              <h1 className="text-3xl font-extrabold text-brand-black">Welcome back, {firstName}</h1>
              <p className="mt-1 text-sm text-brand-gray">What would you like to do today?</p>
            </div>
            <div className="hidden items-center gap-4 lg:flex">
              <div className="text-right">
                <p className="text-lg font-bold text-brand-black">Documents today.</p>
                <p className="text-lg font-bold text-brand-black">A simpler tomorrow.</p>
                <span className="mt-1 inline-block h-1 w-10 bg-brand-yellow" />
              </div>
              <div className="relative h-24 w-24 shrink-0">
                <Image src="/images/hero-documents.png" alt="" fill className="object-contain" />
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
              Start something new
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {QUICK_ACTIONS.map((action) => {
                const count = activeCountFor(action.category);
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group relative flex flex-col gap-3 rounded-card border-4 border-brand-black p-4 hover:bg-brand-black hover:text-brand-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-yellow/20 group-hover:bg-brand-yellow/30">
                        <Icon size={20} className="text-brand-black group-hover:text-brand-yellow" />
                      </div>
                      {count > 0 && (
                        <span className="rounded-card bg-brand-yellow px-2 py-0.5 text-xs font-bold text-brand-black">
                          {count} active
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold">{action.label}</div>
                      <div className="text-xs text-brand-gray group-hover:text-neutral-300">
                        {action.desc}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent orders */}
            <section>
              <div className="flex items-baseline justify-between border-b-4 border-brand-black pb-1.5">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                  <FileText size={14} /> Recent orders
                </span>
                <Link href="/orders" className="text-xs font-bold uppercase">
                  View all →
                </Link>
              </div>
              {recentOrders.length === 0 ? (
                <div className="mt-3 rounded-card border-2 border-dashed border-brand-gray-light p-8 text-center">
                  <p className="text-sm text-brand-gray">You haven't placed any orders yet.</p>
                  <Link
                    href="/services/affidavits"
                    className="mt-3 inline-block text-sm font-bold underline"
                  >
                    Start your first order →
                  </Link>
                </div>
              ) : (
                <div className="mt-3 divide-y-2 divide-brand-black rounded-card border-2 border-brand-black">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-yellow/20">
                        <FileText size={16} className="text-brand-black" />
                      </div>
                      <div className="mr-auto">
                        <div className="text-sm font-bold">
                          {orderTypeLabel(order.service_category, order.order_type)}
                        </div>
                        <div className="text-xs text-brand-gray">
                          {shortRef(order.id)} · Submitted{" "}
                          {new Date(order.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      <span className="rounded-card bg-brand-yellow px-2 py-1 text-xs font-bold uppercase">
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Upcoming deadlines */}
            <section>
              <div className="flex items-baseline justify-between border-b-4 border-brand-black pb-1.5">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                  <Calendar size={14} /> Upcoming deadlines
                </span>
                <Link href="/calendar" className="text-xs font-bold uppercase">
                  View calendar →
                </Link>
              </div>
              <div className="mt-3 rounded-card border-2 border-dashed border-brand-gray-light p-8 text-center">
                <p className="text-sm text-brand-gray">No compliance deadlines tracked yet.</p>
                <p className="mt-1 text-xs text-brand-gray">
                  We'll notify you here once you have upcoming deadlines.
                </p>
              </div>
            </section>
          </div>

          {/* Vault preview */}
          <section className="mt-6">
            <div className="flex items-baseline justify-between border-b-4 border-brand-black pb-1.5">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-gray">
                <FolderOpen size={14} /> Document vault
              </span>
              <Link href="/vault" className="text-xs font-bold uppercase">
                Open vault →
              </Link>
            </div>
            <div className="mt-3 rounded-card border-2 border-dashed border-brand-gray-light p-8 text-center">
              <p className="text-sm text-brand-gray">
                Your vault is empty. Completed documents will appear here.
              </p>
              <button
                onClick={() => setShowUploadNote(!showUploadNote)}
                className="mt-3 inline-flex items-center gap-2 rounded-card bg-brand-yellow px-4 py-2.5 text-sm font-bold text-brand-black"
              >
                <Upload size={16} /> Upload document
              </button>
              {showUploadNote && (
                <p className="mt-3 text-xs text-brand-gray">
                  Upload isn't connected yet — this needs Cloudflare R2 storage set up first.
                </p>
              )}
            </div>
          </section>
          <AppFooter />
        </div>
      </div>
    </main>
  );
}
