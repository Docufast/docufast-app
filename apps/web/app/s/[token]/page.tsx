"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { decryptShared } from "@/lib/vaultCrypto";

// Opens a share link (Terms section 10). The key is the part of the link after "#": the browser
// keeps it here and never sends it to Docufast. The file is decrypted on this device only.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function SharedDocumentPage() {
  const params = useParams();
  const token = params.token as string;
  const [key, setKey] = useState<string | null>(null);
  const [state, setState] = useState<"ready" | "opening" | "done" | "error">("ready");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fragment = window.location.hash.replace(/^#/, "");
    setKey(fragment || null);
  }, []);

  async function openDocument() {
    if (!key) return;
    setState("opening");
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/share/${encodeURIComponent(token)}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setMessage(data.error || "This link could not be opened.");
        return;
      }
      const fileRes = await fetch(data.url);
      if (!fileRes.ok) throw new Error("download");
      const bytes = await decryptShared(await fileRes.arrayBuffer(), data.iv, key);

      const blobUrl = URL.createObjectURL(new Blob([bytes]));
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = data.fileName || "document";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      setState("done");
    } catch {
      setState("error");
      setMessage("This document could not be opened. Check that you copied the whole link, including the part after #.");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <div className="rounded-card border-4 border-brand-black bg-white p-8">
        <div className="text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">Docufast</div>
        <h1 className="mt-1 text-2xl font-extrabold text-brand-black">A document has been shared with you</h1>
        <p className="mt-3 text-sm text-brand-gray">
          It opens on this device only. The person who shared it can see when it was opened, and the link stops
          working when it expires or they cancel it.
        </p>

        {key === null ? (
          <p className="mt-6 rounded-card border-2 border-brand-error bg-brand-error/5 px-4 py-3 text-sm text-brand-error">
            This link is incomplete. Ask the person who shared it to send the whole link again.
          </p>
        ) : (
          <button
            type="button"
            onClick={openDocument}
            disabled={state === "opening"}
            className="mt-6 w-full rounded-card bg-brand-black px-4 py-4 text-base font-bold text-brand-white disabled:opacity-50"
          >
            {state === "opening" ? "Opening…" : state === "done" ? "Download again" : "Open document"}
          </button>
        )}

        {state === "done" && (
          <p className="mt-3 text-sm text-brand-success">Your download has started.</p>
        )}
        {message && <p className="mt-3 text-sm text-brand-error">{message}</p>}

        <p className="mt-6 text-xs text-brand-gray">
          Documents Docufast delivers carry a QR code and a reference. To check one is genuine, go to{" "}
          <Link href="/verify" className="font-bold underline">
            docufast.ng/verify
          </Link>
          .
        </p>
      </div>
      <p className="mt-6 text-center text-xs text-brand-gray">
        Docufast Integrated Services Ltd, RC 1893484. NDPC registered (NDPC/DCP/07770).
      </p>
    </main>
  );
}
