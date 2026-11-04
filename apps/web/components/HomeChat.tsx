"use client";

// components/HomeChat.tsx
// The home screen chat (Blueprint A1 mobile, D1 desktop). JSB, 3 Nov 2026: part of the beta.
// Works before its script loads: the quick replies are plain links and the form falls back to
// /services. Answers come from lib/homeChat.ts in the browser, at once, and nothing typed here is
// sent anywhere. The "Ask us a question" form appears only when the chat cannot match a service.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
// Loaded only when the chat cannot match a question, to keep the home page light (Playbook 18.2).
const AskQuestionForm = dynamic(() => import("@/components/ui/AskQuestionForm"), { ssr: false });
import { LANGUAGES, QUICK_REPLIES, enabledLanguages, greeting, ui, type LangCode } from "@/lib/homeChatText";
import type { ChatReply, PriceNotes } from "@/lib/homeChat";

// The matching rules load on first use (test report D11, 4 Nov 2026: homepage JavaScript budget),
// and start loading as soon as the customer focuses the box or taps a quick reply.
let rulesPromise: Promise<typeof import("@/lib/homeChat")> | null = null;
const loadRules = () => (rulesPromise ??= import("@/lib/homeChat"));

type Turn = { from: "me"; text: string } | { from: "bot"; reply: ChatReply; ai?: boolean; pending?: boolean };

// AI fallback (patch 0026): only for questions the fixed rules cannot match, only when switched on.
const AI_ON = process.env.NEXT_PUBLIC_CHAT_AI === "on";

const LANG_KEY = "docufast.lang";
const MAX_INPUT = 200;

