// Partner API, version 1 (#41, #112). Only a test endpoint for now, so a partner (for example
// TheNewspaperStand, #204, or Cubegroup for VARMS, #169) can prove its key and its server
// addresses work before any real endpoint is opened. Real endpoints are added here, each behind
// requirePartnerKey with its own scope.
import { Router } from "express";
import { requirePartnerKey } from "../lib/partnerAuth.js";

const router = Router();

// GET /partner/v1/ping: 200 only with a valid key, used from an allowed address.
router.get("/v1/ping", requirePartnerKey("ping"), (req, res) => {
  res.json({
    ok: true,
    partner: req.partner.partnerName,
    environment: req.partner.environment,
    time: new Date().toISOString(),
  });
});

export default router;
