"use client";

import { useEffect, useState } from "react";

// Who opened this order's documents (#153). Read-only; entries can never be edited.
interface Entry {
  id: number;
  occurred_at: string;
  actor_role: string;
  action: string;
  channel: string;
  ip: string | null;
}

export default function OrderAccessLog({
  apiUrl,
  orderId,
  getAuthHeader,
  refreshKey,
}: {
  apiUrl: string;
  orderId: string;
  getAuthHeader: () => Promise<Record<string, string>>;
  refreshKey?: number;
}) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${apiUrl}/admin/orders/${orderId}/access-log`, { headers: await getAuthHeader() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Could not load the access log.");
      else setEntries(data.entries || []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, refreshKey]);

  return (
    <div className="mt-6 rounded-card border-2 border-brand-black">
      <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
        Document access log
      </div>
      <div className="p-4 text-sm">
        {error && <p className="text-brand-error">{error}</p>}
        {entries && entries.length === 0 && <p className="text-brand-gray">No access recorded yet.</p>}
        {entries && entries.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-brand-gray">
                  <th className="py-1 pr-3">When (Lagos)</th>
                  <th className="py-1 pr-3">Who</th>
                  <th className="py-1 pr-3">Action</th>
                  <th className="py-1 pr-3">Where</th>
                  <th className="py-1">IP</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-brand-gray-light">
                    <td className="py-1 pr-3">{new Date(e.occurred_at).toLocaleString("en-GB", { timeZone: "Africa/Lagos" })}</td>
                    <td className="py-1 pr-3">{e.actor_role}</td>
                    <td className="py-1 pr-3">{e.action}</td>
                    <td className="py-1 pr-3">{e.channel.replace(/_/g, " ")}</td>
                    <td className="py-1 font-mono">{e.ip || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
