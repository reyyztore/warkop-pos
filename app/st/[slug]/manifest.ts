import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/client'

export default async function manifest({
  params,
}: {
  params: { slug: string }
}): Promise<MetadataRoute.Manifest> {
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

  return {
    name: storeName,
    short_name: storeName,
    description: `Sistem Pemesanan Digital ${storeName}`,
    start_url: `/st/${slug}`,
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#10b981',
    icons: [
      {
        src: storeAvatar,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: storeAvatar,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
