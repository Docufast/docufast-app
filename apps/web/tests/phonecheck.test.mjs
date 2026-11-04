import test from "node:test";
import assert from "node:assert/strict";
import { normalizePhone } from "../lib/phoneCheck.js";

test("Nigerian numbers in every usual form become +234 form", () => {
  for (const v of ["08031234567", "0803 123 4567", "(0803) 123-4567", "+234 803 123 4567", "+2348031234567", "2348031234567", "002348031234567", "+234 0803 123 4567"]) {
    assert.equal(normalizePhone(v), "+2348031234567", v);
  }
  assert.equal(normalizePhone("07012345678"), "+2347012345678");
  assert.equal(normalizePhone("09012345678"), "+2349012345678");
});

test("international numbers need a + or 00 and sensible length", () => {
  assert.equal(normalizePhone("+44 7911 123456"), "+447911123456");
  assert.equal(normalizePhone("0044 7911 123456"), "+447911123456");
});

test("unusable numbers are refused", () => {
  for (const v of ["", "123", "phone", "0803123456", "080312345678", "06031234567", "+234 603 123 4567", "08x31234567", "+0123456789", "+1234", "+2348031234567890", "7911123456"]) {
    assert.equal(normalizePhone(v), null, v);
  }
});
