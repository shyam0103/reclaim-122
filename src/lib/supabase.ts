import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const DEMO_MODE =
  import.meta.env.VITE_DEMO_MODE === 'true' || !url || !anonKey

export const supabase = DEMO_MODE
  ? null
  : createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true }
    })
