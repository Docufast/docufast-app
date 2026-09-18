"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

// The Docufast logo + wordmark used in page headers. Goes to the signed-in
// dashboard ("/home") if the user is logged in, or the public landing page
// ("/") if not — instead of always hardcoding "/".
export default function HomeLink() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
    });
  }, []);

  return (
    <Link href={loggedIn ? "/home" : "/"} className="flex items-center gap-2">
      <Image src="/images/logo-black.png" alt="Docufast" width={28} height={28} />
      <span className="text-xl font-extrabold tracking-wide text-brand-black">DOCUFAST</span>
    </Link>
  );
}
