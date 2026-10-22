"use client";

import { useEffect, useState } from "react";
import { courtFormFor } from "@/lib/lagoscomisForms";
import { toCourtJpeg } from "@/lib/courtImage";

// Staff filing sheet (#185, JSB 19 Oct 2026). LagosCoMiS has no API, so staff file each paid
// affidavit by hand. This sheet puts everything they need in one place and records what they did.
// Field order follows the order form until Sheriff's form mapping (#184) sets the portal order.

interface Props {
  apiUrl: string;
  orderId: string;
  orderRef: string;
  orderType: string;
  formData: Record<string, string>;
  getAuthHeader: () => Promise<Record<string, string>>;
}

interface Filing {
  court_form: string | null;
  court_division: string | null;
  filing_id: string | null;
  filed_at: string | null;
  commissioned_at: string | null;
  video_requested: boolean;
  notes: string | null;
  updated_at?: string;
}

const EMPTY: Filing = {
  court_form: null,
  court_division: null,
  filing_id: null,
  filed_at: null,
  commissioned_at: null,
  video_requested: false,
  notes: null,
};

// ISO string <-> value for <input type="datetime-local"> in Lagos time (WAT, UTC+1, no DST).
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 60 * 60 * 1000);
  return d.toISOString().slice(0, 16);
}
function fromLocalInput(value: string) {
  return value ? new Date(`${value}:00+01:00`).toISOString() : null;
}

export default function FilingSheet({ apiUrl, orderId, orderRef, orderType, formData, getAuthHeader }: Props) {
  const mapping = courtFormFor(orderType);
  const [filing, setFiling] = useState<Filing>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${apiUrl}/admin/orders/${orderId}/filing`, { headers: await getAuthHeader() });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.filing) setFiling({ ...EMPTY, ...data.filing });
      else if (mapping.form) setFiling((f) => ({ ...f, court_form: mapping.form }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function copy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${apiUrl}/admin/orders/${orderId}/filing`, {
        method: "PUT",
        headers: { ...(await getAuthHeader()), "Content-Type": "application/json" },
        body: JSON.stringify({ court_route: "lagoscomis", ...filing }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || "Could not save the filing record.");
        return;
      }
      setFiling({ ...EMPTY, ...data.filing });
      setMessage("Filing record saved.");
    } catch {
      setMessage("Could not save the filing record.");
    } finally {
      setSaving(false);
    }
  }

  async function prepareImage(file: File | undefined, kind: "photo" | "signature") {
    if (!file) return;
    setImageError(null);
    try {
      const blob = await toCourtJpeg(file);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${orderRef}-${kind}.jpg`; // never the customer's name
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Could not convert the image.");
    }
  }

  const input = "w-full rounded-input border-4 border-brand-black px-3 py-2 text-sm outline-none";
  const label = "mb-1 block text-xs font-semibold uppercase tracking-wide";

  return (
    <div className="mt-6 rounded-card border-2 border-brand-black">
      <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
        Filing sheet (LagosCoMiS)
      </div>
      <div className="flex flex-col gap-5 p-4 text-sm">
        <div>
          <p>
            <span className="text-brand-gray">Court form: </span>
            {mapping.form ? (
              <span className="font-semibold">{mapping.form}</span>
            ) : (
              <span className="font-semibold text-brand-error">Not mapped yet. Ask Sheriff before filing (#184).</span>
            )}
          </p>
          <p className="mt-1">
            <span className="text-brand-gray">Identification video: </span>
            <span className="font-semibold">
              {mapping.needsVideo === null ? "Not confirmed yet (#184)" : mapping.needsVideo ? "Needed. Contact the customer." : "Not needed"}
            </span>
          </p>
        </div>

        <div>
          <p className={label}>Details to enter on the portal</p>
          <div className="flex flex-col divide-y divide-brand-gray-light">
            {Object.entries(formData || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-3 py-1.5">
                <span className="text-brand-gray">{key.replace(/_/g, " ")}</span>
                <span className="flex items-center gap-2 text-right font-semibold">
                  {value || "—"}
                  {value && (
                    <button
                      type="button"
                      onClick={() => copy(key, value)}
                      className="rounded-card border-2 border-brand-black px-2 py-0.5 text-xs font-bold uppercase"
                    >
                      {copied === key ? "Copied" : "Copy"}
                    </button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className={label}>Photo and e-signature for the portal (JPEG, 100 KB or less)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-brand-gray">
              Passport photo
              <input type="file" accept="image/*" onChange={(e) => prepareImage(e.target.files?.[0], "photo")} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-brand-gray">
              E-signature
              <input type="file" accept="image/*" onChange={(e) => prepareImage(e.target.files?.[0], "signature")} />
            </label>
          </div>
          <p className="mt-1 text-xs text-brand-gray">
            The converted file downloads to this computer, named by order number. Delete it once filed.
          </p>
          {imageError && <p className="mt-1 text-xs text-brand-error">{imageError}</p>}
        </div>

        <div>
          <p className={label}>Filing record</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>Court form used</label>
              <input className={input} value={filing.court_form || ""} onChange={(e) => setFiling({ ...filing, court_form: e.target.value })} />
            </div>
            <div>
              <label className={label}>Court division</label>
              <input
                className={input}
                placeholder="e.g. Ikeja Magisterial District"
                value={filing.court_division || ""}
                onChange={(e) => setFiling({ ...filing, court_division: e.target.value })}
              />
            </div>
            <div>
              <label className={label}>LagosCoMiS filing ID</label>
              <input className={input} value={filing.filing_id || ""} onChange={(e) => setFiling({ ...filing, filing_id: e.target.value })} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filing.video_requested}
                  onChange={(e) => setFiling({ ...filing, video_requested: e.target.checked })}
                  className="h-4 w-4 accent-brand-black"
                />
                Identification video requested from customer
              </label>
            </div>
            <div>
              <label className={label}>Filed (Lagos time)</label>
              <input
                type="datetime-local"
                className={input}
                value={toLocalInput(filing.filed_at)}
                onChange={(e) => setFiling({ ...filing, filed_at: fromLocalInput(e.target.value) })}
              />
            </div>
            <div>
              <label className={label}>Commissioned (Lagos time)</label>
              <input
                type="datetime-local"
                className={input}
                value={toLocalInput(filing.commissioned_at)}
                onChange={(e) => setFiling({ ...filing, commissioned_at: fromLocalInput(e.target.value) })}
              />
            </div>
          </div>
          <div className="mt-3">
            <label className={label}>Notes</label>
            <textarea
              className={input}
              rows={2}
              maxLength={2000}
              value={filing.notes || ""}
              onChange={(e) => setFiling({ ...filing, notes: e.target.value })}
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-card bg-brand-black px-4 py-2.5 text-sm font-bold text-brand-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save filing record"}
            </button>
            {message && <span className="text-sm text-brand-gray">{message}</span>}
          </div>
        </div>

        <p className="text-xs text-brand-gray">
          Before delivering: save the final affidavit with browser headers and footers turned off. The upload below
          rejects files that still show LagosCoMiS addresses or session details, and renames the file to the order
          number.
        </p>
      </div>
    </div>
  );
}
