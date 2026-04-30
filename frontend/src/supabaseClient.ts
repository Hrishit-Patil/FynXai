import { createClient } from "@supabase/supabase-js";
import { Database } from "./types/supabase";

// 1. Supabase Configuration
const SUPABASE_URL = import.meta.env.SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.SUPABASE_KEY;
// 2. Backend API Configuration
// This will pull from your Vercel/Local .env variable VITE_API_URL
export const apiBaseUrl = import.meta.env.VITE_API_URL;

// Validation for your presentation
if (!SUPABASE_URL || !apiBaseUrl) {
  console.warn(
    "Environment variables are missing! Backend or Supabase might not connect.",
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);
