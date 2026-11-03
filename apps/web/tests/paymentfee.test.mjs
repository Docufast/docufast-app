// node --test tests/paymentfee.test.mjs   (from apps/web)
// Payment processing fee paid by the customer (JSB, 3 Nov 2026): one formula for the screen,
// the quote email and the charge; shown before checkout; provider never named in public copy.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const web = path.resolve(here, "..");
const webFile = path.join(web, "lib", "paymentFee.js");
const apiFile = path.resolve(web, "../../services/docufast-api/services/paymentFee.js");
const F = await import(pathToFileURL(webFile).href);
const read = (p) => fs.readFileSync(path.join(web, p), "utf8");

test("web and API copies are byte-identical", () => {
  assert.equal(fs.readFileSync(webFile, "utf8"), fs.readFileSync(apiFile, "utf8"));
});

test("known amounts", () => {
  const cases = [[0, 0], [500, 8], [2000, 31], [2460, 38], [2500, 140], [4000, 163], [5000, 178], [6000, 193], [10000, 254], [14000, 315], [15000, 330], [40000, 711], [75000, 1244], [150000, 2000], [1000000, 2000]];
  for (const [p, fee] of cases) {
    assert.equal(F.paymentFee(p), fee, `price ${p}`);
    assert.equal(F.amountToPay(p), p + fee);
  }
});

test("Docufast always receives at least the quoted price after the provider's fee", () => {
  const { rate, flat, flatWaivedBelow, cap } = F.PAYMENT_FEE;
  for (let p = 100; p <= 300000; p += 37) {
    const pay = F.amountToPay(p);
    const providerFee = Math.min(rate * pay + (pay >= flatWaivedBelow ? flat : 0), cap);
    assert.ok(pay - providerFee >= p - 1e-9, `price ${p}: pay ${pay}, provider fee ${providerFee}`);
    assert.ok(F.paymentFee(p) <= cap);
  }
});

test("FAQ example matches the formula", () => {
  const faq = read("lib/faq.ts");
  assert.match(faq, /"is-there-a-payment-processing-fee"/);
  const m = faq.match(/a NGN ([\d,]+) affidavit has a NGN ([\d,]+) fee, so you pay NGN ([\d,]+)/);
  assert.ok(m, "example sentence present");
  const n = (s) => Number(s.replace(/,/g, ""));
  assert.equal(F.paymentFee(n(m[1])), n(m[2]));
  assert.equal(F.amountToPay(n(m[1])), n(m[3]));
});

test("fee shown on every quote screen and in the Terms; provider never named in public copy", () => {
  for (const p of ["app/services/affidavits/[slug]/page.tsx", "components/ServiceOrderForm.tsx"]) {
    assert.match(read(p), /<PaymentFeeRows /, p);
  }
  assert.match(read("app/terms/page.tsx"), /payment\s+processing fee/);
  const email = fs.readFileSync(path.resolve(web, "../../services/docufast-api/services/emailService.js"), "utf8");
  assert.match(email, /paymentFee\(total\)/);
  for (const p of ["lib/faq.ts", "app/terms/page.tsx", "components/PaymentFeeRows.tsx", "components/ServiceOrderForm.tsx", "app/services/affidavits/[slug]/page.tsx"]) {
    assert.doesNotMatch(read(p), /paystack|flutterwave|woven/i, p);
  }
  for (const p of ["lib/faq.ts", "app/terms/page.tsx", "components/PaymentFeeRows.tsx"]) assert.doesNotMatch(read(p), /\u2014/, p);
});
