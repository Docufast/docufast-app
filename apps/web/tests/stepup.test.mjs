import test from "node:test";
import assert from "node:assert/strict";
import { newCode, hashCode, cleanCode, freshTotp, EMAIL } from "../lib/stepUp/policy.js";

const PEPPER = "p".repeat(40);

test("codes are 6 digits and avoid modulo bias", () => {
  for (let i = 0; i < 200; i++) assert.match(newCode(), /^\d{6}$/);
  // a draw above the unbiased limit is thrown away and drawn again
  const draws = [0xffffffff, 0xfffffff0, 1234567];
  let n = 0;
  assert.equal(newCode((b) => { b[0] = draws[n++]; return b; }), "234567");
  assert.equal(n, 3);
});

test("the stored hash binds the code to this user and device session", async () => {
  const h = await hashCode(PEPPER, "u1", "s1", "123456");
  assert.match(h, /^[0-9a-f]{64}$/);
  assert.equal(h, await hashCode(PEPPER, "u1", "s1", "123456"));
  assert.notEqual(h, await hashCode(PEPPER, "u2", "s1", "123456"));
  assert.notEqual(h, await hashCode(PEPPER, "u1", "s2", "123456"));
  assert.notEqual(h, await hashCode(PEPPER, "u1", "s1", "123457"));
  assert.notEqual(h, await hashCode("q".repeat(40), "u1", "s1", "123456"));
});

test("a missing or short secret fails closed", async () => {
  await assert.rejects(() => hashCode("", "u1", "s1", "123456"));
  await assert.rejects(() => hashCode("short", "u1", "s1", "123456"));
});

test("typed codes are cleaned; anything else is refused", () => {
  assert.equal(cleanCode("123 456"), "123456");
  assert.equal(cleanCode("123-456"), "123456");
  for (const bad of ["12345", "1234567", "abcdef", "", null, undefined, 123456]) assert.equal(cleanCode(bad), null, String(bad));
});

test("an authenticator step-up needs a fresh app entry at aal2", () => {
  const now = 1_000_000;
  const ok = { aal: "aal2", amr: [{ method: "password", timestamp: now - 5000 }, { method: "totp", timestamp: now - 60 }] };
  assert.equal(freshTotp(ok, now), true);
  assert.equal(freshTotp({ ...ok, aal: "aal1" }, now), false);
  assert.equal(freshTotp({ aal: "aal2", amr: [{ method: "totp", timestamp: now - 3600 }] }, now), false);
  assert.equal(freshTotp({ aal: "aal2", amr: [{ method: "password", timestamp: now }] }, now), false);
  assert.equal(freshTotp(null, now), false);
});

test("the email never asks the customer to share the code, and says where to use it", () => {
  const t = EMAIL.text("123456");
  assert.match(t, /123456/);
  assert.match(t, /10 minutes/);
  assert.match(t, /never ask you for this code/);
  assert.ok(!t.includes("—"), "no em dashes");
});
