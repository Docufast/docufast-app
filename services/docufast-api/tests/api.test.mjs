// node --test tests/   (from services/docufast-api)
// API regression tests (test report D4, 4 Nov 2026). No network and no real keys: the database URL
// points at a closed local port, so every check here must hold without reaching Supabase or Paystack.
// Covers: the amount charged, payment-provider timeouts, quote expiry, the webhook signature,
// access control on every customer and staff route, and the hardening middleware.
import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

process.env.SUPABASE_URL = "http://127.0.0.1:9";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role";
process.env.PAYSTACK_SECRET_KEY = "sk_test_unit";
process.env.PAYSTACK_TIMEOUT_MS = "150";

const here = path.dirname(fileURLToPath(import.meta.url));
const api = path.resolve(here, "..");
const express = (await import("express")).default;
const { paymentFee, amountToPay } = await import("../services/paymentFee.js");
const paystack = await import("../lib/paystack.js");
const { quoteExpired } = await import("../routes/payments.js");
const paymentsRoute = (await import("../routes/payments.js")).default;
const documentsRoute = (await import("../routes/documents.js")).default;
const uploadRoute = (await import("../routes/upload.js")).default;
const adminOrdersRoute = (await import("../routes/adminOrders.js")).default;
const partnerRoute = (await import("../routes/partner.js")).default;
const webhookRoute = (await import("../routes/paystackWebhook.js")).default;
const healthRoute = (await import("../routes/health.js")).default;
const { securityHeaders, requireBearer, notFound, errorHandler } = await import("../lib/httpHardening.js");

// The same middleware order as index.js.
function buildApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(securityHeaders);
  app.use("/webhooks/paystack", express.raw({ type: "application/json", limit: "1mb" }), webhookRoute);
  app.use(express.json());
  app.use("/health", healthRoute);
  app.use("/upload", uploadRoute);
  app.use("/admin/orders", requireBearer, adminOrdersRoute);
  app.use("/documents", documentsRoute);
  app.use("/orders", paymentsRoute);
  app.use("/partner", partnerRoute);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
const server = buildApp().listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
test.after(() => server.close());
const call = (method, p, { headers = {}, body } = {}) =>
  fetch(base + p, { method, headers: { "Content-Type": "application/json", ...headers }, body });
const ID = "00000000-0000-4000-8000-000000000000";

// ---- D1: the amount charged ---------------------------------------------------------------------
test("charge = quote price + processing fee, whole naira, the same figure the customer sees", () => {
  assert.equal(amountToPay(4000), 4163);
  assert.equal(amountToPay(14000), 14315);
  assert.equal(amountToPay(40000), 40711);
  assert.equal(amountToPay(150000), 152000);
  for (const p of [500, 2400, 2500, 4000, 10000, 99999]) assert.ok(Number.isInteger(amountToPay(p) * 100));
  assert.equal(paymentFee(0), 0);
  const src = fs.readFileSync(path.join(api, "services", "paymentService.js"), "utf8");
  assert.match(src, /const amountKobo = amountToPay\(amountNaira\) \* 100/);
});

test("API fee file is byte-identical to the website's", () => {
  const web = path.resolve(api, "..", "..", "apps", "web", "lib", "paymentFee.js");
  if (!fs.existsSync(web)) return; // API deployed on its own
  assert.equal(fs.readFileSync(path.join(api, "services", "paymentFee.js"), "utf8"), fs.readFileSync(web, "utf8"));
});

// ---- D5: payment-provider timeout ---------------------------------------------------------------
test("a hanging Paystack call fails fast instead of holding the request", async (t) => {
  const real = globalThis.fetch;
  t.after(() => { globalThis.fetch = real; });
  globalThis.fetch = (url, opts) => new Promise((_, reject) => {
    opts.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "TimeoutError" })));
  });
  const started = Date.now();
  await assert.rejects(paystack.verifyTransaction("DF-TEST"), (e) => e.status === 504 && /timed out/.test(e.message));
  assert.ok(Date.now() - started < 2000);
});

// ---- D6: 48-hour quotes -------------------------------------------------------------------------
test("quotes expire after 48 hours; older rows without a timestamp still pass", () => {
  const now = Date.parse("2026-11-10T12:00:00Z");
  assert.equal(quoteExpired({ quote_sent_at: "2026-11-08T12:30:00Z" }, now), false); // 47.5 h
  assert.equal(quoteExpired({ quote_sent_at: "2026-11-08T11:00:00Z" }, now), true); // 49 h
  assert.equal(quoteExpired({ quote_sent_at: null }, now), false);
  assert.equal(quoteExpired({}, now), false);
});

