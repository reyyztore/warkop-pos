'use client'

import { useEffect } from 'react'
import './globals.css' // Sesuaikan jika ada impor CSS global kamu

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Registrasi Service Worker di browser
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Service Worker terdaftar:', reg.scope))
        .catch((err) => console.error('Gagal registrasi Service Worker:', err))
    }
  }, [])

  return (
    <html lang="id">
      <head>
        <title>Reyyztore POS</title>
        <meta name="theme-color" content="#dc2626" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="antialiased bg-slate-50 text-slate-800">
        {children}
      </body>
    </html>
  )
}
