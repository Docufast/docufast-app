// lib/paymentFee.js
// The payment processing fee the customer pays at checkout (JSB, 3 Nov 2026).
// Copied byte for byte to services/docufast-api/services/paymentFee.js, so the quote the customer
// sees and the amount the API asks the payment provider for can never differ. A test checks both copies.
//
// Provider's local card and bank fee, as published (checked 3 Nov 2026): 1.5% + NGN 100,
// the NGN 100 waived when the payment is under NGN 2,500, never more than NGN 2,000 a payment.
// The fee is grossed up so Docufast still receives the full quoted price after the provider's cut.
// Public copy says "payment processing fee". Never name the provider in customer-facing text.

export const PAYMENT_FEE = Object.freeze({
  rate: 0.015,
  flat: 100,
  flatWaivedBelow: 2500,
  cap: 2000,
});

/** Fee in whole naira for a quoted price in whole naira. 0 for 0. */
export function paymentFee(price) {
  const p = Math.max(0, Math.round(Number(price) || 0));
  if (p === 0) return 0;
  const { rate, flat, flatWaivedBelow, cap } = PAYMENT_FEE;
  const gross = (f) => Math.ceil((p + f) / (1 - rate));
  let total = gross(0);
  if (total >= flatWaivedBelow) total = gross(flat);
  return Math.min(total - p, cap);
}

/** What the customer pays at checkout: the quoted price plus the payment processing fee. */
export function amountToPay(price) {
  const p = Math.max(0, Math.round(Number(price) || 0));
  return p + paymentFee(p);
}
