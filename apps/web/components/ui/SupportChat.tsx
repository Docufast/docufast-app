"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, X, ChevronLeft } from "lucide-react";

type MenuOption = {
  label: string;
  reply?: string;
  linkHref?: string;
  linkLabel?: string;
  subOptions?: MenuOption[];
};

const MAIN_MENU: MenuOption[] = [
  {
    label: "I need an Affidavit",
    reply:
      "We handle 32 types of affidavits — court-ready, with same document standards nationwide.",
    linkHref: "/services/affidavits",
    linkLabel: "Browse affidavit types →",
  },
  {
    label: "I need CAC Registration",
    reply:
      "Business name registration, LTD incorporation, trustee filings and more — we handle the government portal filing end to end.",
    linkHref: "/services/cac",
    linkLabel: "Browse CAC services →",
  },
  {
    label: "I need a Publication",
    reply: "Newspaper notices for name changes, loss declarations and more.",
    linkHref: "/services/publications",
    linkLabel: "Browse publications →",
  },
  {
    label: "I need Notarization",
    reply: "Digital notarization via video session with a licensed Notary Public.",
    linkHref: "/services/notarization",
    linkLabel: "Browse notarization →",
  },
  {
    label: "Pricing & turnaround times",
    reply:
      "Every order is quoted after review — we itemise any government fees so there are no surprises. No payment is taken until you approve the quote. Turnaround varies by service, usually 48 hours to 5 working days.",
  },
  {
    label: "Do I need an account?",
    reply:
      "Yes — a free account lets you track orders, receive quotes, and access your document vault once things are ready. Sign-up takes under a minute.",
    linkHref: "/sign-up",
    linkLabel: "Create an account →",
  },
  {
    label: "Talk to a human",
    reply: "Our team is on WhatsApp, Monday–Saturday, 8am–6pm WAT.",
    linkHref: "https://wa.me/2347089325109",
    linkLabel: "Chat on WhatsApp →",
  },
];

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<MenuOption | null>(null);

  function reset() {
    setSelected(null);
  }

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 overflow-hidden rounded-card border-4 border-brand-black bg-brand-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b-4 border-brand-black bg-brand-black px-4 py-3">
            <div className="flex items-center gap-2">
              {selected && (
                <button
                  onClick={reset}
                  aria-label="Back"
                  className="text-brand-white hover:text-brand-yellow"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              <span className="text-sm font-bold text-brand-white">Docufast Help</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-brand-white hover:text-brand-yellow"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-96 overflow-y-auto p-4">
            {!selected ? (
              <>
                <p className="mb-3 text-sm text-brand-gray">
                  Hi! How can I help you today?
                </p>
                <div className="flex flex-col gap-2">
                  {MAIN_MENU.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => setSelected(option)}
                      className="rounded-card border-2 border-brand-black px-3 py-2 text-left text-sm font-semibold hover:bg-brand-yellow/10"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div>
                <p className="text-sm font-bold text-brand-black">{selected.label}</p>
                <p className="mt-2 text-sm text-brand-gray">{selected.reply}</p>
                {selected.linkHref && (
                  <Link
                    href={selected.linkHref}
                    target={selected.linkHref.startsWith("http") ? "_blank" : undefined}
                    rel={selected.linkHref.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-4 inline-block rounded-card bg-brand-yellow px-4 py-2 text-sm font-bold text-brand-black"
                  >
                    {selected.linkLabel}
                  </Link>
                )}
                <button
                  onClick={reset}
                  className="mt-4 block text-xs font-semibold uppercase tracking-wide text-brand-gray underline"
                >
                  ← Back to menu
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close help chat" : "Open help chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-brand-black bg-brand-yellow text-brand-black shadow-lg hover:bg-brand-yellow-dark"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
