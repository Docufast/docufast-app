"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

// Signs the user out after 10 minutes with no interaction anywhere in the
// app. Only takes effect while a session actually exists, so it's harmless
// on public pages before sign-in.
export default function InactivityLogout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function handleTimeout() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.auth.signOut();
      window.location.href = "/sign-in";
    }

    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleTimeout, TIMEOUT_MS);
    }

    resetTimer();
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);

  return null;
}
