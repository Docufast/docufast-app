"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getAffidavitType } from "@/lib/affidavitTypes";
import { CreditCard, ArrowLeft, CheckCircle2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

type PayState = "idle" | "starting" | "confirming" | "paid" | "pending" | "failed";

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
  const searchParams = useSearchParams();
  const returnedReference = searchParams.get("reference");
  const [payState, setPayState] = useState<PayState>("idle");
  const [payMessage, setPayMessage] = useState<string | null>(null);

  async function authHeaders(): Promise<Record<string, string>> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session ? { Authorization: `Bearer ${session.access_token}` } : {};
  }

  // Start a Paystack hosted checkout (#109). The amount comes from the order on the server.
  async function startPayment() {
    if (!order) return;
    setPayState("starting");
    setPayMessage(null);
    try {
      const res = await fetch(`${API_URL}/orders/${order.id}/initiate-payment`, {
        method: "POST",
        headers: await authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.paymentUrl) {
        setPayState("failed");
        setPayMessage(data.error || "We could not start your payment. Please try again.");
        return;
      }
      window.location.href = data.paymentUrl;
    } catch {
      setPayState("failed");
      setPayMessage("We could not reach Docufast. Check your connection and try again.");
    }
  }

  // Back from Paystack with ?reference=...: confirm with the server, checking a few times
  // because bank transfers can take a moment to confirm.
  useEffect(() => {
    if (!returnedReference || !order || order.status === "paid") return;
    let cancelled = false;
    async function check(attempt: number) {
      setPayState("confirming");
      try {
        const res = await fetch(
          `${API_URL}/orders/${orderId}/payment-status?reference=${encodeURIComponent(returnedReference!)}`,
          { headers: await authHeaders() }
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (data.status === "paid") {
          setPayState("paid");
          setOrder((o) => (o ? { ...o, status: "paid" } : o));
          return;
        }
        if (attempt < 5) {
          setTimeout(() => check(attempt + 1), 3000);
        } else {
          setPayState("pending");
        }
      } catch {
        if (!cancelled) setPayState("pending");
      }
    }
    check(1);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [returnedReference, order?.id]);

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
        {order.status === "paid" || payState === "paid" ? (
          <div role="status" className="flex items-start gap-3 rounded-card border-2 border-brand-success p-4 text-sm text-brand-black">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-brand-success" />
            <div>
              <p className="font-bold">Payment received. Thank you.</p>
              <p className="mt-1 text-brand-gray">
                Your receipt is on its way by email, and your order is now being processed.{" "}
                <Link href="/orders" className="font-semibold text-brand-black underline">
                  Follow your order
                </Link>
                .
              </p>
            </div>
          </div>
        ) : payState === "confirming" ? (
          <p role="status" className="rounded-card bg-brand-offwhite p-4 text-center text-sm text-brand-black">
            Confirming your payment with your bank…
          </p>
        ) : payState === "pending" ? (
          <div role="status" className="rounded-card bg-brand-offwhite p-4 text-sm text-brand-black">
            <p className="font-bold">We are still waiting for your bank to confirm.</p>
            <p className="mt-1 text-brand-gray">
              Please do not pay again. Some transfers take a little longer; your order updates automatically as
              soon as the payment is confirmed. If money leaves your account twice, the extra payment is
              refunded automatically.
            </p>
          </div>
        ) : order.status === "quote_sent" ? (
          <>
            <button
              onClick={startPayment}
              disabled={payState === "starting"}
              className="flex w-full items-center justify-center gap-2 rounded-card bg-brand-black px-4 py-4 text-base font-bold text-brand-white disabled:opacity-50"
            >
              <CreditCard size={18} /> {payState === "starting" ? "Opening secure payment…" : "Pay securely"}
            </button>
            <p className="mt-3 text-center text-xs text-brand-gray">
              Card, bank transfer, USSD or bank account, on a secure checkout opened from docufast.ng. Prices
              include VAT.
            </p>
            {payMessage && (
              <p role="alert" className="mt-3 text-center text-sm text-brand-error">
                {payMessage}
              </p>
            )}
          </>
        ) : (
          <p className="rounded-card bg-brand-offwhite p-4 text-center text-sm text-brand-gray">
            This order is not waiting for payment.
          </p>
        )}
      </div>

      <div className="mt-6 rounded-card border-l-4 border-brand-yellow bg-brand-yellow/10 px-4 py-3 text-sm text-brand-black">
        Pay only on docufast.ng. Docufast never asks you to pay into a personal account, and our
        WhatsApp team will never send you bank details. If anyone does, do not pay, and report it
        to us.
      </div>
    </main>
  );
}
