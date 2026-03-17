import { createClient } from '@supabase/supabase-js'

// Provide fallbacks so the app doesn't crash during development without env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseKey)
