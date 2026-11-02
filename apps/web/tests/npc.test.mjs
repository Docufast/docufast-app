// node --test tests/npc.test.mjs   (from apps/web)
// #101: the nine NPC services. Assisted only, consent on every form, children blocked until #200,
// NGN 5,000 service fee always an estimate (NPC fee at cost), wording rules from Playbook 7.3.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const web = path.resolve(here, "..");
const out = fs.mkdtempSync(path.join(os.tmpdir(), "df-npc-"));
for (const f of ["npcForms", "serviceForms"]) {
  const src = fs.readFileSync(path.join(web, "lib", `${f}.ts`), "utf8");
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
  fs.writeFileSync(path.join(out, `${f}.mjs`), js.replace(/from "\.\/(\w+)"/g, 'from "./$1.mjs"'));
}
const N = await import(pathToFileURL(path.join(out, "npcForms.mjs")).href);
const S = await import(pathToFileURL(path.join(out, "serviceForms.mjs")).href);
const P = await import(pathToFileURL(path.join(web, "lib", "servicePricing.js")).href);
const q = (slug, form = {}) => P.priceOrder({ service_category: "npc", order_type: slug, form_data: form });
const fields = (f) => f.sections.flatMap((s) => s.fields);

test("nine NPC services, matching the price file, findable by slug, off by default", () => {
  assert.equal(N.NPC_FORMS.length, 9);
  assert.deepEqual(N.NPC_FORMS.map((f) => f.slug).sort(), [...P.NPC_SLUGS].sort());
  for (const f of N.NPC_FORMS) assert.equal(S.getServiceForm("npc", f.slug)?.slug, f.slug);
  assert.equal(N.NPC_SERVICES_ENABLED, false);
  assert.equal(N.CHILD_ORDERS_ENABLED, false);
});

test("every form asks for consent, required", () => {
  for (const f of N.NPC_FORMS) {
    const c = fields(f).find((x) => x.key === "consent");
    assert.ok(c && c.required, f.slug);
    assert.match(c.options[0].label, /help me complete this NPC application/);
  }
});

test("a child's record is blocked until the parental consent step (#200) is live", () => {
  for (const f of N.NPC_FORMS) {
    const who = fields(f).find((x) => x.key === "record_of");
    if (!who) continue; // death notification, health facility
    if (who.options.some((o) => o.value === "My child (under 18)")) {
      assert.deepEqual(who.stop?.in, ["My child (under 18)"], f.slug);
      assert.equal(q(f.slug, { record_of: "My child (under 18)" }), null, `${f.slug}: no instant quote for a child`);
    }
  }
});

test("price: NGN 5,000 Docufast service, always an estimate, NPC fee at cost", () => {
  for (const f of N.NPC_FORMS) {
    const quote = q(f.slug, { record_of: "Mine (18 or over)" });
    assert.equal(quote.total, 5000, f.slug);
    assert.equal(quote.final, false, f.slug);
    assert.match(quote.note, /paid to NPC in full/);
  }
  assert.equal(q("npc_unknown"), null);
  assert.equal(P.serviceLabel("npc_birth_attestation"), "NPC birth attestation");
});

test("wording rules: no agent or partner claim, no em dashes, no 'regulated'", () => {
  const text = JSON.stringify(N.NPC_FORMS) + N.CHILD_STOP;
  assert.ok(!/NPC (agent|partner)|accredited|approved by NPC/i.test(text));
  assert.ok(!text.includes("—"));
  assert.ok(!/regulated/i.test(text));
  assert.ok(!/cause of death/i.test(text), "no health detail asked for");
});
