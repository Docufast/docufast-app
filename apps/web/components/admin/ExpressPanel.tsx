"use client";

import { useState } from "react";

// Express speed, deadline and late refund for an affidavit order (Terms section 7).
// "If you paid for Express and the same-day time is missed for any reason other than a delay on
// your side, we refund the Express fee automatically."

export interface ExpressFields {
  id: string;
  status: string;
  speed: "standard" | "express";
  delivered_at: string | null;
  express_due_at: string | null;
  express_fee_kobo: number | null;
  express_refund_status: "processing" | "refunded" | "refund_needed" | "not_due" | null;
  express_refund_note: string | null;
  express_refunded_at: string | null;
}

function lagos(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" });
}

function naira(kobo: number | null) {
  return `₦${((kobo || 0) / 100).toLocaleString("en-NG")}`;
}

export default function ExpressPanel({
  apiUrl,
  order,
  getAuthHeader,
  onChanged,
}: {
  apiUrl: string;
  order: ExpressFields;
  getAuthHeader: () => Promise<Record<string, string>>;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const due = order.express_due_at ? new Date(order.express_due_at) : null;
  const deliveredOnTime = due && order.delivered_at ? new Date(order.delivered_at) <= due : false;
  const late = due ? Date.now() > due.getTime() && !deliveredOnTime : false;

  async function call(path: string, method: string, body?: unknown) {
    setBusy(true);
    setMessage(null);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${apiUrl}/admin/orders/${order.id}${path}`, {
        method,
        headers: { ...headers, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setMessage(data.error || data.outcome || "That did not work.");
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function setSpeed(speed: "standard" | "express") {
    await call("", "PATCH", { speed });
  }

  async function refund() {
    if (!window.confirm(`Refund the Express fee (${naira(order.express_fee_kobo)}) to the customer now?`)) return;
    await call("/express-refund", "POST");
  }

  async function notDue() {
    if (!note.trim()) {
      setMessage("Write what the customer did not send, and when we asked.");
      return;
    }
    await call("/express-not-due", "POST", { note });
  }

  return (
    <div className="mt-6 rounded-card border-2 border-brand-black">
      <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
        Delivery speed
      </div>
      <div className="flex flex-col gap-3 p-4 text-sm">
        {!due ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-brand-gray">Speed (can change until payment):</span>
            {(["standard", "express"] as const).map((s) => (
              <button
                key={s}
                type="button"
                disabled={busy}
                onClick={() => setSpeed(s)}
                className={`rounded-card border-2 border-brand-black px-3 py-1 text-xs font-bold capitalize ${
                  order.speed === s ? "bg-brand-black text-brand-white" : ""
                }`}
              >
                {s}
              </button>
            ))}
            {order.speed === "express" && (
              <span className="basis-full text-xs text-brand-gray">
                The quote must include Express. The deadline starts when payment is confirmed.
              </span>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-bold">Express</span>
              <span>
                Due {lagos(due.toISOString())} (Lagos)
                {order.delivered_at && <> · delivered {lagos(order.delivered_at)}</>}
              </span>
            </div>

            {order.express_refund_status === "refunded" && (
              <p className="rounded-card bg-brand-success/10 px-3 py-2 text-brand-black">
                Express fee {naira(order.express_fee_kobo)} refunded
                {order.express_refunded_at ? ` on ${lagos(order.express_refunded_at)}` : ""}. The customer was emailed.
              </p>
            )}
            {order.express_refund_status === "not_due" && (
              <p className="rounded-card bg-brand-offwhite px-3 py-2">
                No refund due (delay on the customer&apos;s side): {order.express_refund_note}
              </p>
            )}
            {order.express_refund_status === "processing" && <p>Refund in progress…</p>}
            {order.express_refund_status === "refund_needed" && (
              <p className="rounded-card bg-brand-error/5 px-3 py-2 text-brand-error">
                The refund failed at Paystack: {order.express_refund_note}. Try again below.
              </p>
            )}

            {!order.express_refund_status && deliveredOnTime && (
              <p className="text-brand-success">Delivered on time. No refund due.</p>
            )}
            {!order.express_refund_status && late && (
              <p className="rounded-card bg-brand-error/5 px-3 py-2 font-bold text-brand-error">
                LATE. The Express fee ({naira(order.express_fee_kobo)}) will be refunded automatically on the next
                check, unless the delay was on the customer&apos;s side and you record it now.
              </p>
            )}

            {(order.express_refund_status === null || order.express_refund_status === "refund_needed") &&
              !deliveredOnTime && (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={refund}
                    className="self-start rounded-card bg-brand-black px-4 py-2 text-xs font-bold text-brand-white disabled:opacity-50"
                  >
                    Refund Express fee now
                  </button>
                  {order.express_refund_status === null && (
                    <div className="flex flex-col gap-2 border-t border-brand-gray-light pt-2">
                      <label className="text-xs font-semibold uppercase tracking-wide">
                        Delay on the customer&apos;s side?
                      </label>
                      <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g. Identification video requested 10:05 by WhatsApp, received 16:40"
                        className="rounded-input border-2 border-brand-black px-2 py-1.5"
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={notDue}
                        className="self-start rounded-card border-2 border-brand-black px-4 py-1.5 text-xs font-bold disabled:opacity-50"
                      >
                        Record: no refund due
                      </button>
                    </div>
                  )}
                </div>
              )}
          </>
        )}
        {message && <p className="text-xs text-brand-error">{message}</p>}
      </div>
    </div>
  );
}
