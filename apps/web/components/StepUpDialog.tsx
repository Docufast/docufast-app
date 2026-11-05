"use client";
// Second-step dialog for customers (#220). Open it when an API call returns 403 with code
// "STEP_UP_REQUIRED", or use fetchWithStepUp(), which opens it and retries the call once.
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Waiter = (ok: boolean) => void;

// The step-up routes read the browser's access token from the Authorization header (like the admin routes).
async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}
let openDialog: ((w: Waiter) => void) | null = null;

/** fetch() that asks for the second step when needed, then retries once. */
export async function fetchWithStepUp(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status !== 403) return res;
  const body = await res.clone().json().catch(() => null);
  if (body?.code !== "STEP_UP_REQUIRED" || !openDialog) return res;
  const ok = await new Promise<boolean>((resolve) => openDialog!(resolve));
  return ok ? fetch(input, init) : res;
}

export default function StepUpDialog() {
  const [waiter, setWaiter] = useState<Waiter | null>(null);
  const [mode, setMode] = useState<"choose" | "email" | "app">("choose");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [hasApp, setHasApp] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    openDialog = (w) => { setWaiter(() => w); setMode("choose"); setCode(""); setMsg(""); };
    return () => { openDialog = null; };
  }, []);
  useEffect(() => {
    if (!waiter) return;
    supabase.auth.mfa.listFactors().then(({ data }) => setHasApp(!!data?.totp?.some((f) => f.status === "verified")));
  }, [waiter]);
  useEffect(() => { if (mode !== "choose") input.current?.focus(); }, [mode]);

  if (!waiter) return null;
  const close = (ok: boolean) => { waiter(ok); setWaiter(null); };

  async function sendEmail() {
    setBusy(true); setMsg("");
    const r = await fetch("/api/step-up/email/start", { method: "POST", headers: await authHeaders() });
    const b = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) { setMode("email"); setMsg("We sent a 6-digit code to your email. It expires in 10 minutes."); }
    else setMsg(b.error ?? "We could not send a code.");
  }

  async function verify() {
    setBusy(true); setMsg("");
    try {
      if (mode === "email") {
        const r = await fetch("/api/step-up/email/verify", { method: "POST", headers: await authHeaders(), body: JSON.stringify({ code }) });
        const b = await r.json().catch(() => ({}));
        if (!r.ok) { setMsg(b.error ?? "That code did not work."); return; }
      } else {
        const { data } = await supabase.auth.mfa.listFactors();
        const factor = data?.totp?.find((f) => f.status === "verified");
        if (!factor) { setMsg("No authenticator app is set up on this account."); return; }
        const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code.replace(/\s/g, "") });
        if (error) { setMsg("That code did not work. Check the time on your phone and try again."); return; }
        await supabase.auth.refreshSession();
        const r = await fetch("/api/step-up/totp/confirm", { method: "POST", headers: await authHeaders() });
        if (!r.ok) { setMsg("Please try again."); return; }
      }
      close(true);
    } finally { setBusy(false); }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="stepup-title" className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-card bg-brand-white p-5 text-brand-black shadow-xl">
        <h2 id="stepup-title" className="text-lg font-extrabold">Confirm it is you</h2>
        <p className="mt-1 text-sm">To keep your documents safe, we check it is you before you open them or change your account. You will not be asked again on this device for 12 hours.</p>

        {mode === "choose" && (
          <div className="mt-4 flex flex-col gap-2">
            <button disabled={busy} onClick={sendEmail} className="h-12 rounded-card bg-brand-yellow font-bold">Email me a code</button>
            {hasApp && <button disabled={busy} onClick={() => setMode("app")} className="h-12 rounded-card border-2 border-brand-black font-bold">Use my authenticator app</button>}
          </div>
        )}

        {mode !== "choose" && (
          <form className="mt-4 flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); verify(); }}>
            <label htmlFor="stepup-code" className="text-sm font-semibold">{mode === "email" ? "Code from the email" : "Code from your authenticator app"}</label>
            <input id="stepup-code" ref={input} inputMode="numeric" autoComplete="one-time-code" maxLength={7} value={code}
              onChange={(e) => setCode(e.target.value)} className="h-12 rounded-input border-2 border-brand-black px-3 text-lg tracking-widest" />
            <button disabled={busy || code.replace(/\D/g, "").length !== 6} className="h-12 rounded-card bg-brand-yellow font-bold">Confirm</button>
            {mode === "email" && <button type="button" disabled={busy} onClick={sendEmail} className="text-xs underline">Send a new code</button>}
          </form>
        )}

        <p aria-live="polite" className="mt-2 min-h-[1.25rem] text-xs">{msg}</p>
        <p className="text-[11px] text-brand-gray">Docufast will never ask you for this code by phone, SMS, email or WhatsApp.</p>
        <button onClick={() => close(false)} className="mt-3 text-sm underline">Not now</button>
      </div>
    </div>
  );
}
