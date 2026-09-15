import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoute from "./routes/health.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/health", healthRoute);

// Scope note (per latest agreement with JSB): BluetentBC's own workflow
// stays manual. This service's job is to send orders OUT to BluetentBC
// (email/WhatsApp notification) and receive status/documents BACK —
// not to replicate a full ops dashboard.
// app.use("/orders/outbound", outboundRoute);
// app.use("/orders/status", statusUpdateRoute);
// app.use("/documents/return", documentReturnRoute);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`bluetentbc-api listening on port ${PORT}`);
});
