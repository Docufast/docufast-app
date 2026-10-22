// Paystack client (#109, JSB 22 Oct 2026: Paystack for the paid beta).
// Server only. The secret key lives in the environment (PAYSTACK_SECRET_KEY) and is never
// sent to the browser, logged, or written to the database.
import crypto from "node:crypto";

const BASE_URL = "https://api.paystack.co";

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set.");
  return key;
}

async function call(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.status === false) {
    const err = new Error(json.message || `Paystack ${method} ${path} failed (${res.status}).`);
    err.status = res.status;
    throw err;
  }
  return json.data;
}

// https://paystack.com/docs/api/transaction/#initialize
export function initializeTransaction({ email, amountKobo, reference, callbackUrl, metadata }) {
  return call("POST", "/transaction/initialize", {
    email,
    amount: amountKobo,
    currency: "NGN",
    reference,
    callback_url: callbackUrl,
    channels: ["card", "bank", "ussd", "bank_transfer"],
    metadata,
  });
}

// https://paystack.com/docs/api/transaction/#verify
export function verifyTransaction(reference) {
  return call("GET", `/transaction/verify/${encodeURIComponent(reference)}`);
}

// https://paystack.com/docs/api/refund/#create
export function createRefund(reference) {
  return call("POST", "/refund", { transaction: reference });
}

// Webhook signature: HMAC SHA512 of the raw request body with the secret key.
// https://paystack.com/docs/payments/webhooks/#verify-event-origin
export function isValidWebhookSignature(rawBody, signatureHeader) {
  if (!rawBody || !signatureHeader) return false;
  const expected = crypto.createHmac("sha512", secretKey()).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(signatureHeader), "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
