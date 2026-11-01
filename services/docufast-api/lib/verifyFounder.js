import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Reads the "aal" claim from an access token. Only used after getUser() has verified the token.
function tokenAal(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const aal = JSON.parse(Buffer.from(payload, "base64").toString("utf8"))?.aal;
    return typeof aal === "string" ? aal : null;
  } catch {
    return null;
  }
}

// Verifies the request's Authorization header belongs to a signed-in user
// with role = 'founder'. Returns the user object on success, or null.
export async function verifyFounder(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "founder") return null;
  if (tokenAal(token) !== "aal2") return null; // two-factor is compulsory

  return user;
}

export { supabaseAdmin, tokenAal };
