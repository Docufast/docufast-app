import { S3Client } from "@aws-sdk/client-s3";

// R2 is S3-compatible, so we use the standard AWS SDK pointed at
// Cloudflare's endpoint instead of AWS's.
export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
  },
});

export const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME;
