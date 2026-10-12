import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoute from "./routes/health.js";
import uploadRoute from "./routes/upload.js";
import adminOrdersRoute from "./routes/adminOrders.js";
import documentsRoute from "./routes/documents.js";
import paymentsRoute from "./routes/payments.js";

dotenv.config();

const app = express();

// ALLOWED_ORIGINS is a comma-separated list, set per Railway environment
// (production vs staging each declare only their own frontend URL(s)).
// Falls back to localhost for local development.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

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
app.use(express.json());

app.use("/health", healthRoute);
app.use("/upload", uploadRoute);
app.use("/admin/orders", adminOrdersRoute);
app.use("/documents", documentsRoute);
app.use("/orders", paymentsRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`docufast-api listening on port ${PORT}`);
});
