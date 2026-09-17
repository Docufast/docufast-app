"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useOrg } from "@/contexts/OrgContext";
import { searchIndex, SearchItem } from "@/lib/searchIndex";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function TopBar({ userName }: { userName: string }) {
  const { orgs, activeOrgId, setActiveOrgId } = useOrg();
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const orgRef = useRef<HTMLDivElement>(null);
  const activeOrg = orgs.find((o) => o.id === activeOrgId) || orgs[0];

  useEffect(() => {
    setSearchResults(searchIndex(searchValue));
  }, [searchValue]);

  // Close dropdowns when clicking outside them.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) {
        setOrgMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-4 border-b-4 border-brand-black bg-white px-6 py-3 lg:px-12">
      {/* Real live search */}
      <div ref={searchRef} className="relative max-w-md flex-1">
        <div className="flex items-center gap-2 rounded-card border-2 border-brand-gray-light px-3 py-2">
          <Search size={16} className="text-brand-gray" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search documents, orders, or services…"
            className="w-full text-sm outline-none placeholder:text-brand-gray"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-card border-2 border-brand-black bg-white shadow-lg">
            {searchResults.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setSearchValue("");
                  setSearchResults([]);
                }}
                className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-brand-yellow/10"
              >
                <span className="font-medium text-brand-black">{item.label}</span>
                <span className="text-xs text-brand-gray">{item.group}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <button className="relative ml-auto rounded-card p-2 hover:bg-brand-yellow/10" aria-label="Notifications">
        <Bell size={20} className="text-brand-black" />
      </button>

      {/* User menu — now includes the business switcher */}
      <div ref={orgRef} className="relative">
        <button onClick={() => setOrgMenuOpen(!orgMenuOpen)} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-black text-xs font-bold text-brand-white">
            {initials(userName)}
          </div>
          <div className="hidden text-left sm:block">
            <div className="text-sm font-bold leading-tight text-brand-black">{userName}</div>
            <div className="text-xs leading-tight text-brand-gray">{activeOrg.name}</div>
          </div>
          <ChevronDown size={16} className={`text-brand-gray transition-transform ${orgMenuOpen ? "rotate-180" : ""}`} />
        </button>

        {orgMenuOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-card border-2 border-brand-black bg-white shadow-lg">
            <div className="border-b-2 border-brand-black px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-gray">
              Switch business
            </div>
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  setActiveOrgId(org.id);
                  setOrgMenuOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${
                  org.id === activeOrgId ? "font-bold text-brand-black bg-brand-yellow/10" : "text-brand-gray"
                }`}
              >
                <span>{org.name}</span>
                {org.id === activeOrgId && <span>✓</span>}
              </button>
            ))}
            <Link
              href="/account/organizations/add"
              onClick={() => setOrgMenuOpen(false)}
              className="block border-t-2 border-brand-black px-4 py-2.5 text-sm font-semibold text-brand-black hover:bg-brand-yellow/10"
            >
              + Add a business
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
