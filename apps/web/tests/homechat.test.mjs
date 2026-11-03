// node --test tests/homechat.test.mjs   (from apps/web)
// Home screen chat (Blueprint A1/D1, JSB 3 Nov 2026): what customers type reaches the right
// service, in English or Pidgin; every button opens a real page; prices come from the price file.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const web = path.resolve(here, "..");
const out = fs.mkdtempSync(path.join(os.tmpdir(), "df-chat-"));
const tx = (src) => ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
for (const f of ["homeChat", "homeChatPrices", "affidavitTypes", "serviceForms", "npcForms"]) {
  fs.writeFileSync(path.join(out, `${f}.mjs`), tx(fs.readFileSync(path.join(web, "lib", `${f}.ts`), "utf8"))
    .replace(/from "\.\/(\w+)"/g, 'from "./$1.mjs"')
    .replace(/from "\.\/servicePricing\.js"/g, `from "${pathToFileURL(path.join(web, "lib", "servicePricing.js")).href}"`));
}
const C = await import(pathToFileURL(path.join(out, "homeChat.mjs")).href);
const A = await import(pathToFileURL(path.join(out, "affidavitTypes.mjs")).href);
const S = await import(pathToFileURL(path.join(out, "serviceForms.mjs")).href);
const P = (await import(pathToFileURL(path.join(out, "homeChatPrices.mjs")).href)).chatPriceNotes();
const reply = (q) => C.replyTo(q, P);

const CASES = [
  ["I lost my SIM", "loss_sim", "/services/affidavits/loss_sim_card"],
  ["my phone line don lost", "loss_sim", "/services/affidavits/loss_sim_card"],
  ["someone stole my international passport", "loss_passport", "/services/affidavits/loss_intl_passport"],
  ["I lost a document", "loss_general", "/services/affidavits/loss_general"],
  ["I just got married and want to change my surname", "change_of_name", "/services/affidavits/change_of_name"],
  ["I wan change my name", "change_of_name", "/services/affidavits/change_of_name"],
  ["my name is spelt wrong on my certificate", "name_correction", "/services/affidavits/correction_of_name"],
  ["wrong date of birth on my NIN", "dob", "/services/affidavits/correction_of_dob"],
  ["register my business", "register_business", "/services/cac/business_name_registration"],
  ["I want to register a limited company", "register_business", "/services/cac/company_incorporation"],
  ["I have not filed annual returns for 3 years", "annual_returns", "/services/cac/cac_annual_returns"],
  ["is my company struck off", "annual_returns", "/services/cac/cac_annual_returns"],
  ["CAC status report", "status_report", "/services/cac/cac_status_report"],
  ["register our church", "trustees", "/services/cac/incorporated_trustees_registration"],
  ["newspaper notice", "newspaper", "/services/publications/name_change_publication"],
  ["typing and data entry", "typing", "/services/virtual-assistant/document_typing"],
  ["I need a bachelorhood affidavit", "single", "/services/affidavits/bachelorhood_spinsterhood"],
  ["release of corpse from mortuary", "death", "/services/affidavits/release_of_corpse"],
  ["how do I verify a document", "verify", "/verify"],
  ["change of address", "other_affidavit", "/services/affidavits/change_of_residence"],
];

test("what customers type reaches the right service", () => {
  for (const [q, intent, href] of CASES) {
    const r = reply(q);
    assert.equal(r.intent, intent, q);
    assert.ok(r.actions.some((a) => a.href === href), `${q} -> ${r.actions.map((a) => a.href).join(", ")}`);
  }
});

test("unknown questions offer the question form and WhatsApp; greetings and empty input are handled", () => {
  const r = reply("qwerty zxcv");
  assert.equal(r.intent, "unknown"); assert.ok(r.ask && r.whatsapp);
  assert.equal(reply("how far").intent, "greeting");
  assert.equal(reply("   ").intent, "empty");
  assert.ok(reply("talk to a person").whatsapp);
});

test("every button opens a real, orderable page", () => {
  const fixed = new Set(["/services", "/services/affidavits", "/services/publications", "/services/cac", "/services/notarization", "/services/npc", "/verify", "/faq", "https://wa.me/2349054951918"]);
  const queries = [...CASES.map((c) => c[0]), "notarization", "NGO", "birth certificate", "how much", "affidavit", "divorce", "sponsorship letter", "good conduct", "change of signature", "I sold my car", "WAEC result", "lost my driver's licence", "lost my school id", "lost work id", "lost car papers", "jamb sim lost", "change of director"];
  for (const q of queries) for (const a of reply(q).actions) {
    if (fixed.has(a.href)) continue;
    const m = a.href.match(/^\/services\/(affidavits|cac|publications|virtual-assistant)\/([a-z_]+)$/);
    assert.ok(m, `${q}: ${a.href}`);
    if (m[1] === "affidavits") {
      const t = A.getAffidavitType(m[2]);
      assert.ok(t && !t.notOrderable, `${q}: ${m[2]} must be orderable`);
    } else {
      const cat = { cac: "cac", publications: "publication", "virtual-assistant": "virtual_assistant" }[m[1]];
      assert.ok(S.getServiceForm(cat, m[2]), `${q}: ${a.href}`);
    }
  }
  for (const q of C.QUICK_REPLIES) assert.ok(q.href.startsWith("/services"), q.label);
});

test("prices come from the price file; no NPC price; house rules", () => {
  const r = reply("change of name");
  assert.equal(r.actions.find((a) => a.href.endsWith("/change_of_name")).note, "NGN 4,000");
  assert.equal(reply("register my business").actions[0].note, "NGN 40,000");
  const npc = reply("birth certificate");
  assert.match(npc.text, /coming soon/);
  assert.ok(npc.actions.every((a) => !a.note));
  const src = fs.readFileSync(path.join(web, "lib", "homeChat.ts"), "utf8") + fs.readFileSync(path.join(web, "components", "HomeChat.tsx"), "utf8");
  assert.doesNotMatch(src, /—|regulated|paystack|flutterwave|NPC agent|NPC partner/i);
});

test("languages: English only until reviewed translations are switched on", () => {
  assert.deepEqual(C.enabledLanguages(undefined), ["en"]);
  assert.deepEqual(C.enabledLanguages("en,pcm"), ["en", "pcm"]);
  assert.deepEqual(C.enabledLanguages("pcm,xx"), ["en", "pcm"]);
  assert.equal(C.ui("pcm", "send"), "Send"); // falls back to English until #120 fills it
  assert.equal(C.LANGUAGES.length, 5);
});

test("greeting follows Lagos time", () => {
  assert.equal(C.greeting(new Date("2026-11-03T07:00:00Z")), "Good morning");
  assert.equal(C.greeting(new Date("2026-11-03T13:00:00Z")), "Good afternoon");
  assert.equal(C.greeting(new Date("2026-11-03T19:00:00Z")), "Good evening");
});
