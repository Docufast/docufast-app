"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, FileText, FolderOpen, Calendar, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/orders", label: "Orders", icon: FileText },
  { href: "/vault", label: "Vault", icon: FolderOpen },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/account", label: "Account", icon: User },
];

export default function Sidebar({
  active,
  subItem,
}: {
  active: string;
  subItem?: { label: string; href: string; active: boolean }[];
}) {
  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  }

  return (
    <aside className="relative hidden flex-col overflow-hidden bg-brand-black text-brand-white lg:flex">
      <div className="flex items-center gap-2 border-b border-neutral-700 px-4 pb-4 pt-4">
        <Image src="/images/logo-yellow.png" alt="Docufast" width={22} height={22} />
        <div>
          <div className="text-lg font-extrabold leading-tight tracking-wide">DOCUFAST</div>
          <div className="text-[10px] leading-tight text-neutral-500">DOCUMENTS. SIMPLIFIED.</div>
        </div>
      </div>

      <nav className="relative z-10 mt-3 flex flex-1 flex-col">
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === active;
          const Icon = item.icon;
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold ${
                  isActive
                    ? "border-l-4 border-brand-yellow bg-white/10 text-brand-white"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
              {isActive && subItem && (
                <div className="flex flex-col gap-0.5 py-1 pl-11">
                  {subItem.map((s) => (
                    <Link
                      key={s.label}
                      href={s.href}
                      className={`py-1.5 text-sm ${
                        s.active ? "font-bold text-brand-yellow" : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Decorative watermark — purely visual, no function */}
      <div className="pointer-events-none absolute bottom-24 left-1/2 h-64 w-64 -translate-x-1/2 opacity-[0.04]">
        <Image src="/images/logo-yellow.png" alt="" fill className="object-contain" />
      </div>

      <div className="relative z-10 border-t border-neutral-700 p-4 text-xs text-neutral-500">
        <p>Documents today.</p>
        <p>A simpler tomorrow.</p>
        <span className="mt-1 block h-0.5 w-8 bg-brand-yellow" />
      </div>

      <div className="relative z-10 border-t border-neutral-700 p-4">
        <button
          onClick={handleSignOut}
          className="w-full rounded-card border-2 border-neutral-700 px-4 py-2.5 text-left text-sm font-semibold text-brand-error hover:bg-white/5"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
