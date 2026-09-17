// A single searchable index across every service type and main app page —
// powers the real TopBar search dropdown.

import { AFFIDAVIT_TYPES } from "./affidavitTypes";
import { CAC_TYPES } from "./cacTypes";
import { PUBLICATION_TYPES } from "./publicationTypes";
import { VA_TYPES } from "./virtualAssistantTypes";
import { PLATFORM_NATIVE_TYPES } from "./platformNativeTypes";

export interface SearchItem {
  label: string;
  href: string;
  group: string;
}

const NAV_PAGES: SearchItem[] = [
  { label: "Home", href: "/home", group: "Pages" },
  { label: "Orders", href: "/orders", group: "Pages" },
  { label: "Vault", href: "/vault", group: "Pages" },
  { label: "Calendar", href: "/calendar", group: "Pages" },
  { label: "Account", href: "/account", group: "Pages" },
  { label: "Settings", href: "/account/settings", group: "Pages" },
];

const AFFIDAVIT_ITEMS: SearchItem[] = AFFIDAVIT_TYPES.map((t) => ({
  label: t.label,
  href: `/services/affidavits/${t.slug}`,
  group: "Affidavits",
}));

const CAC_ITEMS: SearchItem[] = CAC_TYPES.map((t) => ({
  label: t.label,
  href: `/services/cac/${t.slug}`,
  group: "CAC & Compliance",
}));

const PUBLICATION_ITEMS: SearchItem[] = PUBLICATION_TYPES.map((t) => ({
  label: t.label,
  href: `/services/publications/${t.slug}`,
  group: "Publications",
}));

const VA_ITEMS: SearchItem[] = VA_TYPES.map((t) => ({
  label: t.label,
  href: `/services/virtual-assistant/${t.slug}`,
  group: "Virtual Assistant",
}));

const PLATFORM_ITEMS: SearchItem[] = PLATFORM_NATIVE_TYPES.map((t) => ({
  label: t.label,
  href: `/services/notarization/${t.slug}`,
  group: "Platform-Native",
}));

export const SEARCH_INDEX: SearchItem[] = [
  ...NAV_PAGES,
  ...AFFIDAVIT_ITEMS,
  ...CAC_ITEMS,
  ...PUBLICATION_ITEMS,
  ...VA_ITEMS,
  ...PLATFORM_ITEMS,
];

export function searchIndex(query: string, limit = 8): SearchItem[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return SEARCH_INDEX.filter((item) => item.label.toLowerCase().includes(q)).slice(0, limit);
}
