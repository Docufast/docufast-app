"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getAffidavitType } from "@/lib/affidavitTypes";
import FileUpload from "@/components/ui/FileUpload";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const STATUS_OPTIONS = [
  "quote_pending",
  "quote_sent",
  "paid",
  "sent_to_partner",
  "in_processing",
  "qa_review",
  "ready_for_delivery",
  "delivered",
  "cancelled",
  "name_rejected",
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
  form_data: Record<string, string>;
  created_at: string;
  user_id: string;
}

interface DocumentRow {
  id: string;
  file_name: string;
  status: string;
  delivered_at: string | null;
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

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [statusDraft, setStatusDraft] = useState("");
  const [priceDraft, setPriceDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [deliverFileName, setDeliverFileName] = useState<string | null>(null);
  const [deliverKey, setDeliverKey] = useState<string | null>(null);
  const [delivering, setDelivering] = useState(false);
  const [deliverError, setDeliverError] = useState<string | null>(null);

  async function getAuthHeader() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return { Authorization: `Bearer ${session?.access_token}` };
  }

  async function loadOrder() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/sign-in";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "founder") {
      window.location.href = "/home";
      return;
    }

    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/admin/orders/${orderId}`, { headers });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load order.");
        setLoading(false);
        return;
      }
      setOrder(data.order);
      setDocuments(data.documents);
      setStatusDraft(data.order.status);
      setPriceDraft(data.order.quote_amount != null ? String(data.order.quote_amount) : "");
    } catch (err) {
      setError("Failed to load order.");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function handleSave() {
    setSaving(true);
    setSaveMessage(null);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusDraft,
          quote_amount: priceDraft === "" ? null : Number(priceDraft),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveMessage(data.error || "Failed to save.");
        return;
      }
      setOrder(data.order);
      setSaveMessage("Saved.");
    } catch (err) {
      setSaveMessage("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeliver() {
    if (!deliverKey || !deliverFileName) return;
    setDelivering(true);
    setDeliverError(null);
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/admin/orders/${orderId}/deliver`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ r2_key: deliverKey, file_name: deliverFileName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeliverError(data.error || "Failed to deliver document.");
        return;
      }
      setDocuments((prev) => [data.document, ...prev]);
      setDeliverKey(null);
      setDeliverFileName(null);
      setStatusDraft("delivered");
      await loadOrder();
    } catch (err) {
      setDeliverError("Failed to deliver document.");
    } finally {
      setDelivering(false);
    }
  }

  async function handleDownload(documentId: string) {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/admin/orders/documents/${documentId}/download`, {
        headers,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to generate download link.");
        return;
      }
      window.open(data.url, "_blank");
    } catch (err) {
      alert("Failed to generate download link.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-brand-gray">Loading…</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-black">
          {error || "Order not found."}
        </h1>
        <Link href="/admin" className="mt-4 inline-block font-bold underline">
          ← Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center gap-6 border-b-4 border-brand-black px-6 py-4 lg:px-12">
        <Link href="/home" className="flex items-center gap-2">
          <Image src="/images/logo-black.png" alt="Docufast" width={26} height={26} />
          <span className="text-lg font-extrabold tracking-wide text-brand-black">DOCUFAST</span>
        </Link>
        <span className="rounded-card bg-brand-black px-2.5 py-1 text-xs font-bold uppercase text-brand-white">
          Admin Dashboard
        </span>
        <Link href="/admin" className="ml-auto text-sm font-bold uppercase tracking-wide">
          ← Back to dashboard
        </Link>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-8 lg:px-12">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-black">
            {orderTypeLabel(order.service_category, order.order_type)}
          </h1>
          <p className="mt-1 text-sm text-brand-gray">
            {shortRef(order.id)} · Submitted{" "}
            {new Date(order.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Status + Price */}
        <div className="mt-6 rounded-card border-2 border-brand-black">
          <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
            Status & Quote
          </div>
          <div className="flex flex-col gap-4 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value)}
                  className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                  Quoted price (₦)
                </label>
                <input
                  type="number"
                  value={priceDraft}
                  onChange={(e) => setPriceDraft(e.target.value)}
                  placeholder="e.g. 25000"
                  className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-card bg-brand-black px-4 py-2.5 text-sm font-bold text-brand-white disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              {saveMessage && <span className="text-sm text-brand-gray">{saveMessage}</span>}
            </div>
          </div>
        </div>

        {/* Filing details submitted by the customer */}
        <div className="mt-6 rounded-card border-2 border-brand-black">
          <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
            Filing details submitted
          </div>
          <div className="flex flex-col gap-2 p-4 text-sm">
            {Object.entries(order.form_data || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 border-b border-brand-gray-light pb-1">
                <span className="text-brand-gray">{key.replace(/_/g, " ")}</span>
                <span className="text-right font-semibold">{value || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deliver a document */}
        <div className="mt-6 rounded-card border-2 border-brand-black">
          <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
            Deliver final document
          </div>
          <div className="flex flex-col gap-3 p-4">
            <FileUpload
              label="Click or drag the finished document here"
              onUploadComplete={(key) => setDeliverKey(key)}
              onFileSelect={(file) => setDeliverFileName(file?.name || null)}
            />
            {deliverError && <p className="text-sm text-brand-error">{deliverError}</p>}
            <button
              onClick={handleDeliver}
              disabled={!deliverKey || delivering}
              className="self-start rounded-card bg-brand-yellow px-4 py-2.5 text-sm font-bold text-brand-black disabled:opacity-50"
            >
              {delivering ? "Delivering…" : "Deliver to customer"}
            </button>
          </div>
        </div>

        {/* Delivered documents */}
        <div className="mt-6 rounded-card border-2 border-brand-black">
          <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
            Delivered documents
          </div>
          <div className="p-4">
            {documents.length === 0 ? (
              <p className="text-sm text-brand-gray">Nothing delivered yet.</p>
            ) : (
              <div className="flex flex-col divide-y-2 divide-brand-black">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm font-semibold">{doc.file_name}</div>
                      <div className="text-xs text-brand-gray">
                        {doc.delivered_at
                          ? `Delivered ${new Date(doc.delivered_at).toLocaleDateString("en-GB")}`
                          : "Pending"}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(doc.id)}
                      className="rounded-card border-2 border-brand-black px-3 py-1.5 text-xs font-bold uppercase"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
