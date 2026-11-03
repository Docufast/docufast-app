// node --test tests/affidavitguide.test.mjs   (from apps/web)
// JSB, 3 Nov 2026: an "All purposes" use, fuller suggested statements, and every affidavit on ONE page.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const web = path.resolve(here, "..");
const out = fs.mkdtempSync(path.join(os.tmpdir(), "df-guide-"));
for (const f of ["affidavitGuide", "affidavitTypes"]) {
  const src = fs.readFileSync(path.join(web, "lib", `${f}.ts`), "utf8");
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
  fs.writeFileSync(path.join(out, `${f}.mjs`), js.replace(/from "\.\/(\w+)"/g, 'from "./$1.mjs"'));
}
const G = await import(pathToFileURL(path.join(out, "affidavitGuide.mjs")).href);
const T = await import(pathToFileURL(path.join(out, "affidavitTypes.mjs")).href);

// Long but realistic answers, to prove the suggestion still fits on one page.
const LONG = {
  old_name: "Oluwaseun Adebayo Chukwuemeka-Johnson", new_name: "Oluwaseun Adebayo Okonkwo-Williams",
  reason: "Marriage", declared_dob: "14/07/1998", context: "My birth was not registered with the National Population Commission at the time",
  item_lost: "International passport number B01234567", date_lost: "early September 2026", location_lost: "in transit between Oshodi and Ikeja",
  how_lost: "It was stolen", spouse_name: "Chiamaka Ngozi Okonkwo-Williams", relevant_date: "12 December 2020",
  deceased_name: "Babatunde Olayinka Adeyemi-Coker", date_of_death: "3 October 2026", institution: "University of Lagos",
  reg_number: "170401234", previous_detail: "12 Allen Avenue, Ikeja, Lagos", new_detail: "45 Admiralty Way, Lekki Phase 1, Lagos",
};
const ALL_USES = G.USES.filter((u) => u !== G.ALL_PURPOSES);

test("All purposes is offered first and cannot be combined with other uses", () => {
  assert.equal(G.USES[0], G.ALL_PURPOSES);
  let u = G.toggleUse([], "my bank");
  u = G.toggleUse(u, "NIMC (NIN)");
  assert.deepEqual(u, ["my bank", "NIMC (NIN)"]);
  u = G.toggleUse(u, G.ALL_PURPOSES);
  assert.deepEqual(u, [G.ALL_PURPOSES]);
  u = G.toggleUse(u, "my employer");
  assert.deepEqual(u, ["my employer"]);
  assert.deepEqual(G.toggleUse(["my employer"], "my employer"), []);
});

test("All purposes wording", () => {
  const s = G.suggestedPurpose("loss_general", "loss", {}, [G.ALL_PURPOSES], "Ada Bello");
  assert.match(s, /That this affidavit is required for all lawful and official purposes\./);
  assert.doesNotMatch(s, /All purposes \(any office\)/);
});

test("every orderable type: numbered statements, fits one page even with long answers and every use", () => {
  for (const t of T.ORDERABLE_AFFIDAVIT_TYPES) {
    const s = G.suggestedPurpose(t.slug, t.category, LONG, ALL_USES, "Oluwaseun Adebayo Okonkwo-Williams");
    const lines = s.split("\n");
    lines.forEach((l, i) => assert.match(l, new RegExp(`^${i + 1}\\. That `), `${t.slug} line ${i + 1}`));
    const page = G.onePageCheck(s);
    assert.ok(page.ok, `${t.slug}: ${page.chars} chars, ${page.paragraphs} paragraphs`);
    assert.doesNotMatch(s, /—|regulated/i, t.slug);
  }
});

test("one-page check blocks long text", () => {
  assert.equal(G.onePageCheck("x".repeat(G.PURPOSE_MAX_CHARS)).ok, true);
  const tooLong = G.onePageCheck("x".repeat(G.PURPOSE_MAX_CHARS + 1));
  assert.equal(tooLong.ok, false);
  assert.match(tooLong.message, /fits on one page/);
  const tooMany = G.onePageCheck(Array.from({ length: G.PURPOSE_MAX_PARAGRAPHS + 1 }, (_, i) => `${i + 1}. That x.`).join("\n"));
  assert.equal(tooMany.ok, false);
});

test("certified copy help points to the Vault for a fresh copy", () => {
  assert.match(G.COPIES_HELP, /subscribe to our Vault service and download it any time you need it\./);
});
