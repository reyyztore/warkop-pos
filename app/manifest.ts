import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Reyyztore POS',
    short_name: 'Reyyztore',
    description: 'Sistem Kasir & Pemesanan Digital Warkop Modern',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#dc2626',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
