"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Shown in the nav bar of public pages (Home, Services, category browse
// pages) — reflects whether someone is actually logged in, instead of
// always hardcoding "Sign in" regardless of real session state.
export default function AuthNavLink() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
    });
  }, []);

  if (loggedIn === null) {
    return <span className="ml-auto text-sm font-bold uppercase tracking-wide text-brand-gray">···</span>;
  }

  return loggedIn ? (
    <Link href="/home" className="ml-auto text-sm font-bold uppercase tracking-wide">
      My account
    </Link>
  ) : (
    <Link href="/sign-in" className="ml-auto text-sm font-bold uppercase tracking-wide">
      Sign in
    </Link>
  );
}
