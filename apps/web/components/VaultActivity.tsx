"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// "Who opened my documents" (#153). Customers see every recorded access to their own
// documents, including by Docufast staff. Row Level Security limits this to their own rows.
interface Entry {
  id: number;
  occurred_at: string;
  actor_role: string;
  action: string;
  channel: string;
}

const WHO: Record<string, string> = {
  customer: "You",
  founder: "Docufast (Founder)",
  staff: "Docufast staff",
  system: "Docufast system",
  share_recipient: "Someone with your share link",
};

const WHAT: Record<string, string> = {
  view: "viewed",
  download: "downloaded",
  deliver: "delivered to your Vault",
  upload: "uploaded",
  share: "created a share link for",
  print: "printed",
  delete: "deleted",
};

export default function VaultActivity() {
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("document_access_log")
        .select("id, occurred_at, actor_role, action, channel")
        .order("id", { ascending: false })
        .limit(50);
      setEntries(data || []);
    })();
  }, []);

  if (!entries) return null;

  return (
    <div className="mt-10 rounded-card border-2 border-brand-black bg-white p-5">
      <h2 className="font-bold text-brand-black">Who opened your documents</h2>
      <p className="mt-1 text-sm text-brand-gray">
        Every view, download and delivery is recorded, including by Docufast staff. Nobody can change these
        records.
      </p>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-brand-gray">Nothing recorded yet.</p>
      ) : (
        <ul className="mt-3 flex flex-col divide-y divide-brand-gray-light text-sm">
          {entries.map((e) => (
            <li key={e.id} className="flex flex-wrap justify-between gap-2 py-2">
              <span>
                <span className="font-semibold">{WHO[e.actor_role] || e.actor_role}</span> {WHAT[e.action] || e.action}
                {e.action === "share" ? " a document" : ""}
              </span>
              <span className="text-xs text-brand-gray">
                {new Date(e.occurred_at).toLocaleString("en-GB", { timeZone: "Africa/Lagos" })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
