'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function KasirDashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel('realtime-orders')
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans pb-12">
      {/* Top Bar Navigation */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl text-emerald-400">
            📊
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              Dashboard Kasir
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h1>
            <p className="text-[11px] text-slate-400">Pantau & kelola pesanan masuk secara realtime</p>
          </div>
        </div>

        {/* Action Menu */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Link
            href="/kasir/menu"
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-bold text-slate-300 hover:text-white rounded-xl active:scale-95 transition-all"
          >
            ☕ Kelola Menu
          </Link>
          <Link
            href="/kasir/meja"
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-bold text-slate-300 hover:text-white rounded-xl active:scale-95 transition-all"
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

      {/* Grid Order Cards */}
      <div className="max-w-5xl mx-auto mt-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800/50" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl max-w-md mx-auto my-12">
            <span className="text-4xl block mb-2">📥</span>
            <p className="text-sm font-bold text-white">Belum ada pesanan masuk</p>
            <p className="text-xs text-slate-400 mt-1">Pesanan pelanggan akan otomatis muncul di sini secara realtime.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-slate-900/80 backdrop-blur-md border border-slate-800 hover:border-slate-700 p-4 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-sm font-black text-emerald-400">Meja #{ord.tables?.nomor || '-'}</span>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">👤 {ord.nama_pemesan || 'Tamu'}</p>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
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
                  </div>

                  {/* List Item */}
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
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

                  <div className="mt-4 pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs font-black">
                    <span className="text-slate-400">Total Pembayaran</span>
                    <span className="text-emerald-400 text-sm">
                      Rp {ord.total_harga?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Status Control Buttons */}
                <div className="pt-2 flex gap-2">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
