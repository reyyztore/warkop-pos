'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function KitchenDisplayPage() {
  const params = useParams()
  const slug = params?.slug as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [isKdsActive, setIsKdsActive] = useState(false)
  const [storeData, setStoreData] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [customerBellAlert, setCustomerBellAlert] = useState<string | null>(null)

  // Suara & Text-to-Speech untuk Bel Panggilan Pelanggan
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'id-ID'
    window.speechSynthesis.speak(utterance)
  }

  const playBellSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      const audioCtx = new AudioCtx()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, audioCtx.currentTime)
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 1)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (slug) fetchKdsData()
  }, [slug])

  // Realtime Listener untuk pesanan baru & bel dari pelanggan
  useEffect(() => {
    if (!storeData?.id) return

    const channel = supabase
      .channel(`kitchen-display-${storeData.id}`)
      .on('broadcast', { event: 'customer-ring-bell' }, (payload: any) => {
        playBellSound()
        const table = payload.payload?.tableNo || '??'
        speakText(`Panggilan! Meja ${table} menekan panggilan.`)
        setCustomerBellAlert(`🔔 Meja #${table} menekan panggilan ke Dapur!`)
        setTimeout(() => setCustomerBellAlert(null), 8000)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `store_id=eq.${storeData.id}` }, () => {
        playBellSound()
        fetchKitchenOrders(storeData.id)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `store_id=eq.${storeData.id}` }, () => {
        fetchKitchenOrders(storeData.id)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [storeData?.id])

  const fetchKdsData = async () => {
    setLoading(true)

    const { data: store } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .single()

    if (store) {
      setStoreData(store)
      setIsKdsActive(store.kds_active || false)

      if (store.kds_active) {
        fetchKitchenOrders(store.id)
      }
    }
    setLoading(false)
  }

  // TWO-STEP FETCHING UNTUK MEMASTIKAN ITEM & CATATAN TIDAK HILANG DI DAPUR
  const fetchKitchenOrders = async (storeId: string) => {
    try {
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select('*, tables!left(nomor)')
        .eq('store_id', storeId)
        .in('status', ['pending', 'diproses'])
        .order('created_at', { ascending: true })

      if (ordersErr) throw ordersErr

      if (!ordersData || ordersData.length === 0) {
        setOrders([])
        return
      }

      const orderIds = ordersData.map((o) => o.id)

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*, menu_items!left(*)')
        .in('order_id', orderIds)

      const { data: allMenuItems } = await supabase
        .from('menu_items')
        .select('*')
        .eq('store_id', storeId)

      const menuMap = new Map((allMenuItems || []).map((m) => [m.id, m]))

      const combinedOrders = ordersData.map((ord) => {
        const matchingItems = (itemsData || [])
          .filter((item) => item.order_id === ord.id)
          .map((item) => {
            const targetMenuId = item.menu_id || item.menu_item_id
            const fallbackMenu = targetMenuId ? menuMap.get(targetMenuId) : null
            return {
              ...item,
              menu_items: item.menu_items || fallbackMenu || null,
            }
          })

        return {
          ...ord,
          order_items: matchingItems,
        }
      })

      setOrders(combinedOrders)
    } catch (err: any) {
      console.error('Error fetching kitchen orders:', err)
    }
  }

  const handleUpdateStatus = async (orderId: string, statusBaru: 'diproses' | 'selesai') => {
    try {
      await supabase
        .from('orders')
        .update({ status: statusBaru })
        .eq('id', orderId)

      if (storeData?.id) fetchKitchenOrders(storeData.id)
    } catch (err: any) {
      alert('Gagal memperbarui status pesanan: ' + err.message)
    }
  }

  const handleRingCustomerBell = async (tableNo: string) => {
    if (!storeData?.id) return
    try {
      await supabase.channel(`meja-customer-${storeData.id}`).send({
        type: 'broadcast',
        event: 'ring-table-bell',
        payload: { tableNo },
      })
      alert(`🔔 Bel Panggilan terkirim ke Meja #${tableNo}!`)
    } catch (err: any) {
      alert('Gagal membunyikan bel: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-xs font-bold">
        Memuat Layar Dapur & Barista...
      </div>
    )
  }

  if (!isKdsActive) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3 shadow-2xl">
          <div className="text-4xl">👨‍🍳🚫</div>
          <h1 className="text-lg font-black text-rose-400">Mode Layar Dapur Nonaktif</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fitur Layar Dapur (KDS) belum diaktifkan oleh pengelola toko <strong>{storeData?.store_name || slug}</strong>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 font-sans pb-12">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="text-2xl">👨‍🍳</div>
          <div>
            <h1 className="text-base font-black text-emerald-400">Layar Dapur & Barista</h1>
            <p className="text-xs text-slate-400">{storeData?.store_name} • Real-Time Order Queue</p>
          </div>
        </div>
        <div className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold animate-pulse">
          ● Live Updates
        </div>
      </div>

      {customerBellAlert && (
        <div className="mb-4 p-3.5 bg-amber-500 text-slate-950 text-xs font-black rounded-2xl shadow-xl flex justify-between items-center animate-bounce">
          <span>{customerBellAlert}</span>
          <button onClick={() => setCustomerBellAlert(null)} className="text-xs px-2 py-1 bg-slate-950 text-white rounded-lg">Tutup</button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-24 bg-slate-900/50 border border-slate-800/80 rounded-3xl text-slate-500 text-xs font-bold">
          ☕ Belum ada pesanan masuk ke dapur saat ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((ord) => {
            const formattedTime = new Date(ord.created_at).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })

            const itemsList = ord.order_items || []

            return (
              <div
                key={ord.id}
                className={`bg-slate-900 border p-4 rounded-3xl space-y-3 flex flex-col justify-between shadow-xl ${
                  ord.status === 'pending'
                    ? 'border-amber-500/50 shadow-amber-500/5'
                    : 'border-blue-500/50 shadow-blue-500/5'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                    <div>
                      <span className="text-base font-black text-amber-400">Meja #{ord.tables?.nomor || '-'}</span>
                      <p className="text-xs font-bold text-slate-300">👤 {ord.nama_pemesan}</p>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400">
                      ⏱️ {formattedTime} WIB
                    </span>
                  </div>

                  <div className="space-y-2">
                    {itemsList.map((item: any, idx: number) => {
                      const namaProduk = 
                        item.menu_items?.nama || 
                        item.nama_menu_manual || 
                        item.nama_item || 
                        'Menu / Produk'

                      return (
                        <div key={item.id || idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                          <div className="flex justify-between font-bold text-xs text-white">
                            <span>{namaProduk}</span>
                            <span className="text-emerald-400 font-black">{item.qty}x</span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-[10px] mt-1 text-slate-400">
                            {item.varian && (
                              <span className={`px-1.5 py-0.5 rounded font-semibold uppercase ${item.varian === 'dingin' ? 'bg-cyan-950 text-cyan-300' : 'bg-amber-950 text-amber-300'}`}>
                                {item.varian === 'dingin' ? '🧊 Dingin' : '🔥 Panas'}
                              </span>
                            )}
                            {item.catatan && (
                              <span className="italic text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
                                📝 "{item.catatan}"
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleRingCustomerBell(ord.tables?.nomor)}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5"
                  >
                    <span>🔔</span> Bunyikan Bel Pelanggan
                  </button>

                  <div className="flex gap-2">
                    {ord.status === 'pending' ? (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'diproses')}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow transition"
                      >
                        🍳 Masak / Buat
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(ord.id, 'selesai')}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow transition"
                      >
                        ✅ Selesai
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
