import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoute from "./routes/health.js";
import uploadRoute from "./routes/upload.js";
import adminOrdersRoute from "./routes/adminOrders.js";
import documentsRoute from "./routes/documents.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/health", healthRoute);
app.use("/upload", uploadRoute);
app.use("/admin/orders", adminOrdersRoute);
app.use("/documents", documentsRoute);

// Placeholder routers for Phase 3 build-out — Order, Auth, Vault, Payment,
// KYC, Compliance, Admin APIs, plus CAC-specific sub-routes.
// app.use("/orders", ordersRoute);
// app.use("/auth", authRoute);
// app.use("/vault", vaultRoute);
// app.use("/cac", cacRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`docufast-api listening on port ${PORT}`);
});
