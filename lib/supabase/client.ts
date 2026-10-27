import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const defaultUrl = 'https://cwcoqkrihwyniyucrqai.supabase.co'
  const defaultKey = 'sb_publishable_BC3nOHNjKeXN76x2OtCH5w_94ljBkID'

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/["'\s]/g, '')
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.replace(/["'\s]/g, '')

  const url = envUrl && envUrl.startsWith('http') ? envUrl : defaultUrl
  const key = envKey && envKey.length > 10 ? envKey : defaultKey

  return createBrowserClient(url, key)
}
