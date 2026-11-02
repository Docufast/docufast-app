"use client";

// Cloudflare Turnstile widget (#219 help chat, #226 sign-in, sign-up and password reset).
// Renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set. Tokens are single use:
// remount it (change its key) after every attempt.
// Usage in AskQuestionForm.tsx:
//   const [turnstileToken, setTurnstileToken] = useState("");
//   <TurnstileWidget onToken={setTurnstileToken} />   (just above the submit button)
//   body: JSON.stringify({ ..., turnstileToken })
// Needs NEXT_PUBLIC_TURNSTILE_SITE_KEY, and CSP script-src and frame-src to allow
// https://challenges.cloudflare.com (use the page's CSP nonce on the script if scripts are nonce-locked).

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export default function TurnstileWidget({ onToken, nonce }: { onToken: (token: string) => void; nonce?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !ref.current) return;
    let widgetId: string | undefined;
    const render = () => {
      if (!window.turnstile || !ref.current) return;
      widgetId = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        appearance: "interaction-only",
        callback: (t: string) => onToken(t),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    };
    if (window.turnstile) render();
    else {
      let s = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      if (!s) {
        s = document.createElement("script");
        s.src = SCRIPT_SRC;
        s.async = true;
        if (nonce) s.nonce = nonce;
        document.head.appendChild(s);
      }
      s.addEventListener("load", render, { once: true });
    }
    return () => {
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey, onToken, nonce]);

  if (!siteKey) return null;
  return <div ref={ref} className="mt-1" />;
}
