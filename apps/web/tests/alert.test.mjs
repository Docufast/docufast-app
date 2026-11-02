// node --test tests/alert.test.mjs  Team alert for new help chat questions carries no customer details.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.resolve(here, "../lib/teamAlert.ts"), "utf8");
const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "df-alert-")), "teamAlert.mjs");
fs.writeFileSync(out, ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText);
const { alertNewQuestion } = await import(pathToFileURL(out).href);

test("sends to the team with no customer details", async () => {
  const calls = [];
  globalThis.fetch = async (url, init) => { calls.push({ url, body: JSON.parse(init.body) }); return { ok: true }; };
  process.env.SENDGRID_API_KEY = "SG.test"; process.env.OPS_ALERT_EMAILS = "a@docufast.ng, b@docufast.ng";
  await alertNewQuestion({ replyBy: "WhatsApp", page: "/services/affidavits/loss_sim_card" });
  assert.equal(calls.length, 1);
  const b = calls[0].body;
  assert.deepEqual(b.personalizations[0].to, [{ email: "a@docufast.ng" }, { email: "b@docufast.ng" }]);
  const text = b.content[0].value;
  assert.match(text, /Reply by: WhatsApp/);
  assert.match(text, /\/admin/);
  assert.ok(!/@example|\+234|question:/i.test(text));
});

test("does nothing without a key or recipients, and never throws", async () => {
  let n = 0; globalThis.fetch = async () => { n++; throw new Error("network"); };
  delete process.env.OPS_ALERT_EMAILS;
  await alertNewQuestion({ replyBy: "email", page: null });
  assert.equal(n, 0);
  process.env.OPS_ALERT_EMAILS = "a@docufast.ng";
  await alertNewQuestion({ replyBy: "email", page: null }); // fetch throws: swallowed
  assert.equal(n, 1);
});
