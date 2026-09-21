"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/ui/Sidebar";
import TopBar from "@/components/ui/TopBar";
import { supabase } from "@/lib/supabase";
import { decryptDocumentForRecipient, fromBase64 } from "@/lib/vaultCrypto";
import { getUnlockedPrivateKey } from "@/lib/vaultSession";
import { ShieldCheck, Clock, RefreshCw, FolderOpen, Download } from "lucide-react";
import AppFooter from "@/components/ui/AppFooter";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface Document {
  id: string;
  file_name: string | null;
  delivered_at: string;
  expires_at: string | null;
}

export default function VaultPage() {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/sign-in";
        return;
      }
      setUserId(user.id);
      setFullName(user.user_metadata?.full_name || "Your account");

      const { data } = await supabase
        .from("documents")
        .select("id, file_name, delivered_at, expires_at")
        .order("delivered_at", { ascending: false });

      if (data) setDocuments(data);
      setLoading(false);
    }
    loadData();
  }, []);

  async function handleDownload(documentId: string, fileName: string | null) {
    if (!userId) return;
    setDownloadingId(documentId);
    setDownloadError(null);
    try {
      const privateKey = await getUnlockedPrivateKey(userId);
      if (!privateKey) {
        setDownloadError(
          "Your vault is locked. Please sign out and sign back in with your password to unlock it."
        );
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`${API_URL}/documents/${documentId}/download`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setDownloadError(data.error || "Failed to generate download link.");
        return;
      }

      const fileRes = await fetch(data.url);
      const encryptedBytes = await fileRes.arrayBuffer();

      const decryptedBytes = await decryptDocumentForRecipient(
        encryptedBytes,
        data.encryptionIv,
        data.senderEphemeralPublicKey,
        privateKey
      );

      const blob = new Blob([decryptedBytes]);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || data.fileName || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setDownloadError("Failed to decrypt this document. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-brand-gray">Loading…</p>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <Sidebar active="Vault" />

      <div>
        <TopBar userName={fullName} />
        <div className="px-6 py-6 lg:px-12 lg:py-8">
          <div className="flex items-center justify-between overflow-hidden rounded-card border-4border-brand-black bg-gradient-to-r from-brand-yellow/20 to-brand-yellow/5 px-6 py-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">
                Vault
              </div>
              <h1 className="text-3xl font-extrabold text-brand-black">Your document vault</h1>
              <p className="mt-1 text-sm text-brand-gray">
                Every completed document, encrypted and in one place.
              </p>
            </div>
            <div className="hidden items-center gap-4 lg:flex">
              <div className="text-right">
                <p className="text-lg font-bold text-brand-black">Secure by</p>
                <p className="text-lg font-bold text-brand-black">design.</p>
                <span className="mt-1 inline-block h-1 w-10 bg-brand-yellow" />
              </div>
              <div className="relative h-24 w-24 shrink-0">
                <Image src="/images/hero-documents.png" alt="" fill className="object-contain" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-card border-4 border-brand-black bg-brand-yellow/10 p-5">
            <ShieldCheck size={22} className="mt-0.5 shrink-0 text-brand-black" />
            <p className="text-sm text-brand-black">
              <span className="font-bold">Your documents are encrypted end-to-end.</span>{" "}
              Docufast staff cannot read your delivered documents — they're decrypted only in
              your browser, using a key only you hold. Every document you receive carries a
              QR code — so any institution can independently verify it's genuine.
            </p>
          </div>

          {downloadError && (
            <div className="mt-4 rounded-card border-2 border-brand-error bg-brand-error/5 px-4 py-3 text-sm text-brand-error">
              {downloadError}
            </div>
          )}

          {documents.length === 0 ? (
            <div className="mt-6 rounded-card border-2 border-dashed border-brand-gray-light p-10text-center">
              <FolderOpen size={32} className="mx-auto text-brand-gray" />
              <p className="mt-2 font-bold text-brand-black">Your vault is empty.</p>
              <p className="mt-1 text-sm text-brand-gray">
                Completed documents from your orders will appear here, ready to view or
                download.
              </p>
              <Link
                href="/services/affidavits"
                className="mt-4 inline-block rounded-card bg-brand-black px-5 py-3 text-sm font-bold text-brand-white"
              >
                Browse services →
              </Link>
            </div>
          ) : (
            <div className="mt-6 divide-y-2 divide-brand-black rounded-card border-2 border-brand-black bg-white">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 px-4 py-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-yellow/20">
                    <FolderOpen size={20} className="text-brand-black" />
                  </div>
                  <div className="mr-auto">
                    <div className="font-bold text-brand-black">{doc.file_name || "Document"}</div>
                    <div className="text-xs text-brand-gray">
                      Delivered{" "}
                      {new Date(doc.delivered_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(doc.id, doc.file_name)}
                    disabled={downloadingId === doc.id}
                    className="flex items-center gap-2 rounded-card bg-brand-black px-4 py-2.5 text-sm font-bold text-brand-white disabled:opacity-50"
                  >
                    <Download size={16} />
                    {downloadingId === doc.id ? "Decrypting…" : "Download"}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-card border-2 border-brand-black bg-white p-5">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-brand-black" />
                <h2 className="font-bold text-brand-black">Free access period</h2>
              </div>
              <p className="mt-2 text-sm text-brand-gray">
                Every delivered document stays free to view and download in your vault for
                <span className="font-bold text-brand-black"> 1 month</span> after delivery.
              </p>
            </div>
            <div className="rounded-card border-2 border-brand-black bg-white p-5">
              <div className="flex items-center gap-2">
                <RefreshCw size={20} className="text-brand-black" />
                <h2 className="font-bold text-brand-black">Permanent storage</h2>
              </div>
              <p className="mt-2 text-sm text-brand-gray">
                After the free period, an annual subscription keeps your documents stored
                permanently and includes ongoing compliance reminders for your entities.
              </p>
            </div>
          </div>
          <AppFooter />
        </div>
      </div>
    </main>
  );
}
