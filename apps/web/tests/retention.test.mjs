// node --test tests/retention.test.mjs   (from apps/web)
// #213: unpaid quotes and orders are deleted 6 months after creation, with their uploads.
// Paid or filed orders are never touched. Off unless RETENTION_SWEEP is on or dry.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

process.env.SUPABASE_URL ||= "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "test-key";
process.env.CLOUDFLARE_R2_ENDPOINT ||= "https://example.r2.invalid"; process.env.CLOUDFLARE_R2_ACCESS_KEY ||= "test"; process.env.CLOUDFLARE_R2_SECRET_KEY ||= "test"; process.env.CLOUDFLARE_R2_BUCKET_NAME ||= "test";
const here = path.dirname(fileURLToPath(import.meta.url));
const R = await import(pathToFileURL(path.resolve(here, "../../../services/docufast-api/services/retentionService.js")).href);

const NOW = new Date("2026-11-02T12:00:00Z");
const old = "2026-04-01T00:00:00Z";    // 7 months before NOW
const recent = "2026-06-01T00:00:00Z"; // 5 months before NOW

test("cut-off is 6 months back", () => {
  assert.equal(R.cutoffDate(NOW).toISOString(), "2026-05-02T12:00:00.000Z");
});

test("upload keys come only from *_r2_key fields", () => {
  assert.deepEqual(R.uploadKeysOf({ id_r2_key: "a-id.jpg", photo_r2_key: "b.png", name: "Ada", other_r2_key: "", bad_r2_key: "../x" }), ["a-id.jpg", "b.png"]);
  assert.deepEqual(R.uploadKeysOf(null), []);
});

test("only old, unpaid, unfiled orders are chosen", () => {
  const orders = [
    { id: "1", status: "quote_pending", created_at: old },
    { id: "2", status: "quote_sent", created_at: old },
    { id: "3", status: "cancelled", created_at: old },
    { id: "4", status: "paid", created_at: old },
    { id: "5", status: "quote_sent", created_at: recent },
    { id: "6", status: "quote_sent", created_at: old },
    { id: "7", status: "quote_pending", created_at: old },
  ];
  const chosen = R.chooseStale(orders, { paidOrderIds: new Set(["6"]), filedOrderIds: new Set(["7"]), now: NOW }).map((o) => o.id);
  assert.deepEqual(chosen, ["1", "2", "3"]);
});

function fakeDb(rows, { payments = [], filings = [], failDeleteFor = null } = {}) {
  const deleted = [];
  const q = (table) => {
    const st = { table, filters: [] };
    const api = {
      select() { return api; }, in(c, v) { st.filters.push(["in", c, v]); return api; }, lt(c, v) { st.filters.push(["lt", c, v]); return api; },
      order() { return api; }, limit() { return Promise.resolve(run()); }, eq(c, v) { st.filters.push(["eq", c, v]); return api; },
      delete() { st.del = true; return api; },
      then(res, rej) { return Promise.resolve(run()).then(res, rej); },
    };
    function run() {
      if (st.del) {
        const id = st.filters.find((f) => f[0] === "eq")[2];
        if (id === failDeleteFor) return { error: { message: "blocked" } };
        deleted.push(id); return { error: null };
      }
      if (table === "orders") {
        const statuses = st.filters.find((f) => f[1] === "status")[2]; const before = st.filters.find((f) => f[0] === "lt")[2];
        return { data: rows.filter((r) => statuses.includes(r.status) && r.created_at < before), error: null };
      }
      if (table === "payments") return { data: payments.map((order_id) => ({ order_id })), error: null };
      if (table === "affidavit_filings") return { data: filings.map((order_id) => ({ order_id })), error: null };
    }
    return api;
  };
  return { from: q, deleted };
}
const fakeStorage = (failKey = null) => { const sent = []; return { sent, send: async (cmd) => { if (cmd.input.Key === failKey) throw new Error("r2 down"); sent.push(cmd.input.Key); } }; };
const quiet = { log() {}, error() {} };

test("off by default: nothing is read or deleted", async () => {
  const db = fakeDb([{ id: "1", status: "quote_sent", created_at: old }]);
  assert.deepEqual(await R.sweepStaleOrders({ mode: undefined, now: NOW, db, storage: fakeStorage(), log: quiet }), { skipped: true });
  assert.equal(db.deleted.length, 0);
});

test("dry run deletes nothing", async () => {
  const db = fakeDb([{ id: "1", status: "quote_sent", created_at: old, form_data: { id_r2_key: "k1" } }]);
  const storage = fakeStorage();
  const r = await R.sweepStaleOrders({ mode: "dry", now: NOW, db, storage, log: quiet });
  assert.equal(r.dryRun, 1); assert.equal(db.deleted.length, 0); assert.equal(storage.sent.length, 0);
});

test("on: deletes files then the order; keeps paid, filed and recent ones", async () => {
  const rows = [
    { id: "1", status: "quote_sent", created_at: old, form_data: { id_r2_key: "k1", photo_r2_key: "k2" } },
    { id: "2", status: "quote_pending", created_at: old, form_data: {} },
    { id: "3", status: "quote_sent", created_at: old, form_data: { id_r2_key: "k3" } },
    { id: "4", status: "quote_sent", created_at: recent, form_data: {} },
  ];
  const db = fakeDb(rows, { payments: ["3"] });
  const storage = fakeStorage();
  const r = await R.sweepStaleOrders({ mode: "on", now: NOW, db, storage, log: quiet });
  assert.deepEqual(db.deleted.sort(), ["1", "2"]);
  assert.deepEqual(storage.sent.sort(), ["k1", "k2"]);
  assert.equal(r.deleted, 2); assert.equal(r.kept, 1);
});

test("if a file cannot be deleted, the order row stays for the next sweep", async () => {
  const db = fakeDb([{ id: "1", status: "quote_sent", created_at: old, form_data: { id_r2_key: "k1" } }]);
  const r = await R.sweepStaleOrders({ mode: "on", now: NOW, db, storage: fakeStorage("k1"), log: quiet });
  assert.equal(r.deleted, 0); assert.equal(db.deleted.length, 0);
});
