import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client — safe to use in browser components.
// Uses the public anon key, which respects Row Level Security policies.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
