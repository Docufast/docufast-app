"use client";

import { useEffect, useState } from "react";

// Founder-only switch that pauses new customer orders. The database enforces the pause
// (migration 20261103_pause_orders.sql); this panel only flips it. Left OFF by default.
export default function PauseOrdersPanel({ accessToken }: { accessToken: string | null }) {
  const [paused, setPaused] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      try {
        const res = await fetch("/api/admin/pause-orders", {
          cache: "no-store",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        if (!res.ok) return setError(data.error || "Could not read the switch.");
        setPaused(data.paused === true);
        setMessage(data.message || "");
      } catch {
        setError("Could not read the switch.");
      }
    })();
  }, [accessToken]);

  async function apply(next: boolean) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pause-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ paused: next, message }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Could not change the switch.");
      else {
        setPaused(next);
        setConfirming(false);
      }
    } catch {
      setError("Could not change the switch.");
    }
    setBusy(false);
  }

  return (
    <div className="rounded-card border-2 border-brand-black p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold">Pause new orders</h3>
          <p className="text-sm">
            {paused === null
              ? "Loading..."
              : paused
              ? "Orders are PAUSED. Customers cannot place new orders. Existing quotes can still be paid."
              : "Orders are open."}
          </p>
        </div>
        <span
          className={`rounded-full border-2 border-brand-black px-3 py-1 text-xs font-bold ${
            paused ? "bg-red-200" : "bg-green-200"
          }`}
        >
          {paused === null ? "..." : paused ? "PAUSED" : "OPEN"}
        </span>
      </div>

      <label className="mt-3 block text-sm font-semibold" htmlFor="pause-message">
        Message customers will see (optional)
      </label>
      <input
        id="pause-message"
        value={message}
        maxLength={300}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="We are not taking new orders right now. Please check back soon."
        className="mt-1 w-full rounded border-2 border-brand-black px-3 py-2 text-sm"
      />

      {error && <p className="mt-2 text-sm font-semibold text-red-700">{error}</p>}

      <div className="mt-3 flex gap-2">
        {paused === false && !confirming && (
          <button
            disabled={busy}
            onClick={() => setConfirming(true)}
            className="rounded border-2 border-brand-black bg-brand-yellow px-4 py-2 text-sm font-bold"
          >
            Pause new orders
          </button>
        )}
        {paused === false && confirming && (
          <>
            <button
              disabled={busy}
              onClick={() => apply(true)}
              className="rounded border-2 border-brand-black bg-red-200 px-4 py-2 text-sm font-bold"
            >
              {busy ? "Pausing..." : "Yes, pause now"}
            </button>
            <button
              disabled={busy}
              onClick={() => setConfirming(false)}
              className="rounded border-2 border-brand-black px-4 py-2 text-sm font-bold"
            >
              Cancel
            </button>
          </>
        )}
        {paused === true && (
          <button
            disabled={busy}
            onClick={() => apply(false)}
            className="rounded border-2 border-brand-black bg-green-200 px-4 py-2 text-sm font-bold"
          >
            {busy ? "Resuming..." : "Resume orders"}
          </button>
        )}
      </div>
    </div>
  );
}
