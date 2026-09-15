import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ status: "ok", service: "bluetentbc-api", timestamp: new Date().toISOString() });
});

export default router;
