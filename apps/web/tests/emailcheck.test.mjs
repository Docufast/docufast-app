import test from "node:test";
import assert from "node:assert/strict";
import { isValidEmail } from "../lib/emailCheck.js";

test("real-looking addresses pass", () => {
  for (const e of ["you@example.com", "first.last+tag@sub.example.ng", "A@B.CO", "o'brien@example.ie", "  you@example.com  "]) {
    assert.equal(isValidEmail(e), true, e);
  }
});

test("malformed addresses are refused", () => {
  const bad = ["", "a", "a@b", "a@b.c", "a@@b.com", "a b@c.com", "@c.com", "a@.com", "a@c..com", ".a@c.com", "a.@c.com", "a..b@c.com", "a@-c.com", "a@c-.com", "a@c.123", "x".repeat(65) + "@c.com", "a@" + "b".repeat(64) + ".com", "a@c.com.", "a@c,com"];
  for (const e of bad) assert.equal(isValidEmail(e), false, e);
});
