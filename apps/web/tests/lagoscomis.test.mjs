// node --test tests/lagoscomis.test.mjs   (from apps/web)
// #184 / #206: every orderable affidavit has its LagosCoMiS form, except Declaration of Death
// (LPA s.22, Sheriff 2 Nov 2026). The video question stays open until Sheriff answers.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = fs.mkdtempSync(path.join(os.tmpdir(), "df-comis-"));
const load = async (name) => {
  const src = fs.readFileSync(path.resolve(here, `../lib/${name}.ts`), "utf8");
  fs.writeFileSync(path.join(out, `${name}.mjs`), ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText);
  return import(pathToFileURL(path.join(out, `${name}.mjs`)).href);
};
const F = await load("lagoscomisForms");
const T = await load("affidavitTypes");

test("every affidavit type except Declaration of Death has a court form", () => {
  for (const t of T.AFFIDAVIT_TYPES) {
    const m = F.courtFormFor(t.slug);
    if (t.slug === "declaration_of_death") assert.equal(m.form, null, "must stay unmapped (LPA s.22)");
    else if (t.slug === "attestation_birth_cert") assert.equal(m.form, null, "probably NPC, not LagosCoMiS (JSB 2 Nov)");
    else assert.ok(m.form && m.form.length > 2, `${t.slug} has no form`);
  }
});

test("no mapping for a type that does not exist, and the video is not yet confirmed", () => {
  const slugs = new Set(T.AFFIDAVIT_TYPES.map((t) => t.slug));
  for (const k of Object.keys(F.LAGOSCOMIS_FORMS)) assert.ok(slugs.has(k), `unknown type ${k}`);
  for (const [k, m] of Object.entries(F.LAGOSCOMIS_FORMS)) {
    if (k === "declaration_of_death") assert.equal(m.needsVideo, true, "JSB 2 Nov: needs the video");
    else assert.equal(m.needsVideo, null, k);
  }
});

test("JSB's 2 Nov decisions on the types Sheriff's list did not name", () => {
  for (const s of ["release_of_corpse", "confirmation_of_result", "change_of_residence", "loss_sim_no_id"])
    assert.equal(F.courtFormFor(s).form, F.GENERAL, s);
  assert.equal(F.courtFormFor("addition_removal_of_name").form, "Correction of name");
});

test("any type without its own form falls under General or Custom, except the two held back", () => {
  assert.equal(F.courtFormFor("some_new_affidavit").form, F.GENERAL);
  assert.match(F.GENERAL, /General Affidavit/);
  assert.match(F.GENERAL, /Custom affidavit/);
  for (const s of F.NOT_FILED_ON_LAGOSCOMIS) assert.equal(F.courtFormFor(s).form, null, s);
});
