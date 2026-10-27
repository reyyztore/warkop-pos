import './globals.css'

export const metadata = {
  title: 'Warkop POS',
  description: 'Sistem Pemesanan Warung Kopi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 min-h-screen text-slate-800 antialiased">
        {children}
      </body>
    </html>
  )
}
