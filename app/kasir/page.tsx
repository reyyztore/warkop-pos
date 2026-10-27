'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function KasirDashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()

    // Realtime Listener Pesanan Baru
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">📦 Antrean Pesanan Realtime</h2>
        <button
          onClick={fetchOrders}
          className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300"
        >
          🔄 Refresh Data
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Memuat antrean...</p>
      ) : orders.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-sm">
          Belum ada pesanan masuk.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-emerald-400 text-base">
                    Meja #{ord.tables?.nomor || '-'}
                  </span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-medium">
                    {ord.nama_pemesan || 'Tamu'}
                  </span>
                </div>

                {/* Daftar Item */}
                <ul className="mt-3 space-y-1 text-xs text-slate-300">
                  {ord.order_items?.map((item: any) => (
                    <li key={item.id} className="flex justify-between">
                      <span>
                        {item.qty}x {item.menu_items?.nama || 'Menu'}
                      </span>
                      <span className="text-slate-500">
                        Rp {(item.harga_satuan * item.qty).toLocaleString('id-ID')}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">Total</span>
                  <span className="text-emerald-400">
                    Rp {ord.total_harga?.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Tombol Status */}
              <div className="pt-2 flex gap-1.5">
                {ord.status === 'pending' && (
                  <button
                    onClick={() => updateStatus(ord.id, 'diproses')}
                    className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition"
                  >
                    Proses
                  </button>
                )}
                {ord.status === 'diproses' && (
                  <button
                    onClick={() => updateStatus(ord.id, 'selesai')}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition"
                  >
                    Selesaikan
                  </button>
                )}
                <button
                  onClick={() => updateStatus(ord.id, 'dibatalkan')}
                  className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-800/50 text-xs font-semibold rounded-lg transition"
                >
                  Batal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
