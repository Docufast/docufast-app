import { supabase } from "@/lib/supabase";

// Returns the message to show customers when new orders are paused, or null when orders are open.
// The database itself refuses the order while paused (migration 20261103_pause_orders.sql);
// this only lets the forms say why instead of a generic error.
export const DEFAULT_PAUSE_MESSAGE =
  "We are not taking new orders right now. Please check back soon, or message us on WhatsApp.";

export async function ordersPausedMessage(): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("site_flags")
      .select("value, message")
      .eq("key", "orders_paused")
      .maybeSingle();
    if (data?.value === true) return data.message || DEFAULT_PAUSE_MESSAGE;
  } catch {
    // If the flag cannot be read, fall back to the form's normal error.
  }
  return null;
}
