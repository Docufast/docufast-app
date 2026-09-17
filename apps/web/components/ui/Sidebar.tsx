"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useOrg } from "@/contexts/OrgContext";
import { supabase } from "@/lib/supabase";

const NAV_ITEMS = [
  { href: "/home", label: "Home" },
  { href: "/orders", label: "Orders" },
  { href: "/vault", label: "Vault" },
  { href: "/calendar", label: "Calendar" },
  { href: "/account", label: "Account" },
];

export default function Sidebar({
  active,
  subItem,
}: {
  active: string;
  subItem?: { label: string; href: string; active: boolean }[];
}) {
  const { orgs, activeOrgId, setActiveOrgId } = useOrg();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeOrg = orgs.find((o) => o.id === activeOrgId) || orgs[0];

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  }

  return (
    <aside className="relative hidden flex-col bg-brand-black text-brand-white lg:flex">
      <div className="flex items-center gap-2 border-b border-neutral-700 px-4 pb-4 pt-4">
        <Image src="/images/logo-yellow.png" alt="Docufast" width={22} height={22} />
        <span className="text-lg font-extrabold tracking-wide">DOCUFAST</span>
      </div>

      <nav className="mt-3 flex flex-1 flex-col">
        {NAV_ITEMS.map((item) => {
          const isActive = item.label === active;
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold ${
                  isActive
                    ? "border-l-4 border-brand-yellow bg-white/10 text-brand-white"
                    : "text-neutral-400"
                }`}
              >
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

      <div className="relative mt-auto border-t border-neutral-700 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Active context
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mt-1.5 flex w-full items-center gap-2"
        >
          <span className="mr-auto text-sm font-bold">{activeOrg.name}</span>
          <span className={`text-brand-yellow transition-transform ${menuOpen ? "rotate-180" : ""}`}>
            ⌄
          </span>
        </button>

        {menuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 rounded-card border-2 border-brand-yellow bg-brand-black shadow-lg">
            <div className="max-h-48 overflow-y-auto py-1">
              {orgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setActiveOrgId(org.id);
                    setMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${
                    org.id === activeOrgId ? "font-bold text-brand-yellow" : "text-neutral-200"
                  }`}
                >
                  <span>{org.name}</span>
                  {org.id === activeOrgId && <span>✓</span>}
                </button>
              ))}
              <Link
                href="/account/organizations/add"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-left text-sm font-semibold text-neutral-200 hover:text-brand-yellow"
              >
                + Add a business
              </Link>
            </div>
            <div className="border-t border-neutral-700 py-1">
              <button
                onClick={handleSignOut}
                className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-brand-error"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
