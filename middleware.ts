import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const defaultUrl = 'https://cwcoqkrihwyniyucrqai.supabase.co'
const defaultKey = 'sb_publishable_BC3nOHNjKeXN76x2OtCH5w_94ljBkID'

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/["'\s]/g, '')
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.replace(/["'\s]/g, '')

const SUPABASE_URL = envUrl && envUrl.startsWith('http') ? envUrl : defaultUrl
const SUPABASE_ANON_KEY = envKey && envKey.length > 10 ? envKey : defaultKey

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isKasirRoute = request.nextUrl.pathname.startsWith('/kasir')
  const isKasirLogin = request.nextUrl.pathname === '/kasir/login'

  if (isKasirRoute && !isKasirLogin) {
    if (!user) {
      return NextResponse.redirect(new URL('/kasir/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'cashier' && profile.role !== 'admin')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/kasir/:path*'],
}
