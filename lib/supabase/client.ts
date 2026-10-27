import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cwcoqkrihwyniyucrqai.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_BC3nOHNjKeXN76x2OtCH5w_94ljBkID'

  return createBrowserClient(url, key)
}
