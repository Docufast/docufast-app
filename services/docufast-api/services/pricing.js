// Instant quotes (JSB, 1 Nov 2026). Prices live in ./servicePricing.js, a byte-for-byte copy of
// apps/web/lib/servicePricing.js; apps/web/tests/pricing.test.mjs checks the two are identical.
export { priceOrder as instantQuote } from "./servicePricing.js";
