"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Two-factor is compulsory on every account. In the signed-in areas, a session must have
// completed the second step: no authenticator yet means set one up; an authenticator but no
// code entered this session means sign in again. Public pages are not guarded.
const PROTECTED_PREFIXES = ["/home", "/account", "/vault", "/orders", "/admin", "/calendar"];
const SETUP_PATH = "/account/security/2fa";

export default function RequireTwoFactor() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname === SETUP_PATH) return;
    const guarded = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
    if (!guarded) return;

    let cancelled = false;
    async function check() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return; // signed-out visitors are handled by each page

      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (cancelled || !aal) return;

      if (aal.nextLevel === "aal1") {
        window.location.href = SETUP_PATH;
        return;
      }
      if (aal.currentLevel !== "aal2") {
        await supabase.auth.signOut();
        window.location.href = "/sign-in?redirect=" + encodeURIComponent(pathname);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
