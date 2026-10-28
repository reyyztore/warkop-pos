import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const supabase = createClient()
  const slug = params.slug

  // Ambil data toko spesifik dari Supabase
  const { data: store } = await supabase
    .from('stores')
    .select('store_name, avatar_url')
    .eq('slug', slug)
    .single()

  const storeName = store?.store_name || 'Warkop Digital'
  const storeAvatar = store?.avatar_url || '/icon-192.png'

  // Buat Manifest Dinamis sesuai Brand Toko X
  const manifest = {
    name: storeName,
    short_name: storeName,
    description: `Sistem Pemesanan Digital ${storeName}`,
    start_url: `/st/${slug}`,
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0284c7',
    icons: [
      {
        src: storeAvatar,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: storeAvatar,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  }

  return NextResponse.json(manifest)
}
