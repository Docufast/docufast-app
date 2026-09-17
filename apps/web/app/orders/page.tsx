"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import TopBar from "@/components/ui/TopBar";
import { supabase } from "@/lib/supabase";
import { getAffidavitType } from "@/lib/affidavitTypes";

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
  quote_amount: number | null;
  created_at: string;
}

function orderTypeLabel(serviceCategory: string, orderType: string) {
  if (serviceCategory === "affidavit") {
    return getAffidavitType(orderType)?.label || orderType;
  }
  // Fallback: turn snake_case into Title Case for other categories
  return orderType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fullName, setFullName] = useState("");

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
        <div className="border-b-4 border-brand-black pb-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">
            Orders
          </div>
          <h1 className="text-3xl font-extrabold text-brand-black">Your orders</h1>
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
          <div className="mt-6 divide-y-2 divide-brand-black rounded-card border-2 border-brand-black">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-4 py-4">
                <div>
                  <div className="font-bold text-brand-black">
                    {orderTypeLabel(order.service_category, order.order_type)}
                  </div>
                  <div className="text-xs text-brand-gray">
                    {new Date(order.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {order.quote_amount && ` · ₦${order.quote_amount.toLocaleString()}`}
                  </div>
                </div>
                <span className="rounded-card bg-brand-yellow px-3 py-1.5 text-xs font-bold uppercase tracking-wide">
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* What to expect — real process info, always shown */}
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
      </div>
    </main>
  );
}
