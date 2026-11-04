import { Router } from "express";
import { supabaseAdmin } from "../lib/verifyFounder.js";

const router = Router();

// GET /health — liveness only: the process is up. Railway's deploy check uses this, so it must not
// depend on the database (a short Supabase blip must not make Railway kill a healthy deploy).
router.get("/", (req, res) => {
  res.json({ status: "ok", service: "docufast-api", timestamp: new Date().toISOString() });
});

// GET /health/ready — readiness (test report D7, 4 Nov 2026): can we reach the database right now?
// Point the outside uptime monitor here. 503 when the database does not answer within 3 seconds.
// Shows no data: only ok/down per dependency.
export async function checkDatabase(client = supabaseAdmin, timeoutMs = 3000) {
  const query = client.from("payments").select("id", { head: true, count: "exact" }).limit(1);
  const timeout = new Promise((resolve) => setTimeout(() => resolve({ error: { message: "timeout" } }), timeoutMs));
  const { error } = await Promise.race([query, timeout]);
  return !error;
}

router.get("/ready", async (req, res) => {
  const started = Date.now();
  let database = false;
  try { database = await checkDatabase(); } catch { database = false; }
  const ok = database;
  res.setHeader("Cache-Control", "no-store");
  res.status(ok ? 200 : 503).json({ status: ok ? "ok" : "degraded", database: database ? "ok" : "down", ms: Date.now() - started, timestamp: new Date().toISOString() });
});

export default router;
