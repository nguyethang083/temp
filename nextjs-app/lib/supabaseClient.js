import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing. Check environment variables."
  );
  // Optionally throw an error or return a dummy client
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically refreshes the token when nearing expiry
    autoRefreshToken: true,
    // Stores the session in localStorage by default
    persistSession: true,
    // Detects session from URL (required for OAuth flows like password reset)
    detectSessionInUrl: true,
  },
});