export default function HomeChat({ prices = {} }: { prices?: PriceNotes }) {
  const enabled = enabledLanguages();
  const [lang, setLang] = useState<LangCode>("en");
  const [hello, setHello] = useState("Hello");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHello(greeting());
    try {
      const saved = window.localStorage.getItem(LANG_KEY) as LangCode | null;
      if (saved && enabled.includes(saved)) setLang(saved);
    } catch { /* storage blocked: English */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [turns]);

  function chooseLang(code: LangCode) {
    if (!enabled.includes(code)) return;
    setLang(code);
    try { window.localStorage.setItem(LANG_KEY, code); } catch { /* fine */ }
  }

  async function send(query: string) {
    const q = query.trim().slice(0, MAX_INPUT);
    if (!q) return;
    let ruled: ChatReply;
    try {
      ruled = (await loadRules()).replyTo(q, prices);
    } catch {
      rulesPromise = null; // a failed download can be retried on the next message
      ruled = { intent: "unknown", text: "Sorry, the chat could not load. Check your connection, or see all our services.", actions: [{ label: "See all services", href: "/services" }], ask: false, whatsapp: true };
    }
    setText("");
    if (!AI_ON || ruled.intent !== "unknown") {
      setTurns((t) => [...t, { from: "me", text: q }, { from: "bot", reply: ruled }]);
      return;
    }
    const thinking: ChatReply = { intent: "pending", text: "Let me check that for you...", actions: [] };
    setTurns((t) => [...t, { from: "me", text: q }, { from: "bot", reply: thinking, pending: true }]);
    const finish = (reply: ChatReply, ai = false) =>
      setTurns((t) => {
        const copy = [...t];
        const i = copy.map((x) => x.from === "bot" && x.pending).lastIndexOf(true);
        if (i >= 0) copy[i] = { from: "bot", reply, ai };
        return copy;
      });
    fetch("/api/chat-assist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q }) })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.ok && Array.isArray(d.actions) && d.actions.length) {
          finish({ intent: "ai", text: String(d.reply), actions: d.actions, ask: true, whatsapp: false }, true);
        } else finish(ruled);
      })
      .catch(() => finish(ruled));
  }

  return (
    <section aria-label="Docufast chat" className="flex w-full flex-col gap-3 rounded-[16px] bg-brand-white p-4 text-brand-black sm:p-5">
      <div role="group" aria-label="Language" className="flex flex-wrap gap-1.5">
        {LANGUAGES.map((l) => {
          const on = enabled.includes(l.code);
          const active = lang === l.code;
          return (
            <button
              key={l.code}
              type="button"
              aria-pressed={active}
              disabled={!on}
              title={on ? l.label : `${l.label}: ${ui(lang, "soon")}`}
              onClick={() => chooseLang(l.code)}
              className={`h-8 rounded-full px-3 text-xs font-semibold ${
                active ? "bg-brand-black text-brand-white" : on ? "border border-brand-gray-light" : "border border-dashed border-brand-gray-light text-brand-gray"
              }`}
            >
              {l.label}{on ? "" : ` (${ui(lang, "soon")})`}
            </button>
          );
        })}
      </div>

      <div ref={listRef} className="flex max-h-[420px] flex-col gap-2.5 overflow-y-auto" aria-live="polite">
        <p className="max-w-[90%] self-start rounded-[14px_14px_14px_4px] bg-[#F2F2EE] px-3.5 py-2.5 text-[15px]">
          {hello}. {ui(lang, "ask_prompt")}
        </p>

        {turns.length === 0 && (
          <div className="grid grid-cols-2 gap-2">
            {QUICK_REPLIES.map((q) =>
              q.query ? (
                <a
                  key={q.label}
                  href={q.href}
                  onClick={(e) => { e.preventDefault(); void send(q.query); }}
                  className="flex min-h-[60px] flex-col justify-between rounded-[12px] border border-brand-gray-light px-3 py-2 hover:border-brand-black"
                >
                  <span className="text-sm font-semibold">{q.label}</span>
                  <span className="text-xs text-brand-gray">{q.hint}</span>
                </a>
              ) : (
                <Link key={q.label} href={q.href} className="flex min-h-[60px] flex-col justify-between rounded-[12px] border border-brand-gray-light px-3 py-2 hover:border-brand-black">
                  <span className="text-sm font-semibold">{q.label}</span>
                  <span className="text-xs text-brand-gray">{q.hint}</span>
                </Link>
              )
            )}
          </div>
        )}

        {turns.map((t, i) =>
          t.from === "me" ? (
            <p key={i} className="max-w-[85%] self-end rounded-[14px_14px_4px_14px] bg-brand-yellow px-3.5 py-2.5 text-[15px]">
              <span className="sr-only">{ui(lang, "you")}: </span>{t.text}
            </p>
          ) : (
            <div key={i} className="flex max-w-[95%] flex-col gap-2 self-start">
              <p className="rounded-[14px_14px_14px_4px] bg-[#F2F2EE] px-3.5 py-2.5 text-[15px]">
                <span className="sr-only">{ui(lang, "docufast")}: </span>{t.reply.text}
              </p>
              {t.ai && (
                <p className="text-xs text-brand-gray">Suggested by our assistant. Check the service details and price before you order.</p>
              )}
              {t.reply.actions.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {t.reply.actions.map((a) => (
                    <Link key={a.href + a.label} href={a.href} className="flex items-center justify-between gap-3 rounded-[10px] border-2 border-brand-black px-3 py-2 text-sm font-semibold hover:bg-brand-yellow/10">
                      <span>{a.label}</span>
                      <span className="shrink-0 text-xs font-normal text-brand-gray">{a.note ? `${a.note} · ` : ""}{ui(lang, "open")} →</span>
                    </Link>
                  ))}
                </div>
              )}
              {t.reply.whatsapp && (
                <a href="https://wa.me/2349054951918" className="self-start rounded-[10px] bg-brand-black px-3 py-2 text-sm font-semibold text-brand-white">
                  {ui(lang, "whatsapp")} →
                </a>
              )}
              {t.reply.ask && i === turns.length - 1 && (
                <div className="rounded-[12px] border border-brand-gray-light p-3"><AskQuestionForm /></div>
              )}
            </div>
          )
        )}
      </div>

      <form
        action="/services"
        onSubmit={(e) => { e.preventDefault(); void send(text); inputRef.current?.focus(); }}
        className="flex items-center gap-2 border-t border-[#E4E4E0] pt-3"
      >
        <label htmlFor="home-chat-input" className="sr-only">{ui(lang, "placeholder")}</label>
        <input
          ref={inputRef}
          id="home-chat-input"
          name="q"
          value={text}
          maxLength={MAX_INPUT}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => { loadRules().catch(() => { rulesPromise = null; }); }}
          placeholder={ui(lang, "placeholder")}
          autoComplete="off"
          className="h-12 min-w-0 flex-1 rounded-full border border-[#CFCFCA] px-4 text-[15px] outline-none focus:border-brand-black"
        />
        <button type="submit" aria-label={ui(lang, "send")} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-brand-black">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-brand-gray">{ui(lang, "privacy")}</p>
        {turns.length > 0 && (
          <button type="button" onClick={() => setTurns([])} className="text-xs font-semibold underline">{ui(lang, "start_again")}</button>
        )}
      </div>
    </section>
  );
}
