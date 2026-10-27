'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function KasirDashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('semua')
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<any | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchOrders()

    // Realtime listener untuk pesanan baru/perubahan status
    const channel = supabase
      .channel('realtime-orders-kasir')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, tables(nomor), order_items(*, menu_items(nama))')
      .order('created_at', { ascending: false })

    if (data) setOrders(data)
    setLoading(false)
  }

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    fetchOrders()
  }

  // Hitung Laporan Ringkas Harian
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }

  const todayOrders = orders.filter((o) => isToday(o.created_at))
  const todayCompleted = todayOrders.filter((o) => o.status === 'selesai')
  const totalOmzetHariIni = todayCompleted.reduce((acc, curr) => acc + (curr.total_harga || 0), 0)
  const totalPesananAktif = orders.filter((o) => o.status === 'pending' || o.status === 'diproses').length

  // Filter Data Sesuai Tab
  const filteredOrders = orders.filter((ord) => {
    if (activeTab === 'semua') return true
    return ord.status === activeTab
  })

  // Trigger Print Struk
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans pb-16">
      {/* Top Nav Bar */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl text-emerald-400 shadow-sm">
            ☕
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              Kasir & Pos Warkop
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h1>
            <p className="text-[11px] text-slate-400">Dashboard Manajemen Operasional Realtime</p>
          </div>
        </div>

        {/* Menu Navigasi */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Link
            href="/kasir/menu"
            className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-bold text-slate-300 hover:text-white rounded-xl active:scale-95 transition-all"
          >
            📋 Kelola Menu
          </Link>
          <Link
            href="/kasir/meja"
            className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-bold text-slate-300 hover:text-white rounded-xl active:scale-95 transition-all"
          >
            🪑 Kelola Meja
          </Link>
          <button
            onClick={fetchOrders}
            className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl active:scale-95 transition-all"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Grid Ringkasan Laporan Harian */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Omzet Hari Ini</p>
          <p className="text-lg font-black text-emerald-400 mt-1">
            Rp {totalOmzetHariIni.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">{todayCompleted.length} pesanan selesai</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pesanan Aktif</p>
          <p className="text-lg font-black text-amber-400 mt-1">{totalPesananAktif} Antrean</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Perlu diproses / diselesaikan</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Transaksi</p>
          <p className="text-lg font-black text-blue-400 mt-1">{todayOrders.length} Pesanan</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Masuk hari ini</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-5xl mx-auto flex gap-2 overflow-x-auto mt-6 pb-1 no-scrollbar">
        {[
          { id: 'semua', label: 'Semua Status' },
          { id: 'pending', label: '⏳ Baru' },
          { id: 'diproses', label: '🍳 Diproses' },
          { id: 'selesai', label: '✅ Selesai' },
          { id: 'dibatalkan', label: '❌ Batal' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Daftar Pesanan Cards */}
      <div className="max-w-5xl mx-auto mt-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800/50" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl max-w-md mx-auto my-8">
            <span className="text-3xl block mb-2">📥</span>
            <p className="text-xs font-bold text-slate-400">Tidak ada pesanan pada tab ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-slate-700 p-4 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm transition-all"
              >
                <div>
                  {/* Header Order Card */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-sm font-black text-emerald-400">
                        Meja #{ord.tables?.nomor || '-'}
                      </span>
                      <p className="text-[11px] text-slate-300 font-bold mt-0.5">
                        👤 {ord.nama_pemesan || 'Tamu'}
                      </p>
                      {ord.phone_pemesan && (
                        <p className="text-[10px] text-slate-500 font-mono">📱 {ord.phone_pemesan}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          ord.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : ord.status === 'diproses'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : ord.status === 'selesai'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {ord.status}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {new Date(ord.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* List Item Pesanan */}
                  <ul className="mt-3 space-y-1 text-xs text-slate-300">
                    {ord.order_items?.map((item: any) => (
                      <li key={item.id} className="flex justify-between items-center">
                        <span className="font-medium">
                          <strong className="text-emerald-400 font-bold">{item.qty}x</strong> {item.menu_items?.nama || 'Menu'}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Rp {(item.harga_satuan * item.qty).toLocaleString('id-ID')}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Total Pembayaran */}
                  <div className="mt-4 pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs font-black">
                    <span className="text-slate-400">Total Harga</span>
                    <span className="text-emerald-400 text-sm">
                      Rp {ord.total_harga?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Tombol Aksi Kasir & Cetak Struk */}
                <div className="pt-2 flex flex-col gap-2">
                  <div className="flex gap-1.5">
                    {ord.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(ord.id, 'diproses')}
                        className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl active:scale-95 transition-all shadow-md shadow-amber-500/20"
                      >
                        Proses Pesanan
                      </button>
                    )}
                    {ord.status === 'diproses' && (
                      <button
                        onClick={() => updateStatus(ord.id, 'selesai')}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl active:scale-95 transition-all shadow-md shadow-emerald-500/20"
                      >
                        Selesaikan Pesanan
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(ord.id, 'dibatalkan')}
                      className="px-3 py-2 bg-slate-950 hover:bg-red-950/80 text-red-400 border border-slate-800 hover:border-red-800 text-xs font-bold rounded-xl active:scale-95 transition-all"
                    >
                      Batal
                    </button>
                  </div>

                  {/* Tombol Print Struk */}
                  <button
                    onClick={() => setSelectedOrderForPrint(ord)}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>🖨️</span> Cetak Struk / Nota
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL POP-UP CETAK STRUK / NOTA KASIR */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 print:shadow-none font-mono text-xs">
            {/* Header Struk */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
              <h2 className="text-base font-bold tracking-tight">☕ WARUNG KOPI KITA</h2>
              <p className="text-[10px] text-slate-500">Jl. Warkop No. 1 • Telp/WA: {selectedOrderForPrint.phone_pemesan || '0812-XXXX-XXXX'}</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {new Date(selectedOrderForPrint.created_at).toLocaleString('id-ID')}
              </p>
            </div>

            {/* Info Meja & Pelanggan */}
            <div className="space-y-1 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span>No. Meja:</span>
                <span className="font-bold">Meja #{selectedOrderForPrint.tables?.nomor || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="font-bold">{selectedOrderForPrint.nama_pemesan || 'Tamu'}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold uppercase">{selectedOrderForPrint.status}</span>
              </div>
            </div>

            {/* Itemized List */}
            <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
              {selectedOrderForPrint.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-bold">{item.menu_items?.nama}</p>
                    <p className="text-[10px] text-slate-500">
                      {item.qty} x Rp {item.harga_satuan?.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <span className="font-bold">
                    Rp {(item.harga_satuan * item.qty).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Pembayaran */}
            <div className="flex justify-between text-sm font-bold pt-1">
              <span>TOTAL:</span>
              <span>Rp {selectedOrderForPrint.total_harga?.toLocaleString('id-ID')}</span>
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-400">
              <p>Terima kasih atas kunjungan Anda! 🙏</p>
              <p>Selamat menikmati santapan warkop kami.</p>
            </div>

            {/* Action Buttons Modal */}
            <div className="pt-3 flex gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold rounded-xl transition"
              >
                🖨️ Cetak Nota
              </button>
              <button
                onClick={() => setSelectedOrderForPrint(null)}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-sans text-xs font-bold rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
