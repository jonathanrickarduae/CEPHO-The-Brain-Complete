import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Use a placeholder when keys are absent so the module loads without throwing.
// The app uses PIN-gate auth in this mode; Supabase auth is optional.
const resolvedUrl = supabaseUrl || "https://placeholder.supabase.co";
const resolvedKey = supabaseAnonKey || "placeholder-anon-key-not-real-000000000000";

export const supabase = createClient(resolvedUrl, resolvedKey, {
  auth: {
    autoRefreshToken: supabaseAnonKey ? true : false,
    persistSession: supabaseAnonKey ? true : false,
    detectSessionInUrl: supabaseAnonKey ? true : false,
    storage: window.localStorage,
  },
});
