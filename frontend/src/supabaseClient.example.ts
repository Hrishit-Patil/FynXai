import { createClient } from '@supabase/supabase-js'
import { Database } from './types/supabase'

// =========================
// Supabase Setup Instructions:
// =========================
// 1. Go to Supabase Dashboard → Settings → API
// 2. Copy your "Project URL"
// 3. Copy your "anon public" key
// 4. Create a file named: supabaseClient.ts
// 5. Replace the placeholders below with your actual values
// =========================

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey)