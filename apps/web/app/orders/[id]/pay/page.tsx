"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getAffidavitType } from "@/lib/affidavitTypes";
import { CreditCard, ArrowLeft } from "lucide-react";

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

export default function OrderPaymentPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = `/sign-in?redirect=/orders/${orderId}/pay`;
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("id, service_category, order_type, status, quote_amount, created_at")
        .eq("id", orderId)
        .single();

      if (fetchError || !data) {
        setError("Order not found.");
        setLoading(false);
        return;
      }

      if (!data.quote_amount) {
        setError("This order doesn't have a quote yet.");
        setLoading(false);
        return;
      }

      setOrder(data);
      setLoading(false);
    }
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-brand-gray">Loading…</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-black">{error}</h1>
        <Link href="/orders" className="mt-4 inline-block font-bold underline">
          ← Back to orders
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-6 lg:px-16 lg:py-10">
      <nav className="flex items-center gap-6 border-b-4 border-brand-black pb-4">
        <Link href="/home" className="flex items-center gap-2">
          <Image src="/images/logo-black.png" alt="Docufast" width={28} height={28} />
          <span className="text-xl font-extrabold tracking-wide text-brand-black">DOCUFAST</span>
        </Link>
        <Link
          href="/orders"
          className="ml-auto flex items-center gap-1 text-sm font-semibold uppercase tracking-wide"
        >
          <ArrowLeft size={14} /> Orders
        </Link>
      </nav>

      <div className="mt-8">
        <h1 className="text-3xl font-extrabold text-brand-black">Complete payment</h1>
        <p className="mt-1 text-sm text-brand-gray">
          Review your quote and pay securely to move your order forward.
        </p>
      </div>

      <div className="mt-6 rounded-card border-2 border-brand-black">
        <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
          Order summary
        </div>
        <div className="flex flex-col gap-3 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-brand-gray">Service</span>
            <span className="font-semibold">
              {orderTypeLabel(order.service_category, order.order_type)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-gray">Reference</span>
            <span className="font-semibold">{shortRef(order.id)}</span>
          </div>
          <div className="flex justify-between border-t-2 border-brand-black pt-3">
            <span className="font-bold text-brand-black">Amount due</span>
            <span className="text-xl font-extrabold text-brand-black">
              ₦{order.quote_amount!.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-card bg-brand-black px-4 py-4 text-base font-bold text-brand-white opacity-50"
        >
          <CreditCard size={18} /> Proceed to payment
        </button>
        <p className="mt-3 text-center text-xs text-brand-gray">
          Online payment isn't live yet — we're finishing setup with our payment partner.
          You'll be notified by email as soon as this is ready.
        </p>
      </div>

      <div className="mt-6 rounded-card border-l-4 border-brand-yellow bg-brand-yellow/10 px-4 py-3 text-sm text-brand-black">
        In the meantime, you can complete payment via bank transfer — message us on WhatsApp
        for details and we'll confirm once received.
      </div>
    </main>
  );
}
