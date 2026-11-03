// node --test tests/seo.test.mjs   (from apps/web)
// AI visibility (#132, #133): the name, legal name and RC number travel together; NPC wording
// follows Playbook 7.3 and the switch; the sitemap lists every orderable affidavit and nothing hidden.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const web = path.resolve(here, "..");

async function load(npc) {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "df-seo-"));
  const tx = (src) => ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
  fs.writeFileSync(path.join(out, "facts.mjs"), tx(fs.readFileSync(path.join(web, "lib/seo/facts.ts"), "utf8")));
  fs.writeFileSync(path.join(out, "affidavitTypes.mjs"), tx(fs.readFileSync(path.join(web, "lib/affidavitTypes.ts"), "utf8")));
  const sm = tx(fs.readFileSync(path.join(web, "app/sitemap.ts"), "utf8"))
    .replace(/from ['"]@\/lib\/seo\/facts['"]/, "from './facts.mjs'")
    .replace(/from ['"]@\/lib\/affidavitTypes['"]/, "from './affidavitTypes.mjs'");
  fs.writeFileSync(path.join(out, "sitemap.mjs"), sm);
  const old = process.env.NEXT_PUBLIC_NPC_SERVICES_ENABLED;
  if (npc) process.env.NEXT_PUBLIC_NPC_SERVICES_ENABLED = "on"; else delete process.env.NEXT_PUBLIC_NPC_SERVICES_ENABLED;
  const F = await import(pathToFileURL(path.join(out, "facts.mjs")).href);
  const A = await import(pathToFileURL(path.join(out, "affidavitTypes.mjs")).href);
  const S = await import(pathToFileURL(path.join(out, "sitemap.mjs")).href);
  if (old === undefined) delete process.env.NEXT_PUBLIC_NPC_SERVICES_ENABLED; else process.env.NEXT_PUBLIC_NPC_SERVICES_ENABLED = old;
  return { F, A, S };
}

const BANNED = [/—/, /regulated/i, /NPC agent/i, /NPC partner/i, /flypoint/i];

test("Docufast Nigeria comes first, with legal name and RC number in the identity line", async () => {
  const { F } = await load(false);
  assert.equal(F.FACTS.alternateNames[0], "Docufast Nigeria");
  assert.match(F.FACTS.identityLine, /^Docufast Nigeria \(Docufast Integrated Services Limited, RC 1893484\)/);
});

test("NPC wording follows the switch and never says registrations online", async () => {
  const off = (await load(false)).F.FACTS.oneLine;
  const on = (await load(true)).F.FACTS.oneLine;
  assert.doesNotMatch(off, /registrations online/);
  assert.match(off, /NPC birth and death applications is coming soon/);
  assert.match(on, /helps you complete your NPC birth and death applications/);
  for (const s of [off, on]) for (const b of BANNED) assert.doesNotMatch(s, b);
});

test("llms.txt: Docufast Nigeria, Monday to Friday, no banned words", () => {
  const t = fs.readFileSync(path.join(web, "public/llms.txt"), "utf8");
  assert.match(t, /^# Docufast Nigeria/);
  assert.match(t, /RC 1893484/);
  assert.match(t, /Monday to Friday, 8am to 6pm WAT/);
  assert.doesNotMatch(t, /registrations online/);
  for (const b of BANNED) assert.doesNotMatch(t, b);
});

test("sitemap: every orderable affidavit, no hidden ones, real dates, NPC only when on", async () => {
  const { A, S } = await load(false);
  const urls = S.default().map((u) => u.url);
  for (const t of A.ORDERABLE_AFFIDAVIT_TYPES) assert.ok(urls.includes(`https://www.docufast.ng/services/affidavits/${t.slug}`), t.slug);
  for (const t of A.AFFIDAVIT_TYPES.filter((t) => t.notOrderable)) assert.ok(!urls.some((u) => u.endsWith(`/${t.slug}`)), t.slug);
  assert.ok(!urls.some((u) => u.includes("/services/npc")));
  assert.equal(new Set(urls).size, urls.length, "no duplicates");
  for (const u of S.default()) assert.match(String(u.lastModified), /^2026-\d\d-\d\d$/);
  assert.ok(S.default().some((u) => u.lastModified !== "2026-10-11"), "dates are no longer all the same");
  const on = (await load(true)).S.default().map((u) => u.url);
  assert.ok(on.includes("https://www.docufast.ng/services/npc"));
});
