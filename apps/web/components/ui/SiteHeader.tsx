"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Blueprint header (#119). Only links to pages that exist today; How it works,
// Guides and Blog are added when those pages ship. The language pill is left out
// until translations exist.
const NAV = [
  { href: "/services", label: "Services" },
  { href: "/verify", label: "Verify a document" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

const outlined =
  "inline-flex h-9 items-center rounded-[10px] border border-[#BFBFBF] bg-brand-white px-3.5 text-sm font-semibold text-brand-black hover:border-brand-black";
const gold =
  "inline-flex h-9 items-center rounded-[10px] bg-brand-yellow px-3.5 text-sm font-semibold text-brand-black hover:bg-brand-yellow-hover";

export default function SiteHeader() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const accountHref = loggedIn ? "/home" : "/sign-in";
  const accountLabel = loggedIn ? "My account" : "Sign in";

  return (
    <header className="border-b border-brand-gray-light bg-brand-white">
      <div className="flex flex-wrap items-center gap-x-7 gap-y-3 px-4 py-4 md:px-12">
        <Link href={loggedIn ? "/home" : "/"} className="flex items-center gap-2.5">
          <Image src="/images/logo-black.png" alt="" width={30} height={30} />
          <span className="text-lg font-bold text-brand-black">Docufast</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive(item.href)
                  ? "text-sm font-semibold text-brand-black underline decoration-brand-yellow decoration-2 underline-offset-[6px]"
                  : "text-sm text-[#3D3D3D] hover:text-brand-black"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <Link
            href={accountHref}
            className={`${outlined} hidden sm:inline-flex ${loggedIn === null ? "invisible" : ""}`}
          >
            {accountLabel}
          </Link>
          <Link href="/services" className={gold}>
            Get your price
          </Link>
          <details className="relative lg:hidden">
            <summary className={`${outlined} cursor-pointer list-none`}>Menu</summary>
            <div className="absolute right-0 z-40 mt-2 flex w-56 flex-col rounded-[10px] border border-brand-gray-light bg-brand-white p-2 shadow-lg">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm text-brand-black hover:bg-brand-offwhite">
                  {item.label}
                </Link>
              ))}
              <Link href={accountHref} className="rounded-md px-3 py-2 text-sm font-semibold text-brand-black hover:bg-brand-offwhite sm:hidden">
                {accountLabel}
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
