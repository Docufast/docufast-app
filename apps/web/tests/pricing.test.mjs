// node --test tests/pricing.test.mjs   (from apps/web; uses the app's own typescript to compile)
// Checks the form's prices match what the API charges, and the suggested wording behaves.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const web = path.resolve(here, "..");
const out = fs.mkdtempSync(path.join(os.tmpdir(), "df-pricing-"));
for (const f of ["pricing", "affidavitGuide", "affidavitTypes"]) {
  const src = fs.readFileSync(path.join(web, "lib", `${f}.ts`), "utf8");
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
  fs.writeFileSync(path.join(out, `${f}.mjs`), js.replace(/from "\.\/(\w+)"/g, 'from "./$1.mjs"'));
}
const webPricing = await import(pathToFileURL(path.join(out, "pricing.mjs")).href);
const guide = await import(pathToFileURL(path.join(out, "affidavitGuide.mjs")).href);
const types = await import(pathToFileURL(path.join(out, "affidavitTypes.mjs")).href);
const api = await import(pathToFileURL(path.resolve(web, "../../services/docufast-api/services/pricing.js")).href);

test("web and API prices agree", () => {
  for (const k of ["AFFIDAVIT_STANDARD", "AFFIDAVIT_COMPLEX", "EXPRESS_ADD_ON", "EXTRA_COPY_PRICE"]) assert.equal(webPricing[k], api[k], k);
  assert.deepEqual([...webPricing.COMPLEX_AFFIDAVITS].sort(), [...api.COMPLEX_AFFIDAVITS].sort());
  assert.deepEqual(types.AFFIDAVIT_TYPES.map((t) => t.slug).sort(), [...api.AFFIDAVIT_SLUGS].sort());
});

test("every affidavit: form total equals API quote", () => {
  for (const t of types.AFFIDAVIT_TYPES) for (const speed of ["standard", "express"]) {
    const w = webPricing.affidavitQuote(t.slug, speed, 1);
    const a = api.instantQuote({ service_category: "affidavit", order_type: t.slug, speed, form_data: { copies: 1, authenticated_by: "commissioner" } });
    assert.equal(w.total, a.total, `${t.slug} ${speed}`);
  }
});

test("schedule prices: standard 4,000, complex 6,000, express +1,000", () => {
  assert.equal(webPricing.affidavitQuote("loss_sim_card", "standard", 1).total, 4000);
  assert.equal(webPricing.affidavitQuote("loss_sim_card", "express", 1).total, 5000);
  assert.equal(webPricing.affidavitQuote("age_declaration_minor_male", "standard", 1).total, 6000);
  assert.equal(webPricing.affidavitQuote("declaration_of_death", "express", 1).total, 7000);
});

test("no instant quote when a person must price it", () => {
  const base = { service_category: "affidavit", order_type: "loss_sim_card", speed: "standard" };
  assert.equal(api.instantQuote({ ...base, form_data: { copies: 3 } }), null, "extra copies before their price is set");
  assert.equal(api.instantQuote({ ...base, form_data: { authenticated_by: "notary" } }), null, "notary");
  assert.equal(api.instantQuote({ ...base, service_category: "cac", form_data: {} }), null, "not an affidavit");
  assert.equal(api.instantQuote({ ...base, order_type: "made_up", form_data: {} }), null, "unknown type");
  assert.equal(webPricing.affidavitQuote("loss_sim_card", "standard", 3).complete, false);
});

test("suggested purpose fills in answers, never leaves the user stuck, has no em dashes", () => {
  for (const t of types.AFFIDAVIT_TYPES) {
    const s = guide.suggestedPurpose(t.slug, t.category, {}, []);
    assert.ok(s.length > 20 && s.endsWith("all official purposes."), t.slug);
    assert.ok(!s.includes("—"), t.slug);
  }
  const s = guide.suggestedPurpose("change_of_name", "name", { old_name: "Ada Okafor", new_name: "Ada Bello", reason: "Marriage" }, ["my bank", "NIMC (NIN)"]);
  assert.match(s, /formerly known as Ada Okafor, now wish to be known and addressed as Ada Bello \(marriage\)/);
  assert.match(s, /my bank, NIMC \(NIN\) and all other official purposes\.$/);
  assert.equal(guide.jurisdictionText("High Court of Lagos State", "Ikeja"), "High Court of Lagos State, Ikeja Judicial Division");
});

test("reason choices exist for name and loss affidavits", () => {
  assert.equal(guide.reasonOptions("change_of_name", "name").label, "Reason for the change");
  assert.equal(guide.reasonOptions("correction_of_name", "name").label, "What needs correcting");
  assert.equal(guide.reasonOptions("loss_sim_card", "loss").key, "how_lost");
  assert.equal(guide.reasonOptions("good_conduct", "student"), null);
});
