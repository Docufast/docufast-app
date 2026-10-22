import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoute from "./routes/health.js";
import uploadRoute from "./routes/upload.js";
import adminOrdersRoute from "./routes/adminOrders.js";
import documentsRoute from "./routes/documents.js";
import paymentsRoute from "./routes/payments.js";
import paystackWebhookRoute from "./routes/paystackWebhook.js";
import shareRoute from "./routes/share.js";
import { sweepLateExpressOrders } from "./services/expressService.js";
import { sweepExpiredShares } from "./services/shareService.js";

dotenv.config();

const app = express();

// ALLOWED_ORIGINS is a comma-separated list, set per Railway environment
// (production vs staging each declare only their own frontend URL(s)).
// Falls back to localhost for local development.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  // Never a wildcard: only exact https origins (http allowed for localhost only).
  .filter((origin) => {
    const ok = origin !== "*" && /^(https:\/\/[a-z0-9.-]+|http:\/\/localhost(:\d+)?)$/i.test(origin);
    if (!ok) console.error(`ALLOWED_ORIGINS: ignoring "${origin}" (must be an exact https origin, no wildcard, no trailing slash).`);
    return ok;
  });

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (server-to-server, curl, health checks).
      // For disallowed origins, pass `false` (not an Error) so the request
      // still completes normally -- just without the CORS header -- instead
      // of triggering Express's default error handler (500) for everyone.
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    credentials: true,
  })
);
// Paystack webhook needs the raw body to check its signature, so it is mounted before
// express.json(). It is server-to-server: no CORS and no user token.
app.use("/webhooks/paystack", express.raw({ type: "application/json", limit: "1mb" }), paystackWebhookRoute);

app.use(express.json());

app.use("/health", healthRoute);
app.use("/upload", uploadRoute);
app.use("/admin/orders", adminOrdersRoute);
app.use("/documents", documentsRoute);
app.use("/orders", paymentsRoute);
app.use("/share", shareRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`docufast-api listening on port ${PORT}`);
});

// Background jobs, every 15 minutes. Both are safe to run on several instances at once.
// - Late Express refunds: only when EXPRESS_AUTO_REFUND=on (turn on once tested on staging).
// - Expired share links: their encrypted copies are deleted from storage.
const SWEEP_MS = 15 * 60 * 1000;
async function runSweeps() {
  if (process.env.EXPRESS_AUTO_REFUND === "on") {
    await sweepLateExpressOrders().catch((err) => console.error("Express sweep failed:", err.message));
  }
  await sweepExpiredShares().catch((err) => console.error("Share sweep failed:", err.message));
}
setTimeout(runSweeps, 60 * 1000);
setInterval(runSweeps, SWEEP_MS);
