import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  const defaultUrl = 'https://cwcoqkrihwyniyucrqai.supabase.co'
  const defaultKey = 'sb_publishable_BC3nOHNjKeXN76x2OtCH5w_94ljBkID'

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/["'\s]/g, '')
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.replace(/["'\s]/g, '')

  const url = envUrl && envUrl.startsWith('http') ? envUrl : defaultUrl
  const key = envKey && envKey.length > 10 ? envKey : defaultKey

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Handled in middleware
          }
        },
      },
    }
  )
}
