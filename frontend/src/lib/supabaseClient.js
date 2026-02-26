import { createClient } from '@supabase/supabase-js'

// Ces variables doivent être dans ton fichier .env à la racine du frontend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
