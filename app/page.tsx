'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null)

  const articles = [
    {
      id: 1,
      title: '1. Cara Meningkatkan Omzet Warkop Hingga 2x Lipat Dengan QR Menu',
      desc: 'Penggunaan sistem pesan otomatis berbasis QR Code memangkas waktu tunggu antrean hingga 60%.',
      content: 'Di era digital, kecepatan pelayanan adalah kunci utama kepuasan pelanggan warkop. Dengan QR Menu Reyyztore, pelanggan tidak perlu menunggu kasir membawa menu fisik. Mereka cukup scan, pilih, dan bayar seketika. Efisiensi ini memungkinkan warkop melayani lebih banyak meja dalam satu sesi jam sibuk.'
    },
    {
      id: 2,
      title: '2. Mengapa Kasir Digital Multi-Tenant Penting untuk Bisnis Modern',
      desc: 'Sistem cloud memungkinkan pemilik toko mengontrol stok dan laporan dari mana saja.',
      content: 'Manajemen kasir tradisional rentan terhadap kesalahan pencatatan manual. Sistem multi-tenant Reyyztore memastikan data transaksi, riwayat stok, dan laporan keuangan Anda tersimpan aman secara realtime di cloud tanpa risiko hilang.'
    },
    {
      id: 3,
      title: '3. Strategi Retention: Bikin Pelanggan Betah Lewat Mini Games',
      desc: 'Mini games interaktif di meja terbukti menaikkan durasi nongkrong dan jumlah pesanan tambahan.',
      content: 'Saat menunggu pesanan dibuat, pelanggan seringkali merasa bosan. Reyyztore menyediakan 10 Mini Games interaktif langsung di smartphone pelanggan tanpa perlu install aplikasi. Pelanggan gembira, dwell time meningkat, dan pesanan minuman tambahan pun bertambah!'
    },
    {
      id: 4,
      title: '4. Pentingnya Fitur Bel Panggil Kasir di Setiap Meja',
      desc: 'Memudahkan interaksi antara pelanggan dan staf kasir tanpa perlu berteriak.',
      content: 'Fitur Bel Panggil Meja terintegrasi secara realtime dengan Dashboard Kasir. Ketika pelanggan menekan bel di layar handphone mereka, suara dering dan notifikasi nomor meja langsung berbunyi di meja kasir.'
    },
    {
      id: 5,
      title: '5. Bebas Error: Eliminasi Kebocoran Kas Menggunakan QRIS Otomatis',
      desc: 'Metode pembayaran cashless meminimalisir risiko uang kembalian salah dan fraud.',
      content: 'Pembayaran tunai kerap menyisakan masalah kembalian berantakan dan selisih kas bulanan. Reyyztore mendukung integrasi QRIS Toko langsung, di mana pelanggan bisa mengunggah bukti transfer yang terverifikasi instan oleh kasir.'
    },
    {
      id: 6,
      title: '6. Cara Membangun Brand Identity Warkop Yang Unik & Diingat',
      desc: 'Kustomisasi warna tema dan logo toko sesuai ciri khas warkop Anda.',
      content: 'Setiap warkop punya estetika sendiri. Reyyztore memungkinkan pemilik toko menyesuaikan warna background, foto banner promosi, hingga logo toko agar identitas visual warkop Anda tetap konsisten.'
    },
    {
      id: 7,
      title: '7. Mengelola Jam Operasional Toko Secara Realtime dari Handphone',
      desc: 'Kunci tombol pemesanan saat stok habis atau warkop tutup.',
      content: 'Ketika bahan baku habis atau toko tiba-tiba harus tutup mendadak, Anda cukup menggeser tombol Buka/Tutup di dashboard kasir. Sistem pelanggan akan langsung mengunci pemesanan otomatis.'
    },
    {
      id: 8,
      title: '8. Efisiensi Biaya Operasional Dengan Sistem Tanpa Kertas',
      desc: 'Hemat biaya cetak kertas fisik dan kertas struk dengan pesanan digital.',
      content: 'Pencetakan menu kertas berkali-kali saat ada perubahan harga membutuhkan biaya tinggi. Dengan Reyyztore, update harga menu dapat dilakukan kapan saja tanpa membuang biaya cetak.'
    },
    {
      id: 9,
      title: '9. Tips Mengatur Tata Letak QR Barcode Meja Agar Tahan Lama',
      desc: 'Gunakan acrylic holder dan sticker vinyl waterproof di setiap nomor meja.',
      content: 'Satu QR Code per meja dapat digunakan selamanya. Pasang cetakan QR pada acrylic holder di meja warkop Anda agar tidak rusak terkena tumpahan air kopi atau makanan.'
    },
    {
      id: 10,
      title: '10. Panduan Lengkap Registrasi & Aktivasi Toko Baru di Reyyztore',
      desc: 'Langkah mudah mulai dari pendaftaran akun hingga toko Anda aktif melayani pesanan.',
      content: 'Proses pendaftaran toko baru sangat cepat. Cukup klik tombol "Daftar Toko Baru", isi nama toko dan buat kata sandi. Setelah akun disetujui oleh Super Admin, warkop Anda siap mengudara!'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20 selection:bg-sky-200">
      
      {/* Top Navbar Glass Effect */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-sky-200/60 p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-red-600 tracking-wider">REYYZTORE</span>
            <span className="text-[10px] font-bold px-2.5 py-1 bg-sky-100/80 border border-sky-300/50 text-sky-700 rounded-full backdrop-blur-md">
              POS SYSTEM
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/kasir/login" className="px-4 py-2 bg-white/80 border border-sky-200/80 text-xs font-bold text-sky-900 rounded-2xl hover:bg-sky-50 backdrop-blur-md shadow-sm transition">
              Login Kasir
            </Link>
            <Link href="/kasir/login?mode=register" className="px-5 py-2.5 bg-sky-500/90 hover:bg-sky-600 text-white text-xs font-black rounded-2xl shadow-md shadow-sky-300/40 backdrop-blur-md transition">
              Daftar Toko Baru
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center px-4 pt-16 pb-12 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-100/80 border border-sky-300/60 text-sky-800 text-xs font-bold rounded-full backdrop-blur-md shadow-sm">
          <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          <span>Platform Kasir Multi-Tenant & POS Interaktif</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
          Transformasi Warkop Anda Menjadi <span className="text-red-600">Warkop Digital Modern</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Sistem pemesanan meja otomatis berbasis QR Code, dilengkapi Mini Games interaktif, panggilan bel kasir realtime, dan laporan keuangan pintar.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link href="/kasir/login?mode=register" className="px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-sky-200/80 transition active:scale-95 flex items-center justify-center gap-2">
            <span>Mulai Gunakan Sekarang</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
          <a
            href="https://wa.me/6285150725531?text=Halo%20Reyyztore,%20saya%20tertarik%20menggunakan%20sistem%20Warkop%20POS"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-white/80 border border-sky-200 text-sky-900 hover:bg-sky-50 font-black text-sm rounded-2xl shadow-sm backdrop-blur-md flex items-center justify-center gap-2 transition"
          >
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
            <span>Tanya via WhatsApp (085150725531)</span>
          </a>
        </div>
      </section>

      {/* Benefit Grid Kaca Transparan */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl font-black text-slate-900">Keunggulan Utama Reyyztore POS</h2>
          <p className="text-xs text-slate-500">Fitur cerdas yang siap mengoptimalkan operasional toko Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/70 backdrop-blur-md border border-sky-200/70 p-6 rounded-3xl space-y-3 shadow-md shadow-sky-100/50">
            <div className="w-12 h-12 rounded-2xl bg-sky-100/80 border border-sky-300/50 flex items-center justify-center text-sky-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">QR Code Per Meja</h3>
            <p className="text-xs text-slate-600">Pelanggan cukup melakukan pemindaian barcode tanpa perlu mengunduh aplikasi tambahan.</p>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-sky-200/70 p-6 rounded-3xl space-y-3 shadow-md shadow-sky-100/50">
            <div className="w-12 h-12 rounded-2xl bg-sky-100/80 border border-sky-300/50 flex items-center justify-center text-sky-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">Bel Panggil Realtime</h3>
            <p className="text-xs text-slate-600">Pelanggan dapat memanggil staf kasir langsung dari meja dengan nada panggil jernih.</p>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-sky-200/70 p-6 rounded-3xl space-y-3 shadow-md shadow-sky-100/50">
            <div className="w-12 h-12 rounded-2xl bg-sky-100/80 border border-sky-300/50 flex items-center justify-center text-sky-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">10 Mini Games Interaktif</h3>
            <p className="text-xs text-slate-600">Pengalaman menunggu hidangan menjadi menyenangkan dengan permainan di dalam web.</p>
          </div>
        </div>
      </section>

      {/* Founder & Brand Card Glass */}
      <section className="max-w-4xl mx-auto mx-4 bg-white/70 backdrop-blur-md border border-sky-200/80 p-8 rounded-3xl text-center space-y-3 shadow-md my-8">
        <h3 className="text-xl font-black text-red-600">REYYZTORE</h3>
        <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
          Platform dikembangkan secara penuh oleh <strong>Reyyztore</strong> di bawah naungan founder <strong>Raihan Aji Saputra</strong>.
        </p>
        <p className="text-xs text-sky-800 font-bold">Email Founder: <a href="mailto:sraihanaji@gmail.com" className="text-sky-600 hover:underline">sraihanaji@gmail.com</a></p>
      </section>

      {/* Artikel Edukasi Owner Toko */}
      <section className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="border-b border-sky-200 pb-4">
          <h2 className="text-xl font-black text-slate-900">Artikel & Panduan Bisnis Warkop</h2>
          <p className="text-xs text-slate-500 mt-1">Panduan pengelolaan usaha warkop dari tim Reyyztore.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((art) => (
            <div key={art.id} className="bg-white/70 backdrop-blur-md border border-sky-200/70 p-5 rounded-2xl space-y-2 hover:border-sky-300 transition shadow-sm">
              <h3 className="text-sm font-bold text-sky-900">{art.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2">{art.desc}</p>
              <button
                onClick={() => setSelectedArticle(art)}
                className="text-[11px] font-black text-sky-600 hover:underline pt-1 flex items-center gap-1"
              >
                <span>Baca Selengkapnya</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Artikel Glass Kaca */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl border border-sky-200 text-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-base font-black text-sky-900">{selectedArticle.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{selectedArticle.content}</p>
            <button
              onClick={() => setSelectedArticle(null)}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Tutup Artikel
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 pt-12 border-t border-sky-200 text-center text-xs text-slate-500 space-y-1">
        <p>© 2026 <strong className="text-red-600">Reyyztore</strong>. Founder: Raihan Aji Saputra.</p>
        <p>Email: sraihanaji@gmail.com | WhatsApp: 085150725531</p>
      </footer>
    </div>
  )
}
