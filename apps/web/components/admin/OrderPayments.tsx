"use client";

import { useEffect, useState } from "react";

// Payment attempts for an order (#109). Flags anything staff must act on.
interface Payment {
  reference: string;
  amount_kobo: number;
  status: string;
  channel: string | null;
  paid_at: string | null;
  created_at: string;
}

const LABELS: Record<string, string> = {
  initialized: "Started, not paid",
  failed: "Failed or abandoned",
  success: "Paid",
  amount_mismatch: "ACTION: amount did not match the quote",
  duplicate_refunded: "Extra payment, refunded",
  duplicate_refund_needed: "ACTION: extra payment, refund failed",
};

export default function OrderPayments({
  apiUrl,
  orderId,
  getAuthHeader,
}: {
  apiUrl: string;
  orderId: string;
  getAuthHeader: () => Promise<Record<string, string>>;
}) {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${apiUrl}/admin/orders/${orderId}/payments`, { headers: await getAuthHeader() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Could not load payments.");
      else setPayments(data.payments || []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <div className="mt-6 rounded-card border-2 border-brand-black">
      <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
        Payments
      </div>
      <div className="p-4 text-sm">
        {error && <p className="text-brand-error">{error}</p>}
        {payments && payments.length === 0 && <p className="text-brand-gray">No payment attempts yet.</p>}
        {payments && payments.length > 0 && (
          <div className="flex flex-col divide-y divide-brand-gray-light">
            {payments.map((p) => (
              <div key={p.reference} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div>
                  <div className="font-mono text-xs">{p.reference}</div>
                  <div className="text-xs text-brand-gray">
                    {p.paid_at ? `Paid ${new Date(p.paid_at).toLocaleString("en-GB", { timeZone: "Africa/Lagos" })}` : `Started ${new Date(p.created_at).toLocaleString("en-GB", { timeZone: "Africa/Lagos" })}`}
                    {p.channel ? ` · ${p.channel}` : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₦{(p.amount_kobo / 100).toLocaleString("en-NG")}</div>
                  <div className={`text-xs ${p.status.startsWith("duplicate_refund_needed") || p.status === "amount_mismatch" ? "font-bold text-brand-error" : "text-brand-gray"}`}>
                    {LABELS[p.status] || p.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
