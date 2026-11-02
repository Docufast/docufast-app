// node --test tests/delivery.test.mjs   (from apps/web)
// #166: the Founder Dashboard delivery target matches the promise (Standard within 2 to 3 working
// days; Express same day before 2 PM) and uses the same working days and holidays as the API.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = fs.mkdtempSync(path.join(os.tmpdir(), "df-delivery-"));
const src = fs.readFileSync(path.resolve(here, "../lib/deliveryTarget.ts"), "utf8");
fs.writeFileSync(path.join(out, "d.mjs"), ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText);
const D = await import(pathToFileURL(path.join(out, "d.mjs")).href);
const apiFile = path.resolve(here, "../../../services/docufast-api/lib/workingDays.js");

// Lagos is UTC+1: "T09:00:00Z" is 10 am WAT.
test("standard: due at the end of the 3rd working day after confirmation", () => {
  assert.equal(D.standardDueAt("2026-11-02T09:00:00Z").toISOString(), "2026-11-05T22:59:59.999Z"); // Mon -> end Thu
  assert.equal(D.standardDueAt("2026-11-06T15:00:00Z").toISOString(), "2026-11-11T22:59:59.999Z"); // Fri -> end Wed
  assert.equal(D.standardDueAt("2026-11-07T10:00:00Z").toISOString(), "2026-11-11T22:59:59.999Z"); // Sat -> end Wed
  assert.equal(D.standardDueAt("2026-12-23T10:00:00Z").toISOString(), "2026-12-30T22:59:59.999Z"); // over Christmas and Boxing Day
  assert.equal(D.standardDueAt("2026-11-02T23:30:00Z").toISOString(), "2026-11-06T22:59:59.999Z"); // 00:30 Tue WAT counts as Tue
});

test("on time and late are judged against the right promise", () => {
  const paid = "2026-11-02T09:00:00Z";
  assert.equal(D.onTime({ speed: "standard", paid_at: paid, delivered_at: "2026-11-05T20:00:00Z" }), true);
  assert.equal(D.onTime({ speed: "standard", paid_at: paid, delivered_at: "2026-11-06T08:00:00Z" }), false);
  assert.equal(D.onTime({ speed: "express", express_due_at: "2026-11-02T22:59:59.999Z", delivered_at: "2026-11-02T16:00:00Z" }), true);
  assert.equal(D.onTime({ speed: "express", express_due_at: "2026-11-02T22:59:59.999Z", delivered_at: "2026-11-03T08:00:00Z" }), false);
  assert.equal(D.onTime({ speed: "standard", paid_at: null, delivered_at: "2026-11-05T20:00:00Z" }), null);
  const s = D.deliveryStats([
    { speed: "standard", paid_at: paid, delivered_at: "2026-11-05T20:00:00Z" },
    { speed: "standard", paid_at: paid, delivered_at: "2026-11-06T08:00:00Z" },
    { speed: "express", express_due_at: "2026-11-02T22:59:59.999Z", delivered_at: "2026-11-03T08:00:00Z" },
    { speed: "standard", paid_at: null, delivered_at: "2026-11-05T20:00:00Z" },
  ]);
  assert.deepEqual(s, { judged: 3, met: 1, expressLate: 1, standardLate: 1, percent: 33 });
});

test("holidays match the API's working-day file", () => {
  const api = fs.readFileSync(apiFile, "utf8");
  const apiDays = [...api.matchAll(/"(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1]).sort();
  assert.deepEqual([...D.BUILT_IN_HOLIDAYS].sort(), apiDays);
});

test("the dashboard no longer shows the retired BluetentBC SLA", () => {
  const page = fs.readFileSync(path.resolve(here, "../app/admin/page.tsx"), "utf8");
  assert.ok(!page.includes("BluetentBC SLA"));
  assert.match(page, /Affidavits on time, last 30 days/);
});
