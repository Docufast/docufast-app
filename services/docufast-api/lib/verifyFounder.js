import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Reads the "aal" and "session_id" claims of an access token. Only used after getUser() has verified the token.
function tokenClaim(token, name) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const v = JSON.parse(Buffer.from(payload, "base64").toString("utf8"))?.[name];
    return typeof v === "string" ? v : null;
  } catch {
    return null;
  }
}

// Customer second step (JSB and Olamide, 1 Nov 2026; Playbook 10.1): needed to open or download
// documents and create share links, NOT before payment. Met by the authenticator app (aal2) or by
// an emailed code (#220 step-up, 12 hours for this device session). Fails closed: if the #220
// migration is not installed, or anything goes wrong, only aal2 passes.
export async function customerSecondStep(token, userId) {
  if (tokenClaim(token, "aal") === "aal2") return true;
  const sid = tokenClaim(token, "session_id");
  if (!sid) return false;
  try {
    const { data, error } = await supabaseAdmin.rpc("step_up_active", { p_user: userId, p_session: sid });
    return !error && !!data;
  } catch {
    return false;
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

  return user;
}

export { supabaseAdmin };
