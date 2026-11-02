import express from "express";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { r2Client, R2_BUCKET } from "../lib/r2Client.js";
import { supabaseAdmin } from "../lib/verifyFounder.js";

const router = express.Router();

// Files are held in memory briefly, then streamed straight to R2 —
// never written to this server's disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB cap
});

// Only signed-in users can upload. Before this, anyone on the internet could write files into
// our storage. The sign-in is checked before multer reads the file.
async function requireUser(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Please sign in to upload files." });
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Please sign in to upload files." });
  req.user = user;
  next();
}

router.post("/", requireUser, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided." });
  }

  // Namespaced key so files never collide across users.
  const key = `${randomUUID()}-${req.file.originalname}`.slice(0, 200);

  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    res.json({
      success: true,
      key,
      fileName: req.file.originalname,
      size: req.file.size,
    });
  } catch (err) {
    console.error("R2 upload failed:", err);
    res.status(500).json({ error: "Upload failed. Please try again." });
  }
});

export default router;
