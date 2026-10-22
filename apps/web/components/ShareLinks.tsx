"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { encryptForShare } from "@/lib/vaultCrypto";

// Share links for one Vault document (Terms section 10). The link can expire and be cancelled,
// and every opening is logged and shown in "Who opened your documents".

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const DAY_CHOICES = [1, 7, 30];

export interface ShareRow {
  id: string;
  document_id: string;
  expires_at: string;
  revoked_at: string | null;
  open_count: number;
  last_opened_at: string | null;
  created_at: string;
}

function lagos(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ShareLinks({
  documentId,
  shares,
  getDecryptedBytes,
  onChanged,
}: {
  documentId: string;
  shares: ShareRow[];
  getDecryptedBytes: () => Promise<ArrayBuffer | null>;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newLink, setNewLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const now = Date.now();
  const live = shares.filter((s) => !s.revoked_at && new Date(s.expires_at).getTime() > now);

  async function authHeader(): Promise<Record<string, string>> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session ? { Authorization: `Bearer ${session.access_token}` } : {};
  }

  async function createLink() {
    setBusy(true);
    setError(null);
    setNewLink(null);
    setCopied(false);
    try {
      const bytes = await getDecryptedBytes();
      if (!bytes) return; // the Vault page shows why (for example, Vault locked)

      const { ciphertext, iv, key } = await encryptForShare(bytes);
      const form = new FormData();
      form.append("file", new Blob([ciphertext]), "shared");
      form.append("iv", iv);
      form.append("days", String(days));

      const res = await fetch(`${API_URL}/documents/${documentId}/shares`, {
        method: "POST",
        headers: await authHeader(),
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "We could not create the link.");
        return;
      }
      setNewLink(`${window.location.origin}/s/${data.token}#${key}`);
      onChanged();
    } catch {
      setError("We could not create the link. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function cancel(shareId: string) {
    setError(null);
    const res = await fetch(`${API_URL}/documents/shares/${shareId}`, {
      method: "DELETE",
      headers: await authHeader(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "We could not cancel the link.");
    }
    onChanged();
  }

  async function copy() {
    if (!newLink) return;
    try {
      await navigator.clipboard.writeText(newLink);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs font-bold uppercase tracking-wide text-brand-black underline"
      >
        {open ? "Close sharing" : `Share${live.length ? ` (${live.length} active)` : ""}`}
      </button>

      {open && (
        <div className="mt-3 rounded-card border-2 border-brand-black bg-brand-offwhite p-4 text-sm">
          <p className="text-brand-gray">
            Anyone with the link can open this document until it expires or you cancel it. Every opening is recorded
            below and in &quot;Who opened your documents&quot;.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide">Link lasts</span>
            {DAY_CHOICES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`rounded-card border-2 border-brand-black px-3 py-1 text-xs font-bold ${
                  days === d ? "bg-brand-black text-brand-white" : "bg-white"
                }`}
              >
                {d === 1 ? "1 day" : `${d} days`}
              </button>
            ))}
            <button
              type="button"
              onClick={createLink}
              disabled={busy}
              className="ml-auto rounded-card bg-brand-black px-4 py-2 text-xs font-bold text-brand-white disabled:opacity-50"
            >
              {busy ? "Creating…" : "Create link"}
            </button>
          </div>

          {newLink && (
            <div className="mt-3 rounded-card border-2 border-brand-success bg-white p-3">
              <p className="text-xs font-bold text-brand-black">
                Copy this link now. For your security we cannot show it again.
              </p>
              <div className="mt-2 flex gap-2">
                <input
                  readOnly
                  value={newLink}
                  onFocus={(e) => e.currentTarget.select()}
                  className="min-w-0 flex-1 rounded-input border-2 border-brand-black px-2 py-1 text-xs"
                />
                <button
                  type="button"
                  onClick={copy}
                  className="rounded-card bg-brand-black px-3 py-1 text-xs font-bold text-brand-white"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}

          {error && <p className="mt-3 text-xs text-brand-error">{error}</p>}

          {shares.length > 0 && (
            <ul className="mt-4 flex flex-col divide-y divide-brand-gray-light">
              {shares.map((s) => {
                const isLive = !s.revoked_at && new Date(s.expires_at).getTime() > now;
                return (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs">
                    <span>
                      Created {lagos(s.created_at)} ·{" "}
                      {s.revoked_at
                        ? `cancelled ${lagos(s.revoked_at)}`
                        : isLive
                          ? `expires ${lagos(s.expires_at)}`
                          : `expired ${lagos(s.expires_at)}`}{" "}
                      · opened {s.open_count} {s.open_count === 1 ? "time" : "times"}
                    </span>
                    {isLive && (
                      <button
                        type="button"
                        onClick={() => cancel(s.id)}
                        className="font-bold text-brand-error underline"
                      >
                        Cancel link
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
