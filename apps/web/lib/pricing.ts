// Order form pricing helpers. The prices themselves live in lib/servicePricing.js, which is copied
// byte for byte to services/docufast-api/services/servicePricing.js (what the customer is charged).
import { priceOrder, COMPLEX_AFFIDAVITS } from "./servicePricing.js";

export { priceOrder, COMPLEX_AFFIDAVITS };
export interface QuoteLine { label: string; amount: number }
export interface Quote { lines: QuoteLine[]; total: number; complete: boolean; note?: string }

/** Price any order for display. complete = false means an estimate that a person confirms. */
export function quoteFor(category: string, slug: string, speed: string | undefined, form: Record<string, unknown>): Quote | null {
  const q = priceOrder({ service_category: category, order_type: slug, speed, form_data: form });
  return q ? { lines: q.lines, total: q.total, complete: q.final, note: q.note } : null;
}

export function affidavitQuote(slug: string, speed: "standard" | "express", copies: number): Quote {
  return quoteFor("affidavit", slug, speed, { copies, authenticated_by: "commissioner" }) ?? { lines: [], total: 0, complete: false };
}

export const naira = (n: number) => `NGN ${n.toLocaleString("en-US")}`;
export const amountText = (n: number) => (n === 0 ? "Included" : naira(n));
