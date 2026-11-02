// node --test tests/staff.test.mjs  (from apps/web) Team access rules (#224).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(here, "../../../services/docufast-api");
// staffAuth.js imports the Supabase client; read its rules as text instead of running it.
const src = fs.readFileSync(path.join(apiDir, "lib/staffAuth.js"), "utf8");
const rules = new Function(src.slice(src.indexOf("export const ROLE_PERMISSIONS")).replace(/export /g, "").split("/** The signed-in")[0] + "; return { ROLE_PERMISSIONS, FILER_STATUSES, can };")();
const webSrc = fs.readFileSync(path.resolve(here, "../lib/staffRoles.ts"), "utf8");

test("filer cannot touch quotes, payments, refunds or questions", () => {
  for (const p of ["quote", "payments", "express", "enquiries"]) assert.equal(rules.can("filer", p), false, p);
  for (const p of ["queue", "order", "order_status", "filing", "deliver", "download"]) assert.equal(rules.can("filer", p), true, p);
});
test("support sees only the queue and questions", () => {
  for (const p of ["order", "filing", "deliver", "download", "payments", "quote", "access_log"]) assert.equal(rules.can("support", p), false, p);
  assert.equal(rules.can("support", "queue"), true);
  assert.equal(rules.can("support", "enquiries"), true);
});
test("customers and unknown roles get nothing", () => {
  for (const r of [undefined, null, "customer", "processing_staff", "FOUNDER"]) assert.equal(rules.can(r, "queue"), false, String(r));
});
test("filer statuses never include payment or quote statuses, and web matches API", () => {
  for (const s of ["quote_pending", "quote_sent", "paid", "cancelled"]) assert.ok(!rules.FILER_STATUSES.includes(s), s);
  for (const s of rules.FILER_STATUSES) assert.ok(webSrc.includes(`"${s}"`), s);
});
test("every admin order route checks a staff permission; no founder-only leftovers", () => {
  const routes = fs.readFileSync(path.join(apiDir, "routes/adminOrders.js"), "utf8");
  assert.ok(!routes.includes("verifyFounder("));
  const handlers = routes.match(/router\.(get|post|put|patch)\(/g).length;
  const checks = routes.match(/verifyStaff\(req, "/g).length;
  assert.equal(checks, handlers);
});
