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
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans pb-20">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-rose-500 tracking-wider">REYYZTORE</span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-full">POS SYSTEM</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/kasir/login" className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-white rounded-xl hover:bg-slate-800">
              Login Kasir Toko
            </Link>
            <Link href="/kasir/login?mode=register" className="px-4 py-2 bg-rose-600 text-white text-xs font-black rounded-xl hover:bg-rose-500 shadow-lg shadow-rose-600/20">
              Daftar Toko Baru ➔
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center px-4 pt-16 pb-12 space-y-6">
        <div className="inline-block px-4 py-1.5 bg-rose-950/60 border border-rose-800/80 text-rose-400 text-xs font-black rounded-full uppercase tracking-wider">
          🚀 Platform Kasir Multi-Tenant & POS Interaktif
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
          Transformasi Warkop Anda Menjadi <span className="text-rose-500">Warkop Digital Modern</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Sistem pemesanan meja otomatis berbasis QR Code, dilengkapi Mini Games anti-bosan, panggilan bel kasir realtime, dan laporan keuangan pintar khusus usaha warkop & cafe.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link href="/kasir/login?mode=register" className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-rose-600/30 transition active:scale-95">
            Mulai Gunakan Sekarang (Daftar Toko) ➔
          </Link>
          <a
            href="https://wa.me/6285150725531?text=Halo%20Reyyztore,%20saya%20tertarik%20menggunakan%20sistem%20Warkop%20POS"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            💬 Tanya-tanya via WhatsApp (085150725531)
          </a>
        </div>
      </section>

      {/* Benefit Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl font-black text-white">Keunggulan Utama Reyyztore POS</h2>
          <p className="text-xs text-slate-400">Semua fitur dirancang khusus untuk kenyamanan owner toko & pelanggan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center text-2xl">📱</div>
            <h3 className="text-base font-bold text-white">QR Code Per Meja</h3>
            <p className="text-xs text-slate-400">1 Meja punya 1 Barcode unik. Pelanggan scan, login instan, dan langsung pilih menu favorit.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-800 flex items-center justify-center text-2xl">🔔</div>
            <h3 className="text-base font-bold text-white">Bel Panggil Realtime</h3>
            <p className="text-xs text-slate-400">Pelanggan bisa memanggil kasir dari meja hanya dengan sekali pencet bel ber-suara merdu.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-800 flex items-center justify-center text-2xl">🎮</div>
            <h3 className="text-base font-bold text-white">10 Mini Games Anti-Bosan</h3>
            <p className="text-xs text-slate-400">TicTacToe, Memory, Tebak Angka, Suwit, hingga Tes Reaksi buat nongkrong makin seru.</p>
          </div>
        </div>
      </section>

      {/* Founder & Brand Info */}
      <section className="max-w-4xl mx-auto mx-4 bg-slate-900/80 border border-slate-800 p-8 rounded-3xl text-center space-y-4 my-8">
        <h3 className="text-xl font-black text-rose-500">Didevelop oleh Reyyztore</h3>
        <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
          Sistem ini diciptakan dan dikembangkan secara penuh oleh **Reyyztore** di bawah naungan founder **Raihan Aji Saputra**. Kami berkomitmen menyediakan solusi digitalisasi UMKM terjangkau, efisien, dan tanpa kerumitan teknis.
        </p>
        <p className="text-xs text-slate-400 font-bold">📧 Kontak Email Founder: <a href="mailto:sraihanaji@gmail.com" className="text-rose-400 hover:underline">sraihanaji@gmail.com</a></p>
      </section>

      {/* Artikel Edukasi Owner Toko */}
      <section className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-xl font-black text-white">📚 10 Artikel & Panduan Bisnis Warkop</h2>
          <p className="text-xs text-slate-400 mt-1">Pelajari strategi pengelolaan warkop modern dari ahli Reyyztore.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((art) => (
            <div key={art.id} className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-2 hover:border-slate-700 transition">
              <h3 className="text-sm font-bold text-rose-400">{art.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{art.desc}</p>
              <button
                onClick={() => setSelectedArticle(art)}
                className="text-[11px] font-black text-emerald-400 hover:underline pt-1 block"
              >
                Baca Artikel Selengkapnya ➔
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Baca Artikel */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-lg rounded-3xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-base font-black text-rose-400">{selectedArticle.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{selectedArticle.content}</p>
            <button
              onClick={() => setSelectedArticle(null)}
              className="w-full py-2.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700"
            >
              Tutup Artikel
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 pt-12 border-t border-slate-800 text-center text-xs text-slate-500 space-y-2">
        <p>© 2026 <strong className="text-rose-500">Reyyztore</strong>. Founder: Raihan Aji Saputra.</p>
        <p>Email: sraihanaji@gmail.com | WhatsApp: 085150725531</p>
      </footer>
    </div>
  )
}
