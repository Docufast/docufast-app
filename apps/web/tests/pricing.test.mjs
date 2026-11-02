// node --test tests/pricing.test.mjs   (from apps/web; uses the app's own typescript to compile)
// Checks the price file the forms show is the one the API charges, the schedule prices, and the
// suggested affidavit wording.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const web = path.resolve(here, "..");
const apiFile = path.resolve(web, "../../services/docufast-api/services/servicePricing.js");
const webFile = path.join(web, "lib", "servicePricing.js");

const out = fs.mkdtempSync(path.join(os.tmpdir(), "df-pricing-"));
for (const f of ["affidavitGuide", "affidavitTypes", "serviceForms"]) {
  const src = fs.readFileSync(path.join(web, "lib", `${f}.ts`), "utf8");
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
  fs.writeFileSync(path.join(out, `${f}.mjs`), js.replace(/from "\.\/(\w+)"/g, 'from "./$1.mjs"'));
}
const guide = await import(pathToFileURL(path.join(out, "affidavitGuide.mjs")).href);
const types = await import(pathToFileURL(path.join(out, "affidavitTypes.mjs")).href);
const forms = await import(pathToFileURL(path.join(out, "serviceForms.mjs")).href);
const P = await import(pathToFileURL(webFile).href);
const api = await import(pathToFileURL(path.resolve(web, "../../services/docufast-api/services/pricing.js")).href);

const q = (category, slug, form = {}, speed) => P.priceOrder({ service_category: category, order_type: slug, speed, form_data: form });

test("the form's price file and the API's are identical, and the API uses it", () => {
  assert.equal(fs.readFileSync(webFile, "utf8"), fs.readFileSync(apiFile, "utf8"));
  assert.equal(api.instantQuote({ service_category: "cac", order_type: "cac_status_report" }).total, 15000);
});

test("affidavit list matches the price list", () => {
  assert.deepEqual(types.AFFIDAVIT_TYPES.map((t) => t.slug).sort(), [...P.AFFIDAVIT_SLUGS].sort());
});

test("affidavits: 4,000 standard, 6,000 complex, +1,000 express, 1 copy included", () => {
  assert.equal(q("affidavit", "loss_sim_card").total, 4000);
  assert.equal(q("affidavit", "loss_sim_card", {}, "express").total, 5000);
  assert.equal(q("affidavit", "age_declaration_minor_male").total, 6000);
  assert.equal(q("affidavit", "declaration_of_death", {}, "express").total, 7000);
  assert.ok(q("affidavit", "loss_sim_card").lines.some((l) => l.label === "1 certified copy" && l.amount === 0));
  assert.equal(q("affidavit", "loss_sim_card", { copies: 1 }).final, true);
  assert.equal(q("affidavit", "loss_sim_card", { authenticated_by: "notary" }).final, false);
});

test("CAC prices from the schedule", () => {
  assert.deepEqual([q("cac", "business_name_registration").total, q("cac", "business_name_registration").final], [40000, true]);
  assert.deepEqual([q("cac", "company_incorporation", { share_capital: "1000000" }).total, q("cac", "company_incorporation", { share_capital: "1000000" }).final], [75000, true]);
  assert.equal(q("cac", "company_incorporation", { share_capital: "more" }).final, false);
  assert.equal(q("cac", "company_incorporation", { foreign_owner: "yes" }).final, false);
  assert.deepEqual([q("cac", "incorporated_trustees_registration").total, q("cac", "incorporated_trustees_registration").final], [150000, true]);
  assert.deepEqual([q("cac", "cac_annual_returns", { years_to_file: "1" }).total, q("cac", "cac_annual_returns", { years_to_file: "1" }).final], [15000, true]);
  const back = q("cac", "cac_annual_returns", { years_to_file: "3" });
  assert.deepEqual([back.total, back.final], [35000, false]);
  assert.equal(q("cac", "cac_status_report").total, 15000);
  const amend = q("cac", "company_amendment", { number_of_changes: "2" });
  assert.deepEqual([amend.total, amend.final], [50000, false]);
});

test("newspaper notices 10,000; trustees notice is included elsewhere", () => {
  assert.deepEqual([q("publication", "name_change_publication").total, q("publication", "name_change_publication").final], [10000, true]);
  assert.equal(q("publication", "loss_of_documents_publication").total, 10000);
  assert.equal(q("publication", "incorporated_trustees_publication"), null);
});

test("virtual office: per page, per 100 rows, per minute; rush needs a person", () => {
  assert.equal(q("virtual_assistant", "document_typing", { pages: "7" }).total, 3500);
  assert.equal(q("virtual_assistant", "data_entry", { rows: "250" }).total, 7500);
  assert.equal(q("virtual_assistant", "transcription", { minutes: "30" }).total, 9000);
  assert.equal(q("virtual_assistant", "document_typing", { pages: "0" }).total, 500, "minimum 1 page");
  assert.equal(q("virtual_assistant", "document_typing", { pages: "3", turnaround: "rush" }).final, false);
});

test("every form has a price (except the included trustees notice), labels have no em dashes", () => {
  for (const f of forms.SERVICE_FORMS) {
    const quote = q(f.category, f.slug, forms.initialValues(f));
    if (f.notOrderable) assert.equal(quote, null, f.slug);
    else assert.ok(quote && quote.total > 0, f.slug);
    const text = JSON.stringify(f);
    assert.ok(!text.includes("—"), `${f.slug} has an em dash`);
  }
});

test("suggested purpose fills in answers and has no em dashes", () => {
  for (const t of types.AFFIDAVIT_TYPES) {
    const s = guide.suggestedPurpose(t.slug, t.category, {}, []);
    assert.ok(s.length > 20 && s.endsWith("all official purposes."), t.slug);
    assert.ok(!s.includes("—"), t.slug);
  }
  const s = guide.suggestedPurpose("change_of_name", "name", { old_name: "Ada Okafor", new_name: "Ada Bello", reason: "Marriage" }, ["my bank", "NIMC (NIN)"]);
  assert.match(s, /formerly known as Ada Okafor, now wish to be known and addressed as Ada Bello \(marriage\)/);
  assert.match(s, /my bank, NIMC \(NIN\) and all other official purposes\.$/);
  assert.equal(guide.jurisdictionText("High Court of Lagos State", "Ikeja"), "High Court of Lagos State, Ikeja Judicial Division");
  assert.equal(guide.reasonOptions("change_of_name", "name").label, "Reason for the change");
  assert.equal(guide.reasonOptions("loss_sim_card", "loss").key, "how_lost");
});
