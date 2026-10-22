// POST /webhooks/paystack (#109). Paystack calls this when a charge succeeds.
// Set the webhook URL in the Paystack dashboard for each environment:
//   staging:    https://<staging API host>/webhooks/paystack   (test mode)
//   production: https://<production API host>/webhooks/paystack (live mode)
// The body is checked against the x-paystack-signature header before anything is trusted,
// and the payment is then verified again with Paystack's API before an order is marked paid.
import express from "express";
import { isValidWebhookSignature } from "../lib/paystack.js";
import { confirmPayment } from "../services/paymentService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const rawBody = req.body; // Buffer, from express.raw()
  if (!Buffer.isBuffer(rawBody) || !isValidWebhookSignature(rawBody, req.headers["x-paystack-signature"])) {
    return res.sendStatus(401);
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.sendStatus(400);
  }

  if (event?.event === "charge.success" && typeof event.data?.reference === "string") {
    try {
      const result = await confirmPayment(event.data.reference);
      if (result.outcome === "verify_failed") return res.sendStatus(500); // Paystack retries later
    } catch (err) {
      console.error("Webhook handling failed:", err.message);
      return res.sendStatus(500);
    }
  }

  // Acknowledge everything else so Paystack stops retrying.
  res.sendStatus(200);
});

export default router;
