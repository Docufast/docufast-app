// lib/homeChatPrices.ts (server only)
// The prices the home screen chat shows on its buttons, worked out on the server from the shared
// price file (lib/servicePricing.js) so the chat and the order forms can never disagree.
import { priceOrder } from "./servicePricing.js";
import { ORDERABLE_AFFIDAVIT_TYPES } from "./affidavitTypes";
import { naira, type PriceNotes } from "./homeChat";

const OTHERS: [string, string][] = [
  ["cac", "business_name_registration"], ["cac", "company_incorporation"], ["cac", "incorporated_trustees_registration"],
  ["cac", "cac_annual_returns"], ["cac", "cac_status_report"], ["cac", "company_amendment"],
  ["publication", "name_change_publication"], ["publication", "loss_of_documents_publication"],
];

export function chatPriceNotes(): PriceNotes {
  const out: PriceNotes = {};
  const add = (category: string, slug: string) => {
    const q = priceOrder({
      service_category: category,
      order_type: slug,
      speed: "standard",
      form_data: category === "affidavit" ? { copies: 1, authenticated_by: "commissioner" } : {},
    });
    if (q && q.total) out[`${category}/${slug}`] = q.final ? naira(q.total) : `from ${naira(q.total)}`;
  };
  for (const t of ORDERABLE_AFFIDAVIT_TYPES) add("affidavit", t.slug);
  for (const [c, s] of OTHERS) add(c, s);
  return out;
}