// ---- Webhook ------------------------------------------------------------------------------------
test("webhook: signature check", async () => {
  const body = JSON.stringify({ event: "charge.success", data: { reference: "DF-X" } });
  const good = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(body).digest("hex");
  assert.equal(paystack.isValidWebhookSignature(Buffer.from(body), good), true);
  assert.equal(paystack.isValidWebhookSignature(Buffer.from(body), good.replace(/.$/, "0")), false);
  assert.equal(paystack.isValidWebhookSignature(Buffer.from(body), undefined), false);
  const r = await call("POST", "/webhooks/paystack", { body });
  assert.equal(r.status, 401);
  const r2 = await call("POST", "/webhooks/paystack", { body, headers: { "x-paystack-signature": "f".repeat(128) } });
  assert.equal(r2.status, 401);
});

// ---- Access control (OWASP A01) -----------------------------------------------------------------
const CUSTOMER_ROUTES = [
  ["POST", `/orders/${ID}/auto-quote`], ["POST", `/orders/${ID}/initiate-payment`],
  ["GET", `/orders/${ID}/payment-status`], ["POST", `/orders/${ID}/cancel`],
  ["POST", `/documents/${ID}/shares`], ["DELETE", `/documents/shares/${ID}`],
  ["GET", `/documents/${ID}/download`], ["POST", "/upload"],
];
const STAFF_ROUTES = [
  ["GET", `/admin/orders/${ID}`], ["PATCH", `/admin/orders/${ID}`], ["POST", `/admin/orders/${ID}/deliver`],
  ["GET", `/admin/orders/documents/${ID}/download`], ["GET", `/admin/orders/${ID}/filing`],
  ["PUT", `/admin/orders/${ID}/filing`], ["GET", `/admin/orders/${ID}/payments`],
  ["POST", `/admin/orders/${ID}/express-refund`], ["POST", `/admin/orders/${ID}/express-not-due`],
  ["GET", `/admin/orders/${ID}/access-log`],
];

test("every customer and staff route refuses a caller with no sign-in (401)", async () => {
  for (const [m, p] of [...CUSTOMER_ROUTES, ...STAFF_ROUTES]) {
    const r = await call(m, p, { body: m === "GET" ? undefined : "{}" });
    assert.equal(r.status, 401, `${m} ${p} gave ${r.status}`);
  }
});

test("forged and unsigned tokens are refused", async () => {
  const forged = ["Bearer abc.def.ghi", "Bearer eyJhbGciOiJub25lIn0.eyJzdWIiOiJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSJ9."];
  for (const auth of forged) {
    for (const [m, p] of CUSTOMER_ROUTES.slice(0, 4)) {
      const r = await call(m, p, { headers: { Authorization: auth }, body: m === "GET" ? undefined : "{}" });
      assert.equal(r.status, 401, `${m} ${p} with forged token gave ${r.status}`);
    }
    for (const [m, p] of STAFF_ROUTES.slice(0, 3)) {
      const r = await call(m, p, { headers: { Authorization: auth }, body: m === "GET" ? undefined : "{}" });
      assert.ok([401, 403].includes(r.status), `${m} ${p} with forged token gave ${r.status}`);
    }
  }
});

test("partner API needs a partner key", async () => {
  assert.equal((await call("GET", "/partner/v1/ping")).status, 401);
  assert.equal((await call("GET", "/partner/v1/ping", { headers: { Authorization: "Bearer test" } })).status, 401);
});

// ---- Hardening (D7, D12) ------------------------------------------------------------------------
test("security headers, JSON 404 and JSON errors", async () => {
  const r = await call("GET", "/health");
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.match(r.headers.get("strict-transport-security"), /max-age=\d+/);
  assert.equal(r.headers.get("x-frame-options"), "DENY");
  assert.equal(r.headers.get("x-powered-by"), null);
  const nf = await call("GET", "/.env");
  assert.equal(nf.status, 404);
  assert.deepEqual(await nf.json(), { error: "Not found." });
  const bad = await call("POST", `/orders/${ID}/cancel`, { body: "{not json" });
  assert.equal(bad.status, 400);
  assert.match(bad.headers.get("content-type"), /json/);
});

test("/health/ready reports the database as down when it cannot be reached", async () => {
  const r = await call("GET", "/health/ready");
  assert.equal(r.status, 503);
  const j = await r.json();
  assert.equal(j.database, "down");
  assert.equal(JSON.stringify(j).includes("test-service-role"), false);
});

// Customer second step (#220): the authenticator app passes; everything else fails closed.
const { customerSecondStep } = await import("../lib/verifyFounder.js");
const fakeToken = (claims) => "h." + Buffer.from(JSON.stringify(claims)).toString("base64url") + ".s";

test("customer second step: the app passes, anything else fails closed", async () => {
  assert.equal(await customerSecondStep(fakeToken({ aal: "aal2" }), "u1"), true);
  assert.equal(await customerSecondStep(fakeToken({ aal: "aal1" }), "u1"), false, "no device session");
  assert.equal(await customerSecondStep(fakeToken({ aal: "aal1", session_id: "s1" }), "u1"), false, "database unreachable");
  assert.equal(await customerSecondStep("garbage", "u1"), false);
  assert.equal(await customerSecondStep("", "u1"), false);
});
