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
app.use(cors());
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
