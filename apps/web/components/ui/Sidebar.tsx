"use client";

import Link from "next/link";
import Image from "next/image";

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
  subItem?: { label: string; active: boolean }[];
}) {
  return (
    <aside className="hidden flex-col bg-brand-black text-brand-white lg:flex">
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
                    <span
                      key={s.label}
                      className={`py-1.5 text-sm ${
                        s.active ? "font-bold text-brand-yellow" : "text-neutral-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-neutral-700 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Active context
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="mr-auto text-sm font-bold">Personal</span>
          <span className="text-brand-yellow">⌄</span>
        </div>
      </div>
    </aside>
  );
}