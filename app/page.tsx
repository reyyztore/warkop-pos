'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null)
  
  // State untuk shortcut direct redirect toko & meja
  const [targetSlug, setTargetSlug] = useState('')
  const [targetMeja, setTargetMeja] = useState('')

  const handleStoreRedirect = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetSlug.trim()) {
      alert('Masukkan nama toko atau slug terlebih dahulu.')
      return
    }
    const mejaQuery = targetMeja.trim() ? `?meja=${targetMeja.trim()}` : ''
    router.push(`/${targetSlug.trim().toLowerCase()}${mejaQuery}`)
  }

  const articles = [
    {
      id: 1,
      title: 'Cara Meningkatkan Omzet Warkop Hingga 2x Lipat Dengan QR Menu',
      desc: 'Penggunaan sistem pesan otomatis berbasis QR Code memangkas waktu tunggu antrean hingga 60%.',
      content: 'Di era digital, kecepatan pelayanan adalah kunci utama kepuasan pelanggan warkop. Dengan QR Menu Reyyztore, pelanggan tidak perlu menunggu kasir membawa menu fisik. Mereka cukup scan, pilih, dan bayar seketika. Efisiensi ini memungkinkan warkop melayani lebih banyak meja dalam satu sesi jam sibuk.'
    },
    {
      id: 2,
      title: 'Mengapa Kasir Digital Multi-Tenant Penting untuk Bisnis Modern',
      desc: 'Sistem cloud memungkinkan pemilik toko mengontrol stok dan laporan dari mana saja.',
      content: 'Manajemen kasir tradisional rentan terhadap kesalahan pencatatan manual. Sistem multi-tenant Reyyztore memastikan data transaksi, riwayat stok, dan laporan keuangan Anda tersimpan aman secara realtime di cloud tanpa risiko hilang.'
    },
    {
      id: 3,
      title: 'Strategi Retention: Bikin Pelanggan Betah Lewat Mini Games',
      desc: 'Mini games interaktif di meja terbukti menaikkan durasi nongkrong dan jumlah pesanan tambahan.',
      content: 'Saat menunggu pesanan dibuat, pelanggan seringkali merasa bosan. Reyyztore menyediakan 10 Mini Games interaktif langsung di smartphone pelanggan tanpa perlu install aplikasi. Pelanggan gembira, dwell time meningkat, dan pesanan minuman tambahan pun bertambah!'
    },
    {
      id: 4,
      title: 'Pentingnya Fitur Bel Panggil Kasir di Setiap Meja',
      desc: 'Memudahkan interaksi antara pelanggan dan staf kasir tanpa perlu berteriak.',
      content: 'Fitur Bel Panggil Meja terintegrasi secara realtime dengan Dashboard Kasir. Ketika pelanggan menekan bel di layar handphone mereka, suara dering dan notifikasi nomor meja langsung berbunyi di meja kasir.'
    },
    {
      id: 5,
      title: 'Bebas Error: Eliminasi Kebocoran Kas Menggunakan QRIS Otomatis',
      desc: 'Metode pembayaran cashless meminimalisir risiko uang kembalian salah dan fraud.',
      content: 'Pembayaran tunai kerap menyisakan masalah kembalian berantakan dan selisih kas bulanan. Reyyztore mendukung integrasi QRIS Toko langsung, di mana pelanggan bisa mengunggah bukti transfer yang terverifikasi instan oleh kasir.'
    },
    {
      id: 6,
      title: 'Cara Membangun Brand Identity Warkop Yang Unik & Diingat',
      desc: 'Kustomisasi warna tema dan logo toko sesuai ciri khas warkop Anda.',
      content: 'Setiap warkop punya estetika sendiri. Reyyztore memungkinkan pemilik toko menyesuaikan warna background, foto banner promosi, hingga logo toko agar identitas visual warkop Anda tetap konsisten.'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-600 selection:text-white">
      
      {/* Navbar Premium */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-wider text-white">REYYZTORE</span>
            <span className="text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md">
              Enterprise POS
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="https://jasabikinwebsitereyyztore.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              Portofolio Jasa Web
            </a>
            <a href="https://papaniklanviral.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              Papan Iklan Viral
            </a>
            <a href="https://wa.me/6285150725531?text=Halo%20Reyyztore,%20saya%20tertarik%20memesan%20sistem%20POS" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
              Order via WhatsApp
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/kasir/login" className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition">
              Masuk Kasir
            </Link>
            <Link href="/kasir/login?mode=register" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition shadow-lg shadow-red-600/20">
              Daftar Toko
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section Utama */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Next-Generation Multi-Tenant Commerce Infrastructure</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
          Sistem Operasional Digital <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-500">
            Untuk Bisnis F&B Modern
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Arsitektur manajemen pesanan terpusat berbasis cloud, integrasi QR Code mandiri di tiap meja, pelacakan inventaris presisi, dan analitik performa bisnis real-time.
        </p>

        {/* Shortcut WhatsApp & Pendaftaran */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href="https://wa.me/6285150725531?text=Halo%20Reyyztore,%20saya%20ingin%20memesan%20atau%20berkonsultasi%20mengenai%20sistem%20POS."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <span>Pesan / Order Sekarang via WhatsApp</span>
          </a>
          <Link
            href="/kasir/login?mode=register"
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition text-center"
          >
            Eksplorasi Dashboard
          </Link>
        </div>
      </section>

      {/* FITUR KHUSUS: PENGUNJUNG YANG INGIN MASUK KE TOKO / MEJA TERTENTU */}
      <section className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-2xl backdrop-blur-xl">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Akses Langsung Halaman Toko & Meja</h3>
            <p className="text-xs text-slate-400">
              Pengunjung yang memindai QR code atau diarahkan ke halaman toko dapat memasukkan Slug Toko dan Nomor Meja di bawah ini untuk langsung menuju menu pesanan:
            </p>
          </div>

          <form onSubmit={handleStoreRedirect} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            <div className="sm:col-span-6">
              <input
                type="text"
                placeholder="Nama Toko / Slug (contoh: warkopmaju)"
                value={targetSlug}
                onChange={(e) => setTargetSlug(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-red-500 transition font-mono"
              />
            </div>
            <div className="sm:col-span-3">
              <input
                type="text"
                placeholder="No Meja"
                value={targetMeja}
                onChange={(e) => setTargetMeja(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-red-500 transition font-mono"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full h-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-red-600/20"
              >
                Buka Menu →
              </button>
            </div>
          </form>
          <p className="text-[10px] text-slate-500 font-mono">Format sistem: domain.vercel.app/[slug]?meja=[nomor]</p>
        </div>
      </section>

      {/* Ekosistem & Tautan Jaringan Reyyztore */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="border-t border-b border-slate-900 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <a
            href="https://jasabikinwebsitereyyztore.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition"
          >
            <span className="text-[10px] font-mono tracking-widest text-red-500 uppercase">Official Hub</span>
            <h3 className="text-base font-bold text-white group-hover:text-red-400 transition">Jasa Pembuatan Website Reyyztore</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Solusi pengembangan web profesional, aplikasi custom berkinerja tinggi, dan otomatisasi bisnis digital untuk UMKM hingga korporasi.
            </p>
            <span className="text-xs font-bold text-slate-200 inline-flex items-center gap-1 pt-2">
              Kunjungi Platform Jasa Web →
            </span>
          </a>

          <a
            href="https://papaniklanviral.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition"
          >
            <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase">Network Ecosystem</span>
            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">Papan Iklan Viral</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Platform publikasi promosi digital berdaya jangkau luas untuk mendongkrak visibilitas produk dan layanan secara instan.
            </p>
            <span className="text-xs font-bold text-slate-200 inline-flex items-center gap-1 pt-2">
              Kunjungi Papan Iklan Viral →
            </span>
          </a>
        </div>
      </section>

      {/* Artikel & Wawasan Bisnis */}
      <section className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Wawasan & Panduan Industri</h2>
            <p className="text-xs text-slate-400 mt-1">Dokumentasi strategi pengelolaan bisnis F&B skala modern.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((art) => (
            <div key={art.id} className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl space-y-3 hover:border-slate-700 transition flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-200">{art.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{art.desc}</p>
              </div>
              <button
                onClick={() => setSelectedArticle(art)}
                className="text-xs font-semibold text-red-400 hover:text-red-300 transition pt-2 text-left"
              >
                Baca Artikel Lengkap →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Detail Artikel */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">{selectedArticle.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{selectedArticle.content}</p>
            <button
              onClick={() => setSelectedArticle(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
            >
              Tutup Jendela
            </button>
          </div>
        </div>
      )}

      {/* Footer Perusahaan */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 text-xs text-slate-500 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 <strong className="text-white">Reyyztore</strong> Enterprise Architecture. Founder: Raihan Aji Saputra.</p>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <a href="mailto:sraihanaji@gmail.com" className="hover:text-slate-300">sraihanaji@gmail.com</a>
            <a href="https://wa.me/6285150725531" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300">WA: 085150725531</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
