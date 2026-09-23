"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/ui/Sidebar";
import TopBar from "@/components/ui/TopBar";
import { supabase } from "@/lib/supabase";
import { getAffidavitType } from "@/lib/affidavitTypes";
import {
  FileText,
  Mail,
  CreditCard,
  Settings,
  ShieldCheck,
  Package,
  Clock,
  MoreVertical,
  Plus,
} from "lucide-react";
import AppFooter from "@/components/ui/AppFooter";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const ORDER_STAGES = [
  { label: "Quote requested", desc: "Submitted — quote arrives within 2 business hours", icon: FileText },
  { label: "Quote sent", desc: "Review and accept via email or WhatsApp", icon: Mail },
  { label: "Paid", desc: "Order confirmed, sent to processing", icon: CreditCard },
  { label: "In processing", desc: "Assigned to a processor, tracked in real time", icon: Settings },
  { label: "QA review", desc: "Checked against your order before sealing", icon: ShieldCheck },
  { label: "Delivered", desc: "Sealed with a QR code, added to your vault", icon: Package },
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

const CANCELLABLE_STATUSES = ["quote_pending", "quote_sent"];

interface Order {
  id: string;
  service_category: string;
  order_type: string;
  status: string;
  quote_amount: number | null;
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

function shortRef(id: string) {
  return `DF-${id.slice(0, 8).toUpperCase()}`;
}

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fullName, setFullName] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/sign-in";
        return;
      }
      setFullName(user.user_metadata?.full_name || "Your account");

      const { data, error } = await supabase
        .from("orders")
        .select("id, service_category, order_type, status, quote_amount, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    }
    loadOrders();
  }, []);

  async function handleCancelOrder(orderId: string) {
    const confirmed = window.confirm("Cancel this order? This can't be undone.");
    if (!confirmed) return;

    setCancelling(orderId);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o))
        );
      } else {
        alert(data.error || "Failed to cancel order.");
      }
    } catch (err) {
      alert("Failed to cancel order.");
    } finally {
      setCancelling(null);
      setOpenMenuId(null);
    }
  }

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

      <div>
        <TopBar userName={fullName} />
        <div className="px-6 py-6 lg:px-12 lg:py-8">
          <div className="flex items-center justify-between overflow-hidden rounded-card border-4 border-brand-black bg-gradient-to-r from-brand-yellow/20 to-brand-yellow/5 px-6 py-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">
                Orders
              </div>
              <h1 className="text-3xl font-extrabold text-brand-black">Your orders</h1>
              <p className="mt-1 text-sm text-brand-gray">
                Track and manage all your document requests in one place.
              </p>
            </div>
            <div className="hidden items-center gap-4 lg:flex">
              <div className="text-right">
                <p className="text-lg font-bold text-brand-black">From request</p>
                <p className="text-lg font-bold text-brand-black">to completion.</p>
                <span className="mt-1 inline-block h-1 w-10 bg-brand-yellow" />
              </div>
              <div className="relative h-24 w-24 shrink-0">
                <Image src="/images/hero-documents.png" alt="" fill className="object-contain" />
              </div>
            </div>
          </div>

          {orders.length === 0 ? (
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
          ) : (
            <div className="mt-6 divide-y-2 divide-brand-black rounded-card border-2 border-brand-black bg-white">
              {orders.map((order) => (
                <div key={order.id} className="relative flex items-center gap-4 px-4 py-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-yellow/20">
                    <FileText size={20} className="text-brand-black" />
                  </div>
                  <div className="mr-auto">
                    <div className="font-bold text-brand-black">
                      {orderTypeLabel(order.service_category, order.order_type)}
                    </div>
                    <div className="text-xs text-brand-gray">
                      {shortRef(order.id)} ·{" "}
                      {new Date(order.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-brand-yellow/20 px-3 py-1.5 text-xs font-bold uppercase text-brand-yellow-dark">
                    <Clock size={13} /> {STATUS_LABELS[order.status] || order.status}
                  </span>
                  {order.quote_amount ? (
                    order.status === "quote_sent" ? (
                      <Link
                        href={`/orders/${order.id}/pay`}
                        className="rounded-card bg-brand-yellow px-4 py-2.5 text-sm font-bold text-brand-black hover:bg-brand-yellow-dark"
                      >
                        ₦{order.quote_amount.toLocaleString()} · Pay now
                      </Link>
                    ) : (
                      <span className="rounded-card bg-brand-yellow px-4 py-2.5 text-sm font-bold text-brand-black">
                        ₦{order.quote_amount.toLocaleString()}
                      </span>
                    )
                  ) : null}
                  <button
                    onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                    className="rounded-card p-2 hover:bg-brand-yellow/10"
                    aria-label="More options"
                  >
                    <MoreVertical size={18} className="text-brand-gray" />
                  </button>
                  {openMenuId === order.id && (
                    <div className="absolute right-4 top-full z-10 mt-1 w-48 rounded-card border-2 border-brand-black bg-white shadow-lg">
                      {CANCELLABLE_STATUSES.includes(order.status) ? (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancelling === order.id}
                          className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-brand-error disabled:opacity-50"
                        >
                          {cancelling === order.id ? "Cancelling…" : "Cancel order"}
                        </button>
                      ) : (
                        <p className="px-4 py-2.5 text-xs text-brand-gray">
                          No actions available at this stage.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-10">
            <div className="flex items-center justify-between border-b-4 border-brand-black pb-1.5">
              <div>
                <h2 className="text-xl font-extrabold text-brand-black">What happens after you order</h2>
                <p className="text-sm text-brand-gray">
                  Here's how your request moves from start to finish.
                </p>
              </div>
              <a
                href="https://wa.me/2347089325109"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-card border-2 border-brand-black px-3 py-1.5 text-xs font-bold uppercase"
              >
                Learn more
              </a>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ORDER_STAGES.map((stage, i) => {
                const Icon = stage.icon;
                return (
                  <div key={stage.label} className="rounded-card border-2 border-brand-black bg-white p-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-yellow text-xs font-bold">
                        {i + 1}
                      </span>
                      <Icon size={18} className="text-brand-black" />
                      <span className="font-bold text-brand-black">{stage.label}</span>
                    </div>
                    <p className="mt-2 text-xs text-brand-gray">{stage.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <Link
            href="/services"
            className="mt-8 flex items-center justify-between rounded-card border-4 border-brand-black bg-brand-black px-6 py-5 text-brand-white hover:bg-neutral-900"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                <FileText size={20} />
              </div>
              <div>
                <div className="font-bold">Need a new document?</div>
                <div className="text-sm text-neutral-400">Place a new order in minutes.</div>
              </div>
            </div>
            <span className="flex items-center gap-2 rounded-card bg-brand-yellow px-4 py-2.5 text-sm font-bold text-brand-black">
              Place new order <Plus size={16} />
            </span>
          </Link>
          <AppFooter />
        </div>
      </div>
    </main>
  );
}
