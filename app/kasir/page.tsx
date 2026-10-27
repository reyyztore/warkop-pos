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

  // Kasir Sound Option (1: Bel Biasa, 2: Ada Pesanan Masuk Bos, 3: Pesanan Masuk Nih, 4: Loop Random 1-3)
  const [kasirSoundOption, setKasirSoundOption] = useState<number>(2)

  const supabase = createClient()

  const speakText = (text: string, loop: boolean = false) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'id-ID'
    utterance.pitch = 1
    utterance.rate = 1
    if (loop) {
      utterance.onend = () => {
        window.speechSynthesis.speak(utterance)
      }
    }
    window.speechSynthesis.speak(utterance)
  }

  const playBellSound = (loop: boolean = false) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const playTone = () => {
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
      }
      playTone()
      if (loop) {
        const interval = setInterval(playTone, 5000)
        setTimeout(() => clearInterval(interval), 15000)
      }
    } catch (e) {
      console.log(e)
    }
  }

  const playIncomingOrderSound = () => {
    if (kasirSoundOption === 1) playBellSound(false)
    if (kasirSoundOption === 2) speakText('Ada pesanan masuk bos', false)
    if (kasirSoundOption === 3) speakText('Pesanan masuk nih', false)
    if (kasirSoundOption === 4) {
      const rand = Math.floor(Math.random() * 3) + 1
      if (rand === 1) playBellSound(true)
      if (rand === 2) speakText('Ada pesanan masuk bos', true)
      if (rand === 3) speakText('Pesanan masuk nih', true)
    }
  }

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/kasir/login'
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!profile || (profile.role !== 'cashier' && profile.role !== 'admin')) {
        window.location.href = '/kasir/login'
        return
      }

      fetchOrders()
    }

    checkAuthAndFetch()

    // Realtime Order Listener
    const channel = supabase
      .channel('realtime-orders-kasir-advanced')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        () => {
          playIncomingOrderSound()
          fetchOrders()
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [kasirSoundOption])

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

  const ringOrderBell = () => {
    playBellSound(false)
  }

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }

  const todayOrders = orders.filter((o) => isToday(o.created_at))
  const todayCompleted = todayOrders.filter((o) => o.status === 'selesai')
  const totalOmzetHariIni = todayCompleted.reduce((acc, curr) => acc + (curr.total_harga || 0), 0)
  const totalPesananAktif = orders.filter((o) => o.status === 'pending' || o.status === 'diproses').length

  const filteredOrders = orders.filter((ord) => {
    if (activeTab === 'semua') return true
    return ord.status === activeTab
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans pb-16 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-rose-900/30 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 p-0.5 shadow-lg shadow-rose-950/50">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl text-rose-300">
              🌸
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-300 to-purple-200 flex items-center gap-2">
              Kasir Modern POS
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping"></span>
            </h1>
            <p className="text-xs text-rose-300/60 font-medium">Manajemen Pesanan Realtime Warkop</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/kasir/menu" className="px-4 py-2 bg-rose-950/40 border border-rose-800/40 text-xs font-bold text-rose-200 hover:bg-rose-900/40 rounded-2xl transition">
            🌸 Kelola Menu
          </Link>
          <Link href="/kasir/meja" className="px-4 py-2 bg-purple-950/40 border border-purple-800/40 text-xs font-bold text-purple-200 hover:bg-purple-900/40 rounded-2xl transition">
            🪑 Kelola Meja
          </Link>
        </div>
      </div>

      {/* Setting Nada Kasir */}
      <div className="max-w-5xl mx-auto mt-4 bg-slate-900/80 border border-rose-900/30 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <span className="text-xs font-bold text-rose-300 flex items-center gap-2">
          <span>🔊</span> Sound Pesanan Masuk Kasir:
        </span>
        <select
          value={kasirSoundOption}
          onChange={(e) => setKasirSoundOption(Number(e.target.value))}
          className="bg-slate-950 border border-slate-800 text-xs text-white p-2 rounded-xl focus:outline-none"
        >
          <option value={1}>1. Bel Biasa</option>
          <option value={2}>2. "Ada pesanan masuk bos"</option>
          <option value={3}>3. "Pesanan masuk nih"</option>
          <option value={4}>4. Berulang Random (1-3)</option>
        </select>
      </div>

      {/* Omzet Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-rose-500/20 p-4 rounded-3xl">
          <p className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">Omzet Hari Ini</p>
          <p className="text-xl font-black text-rose-300 mt-1">Rp {totalOmzetHariIni.toLocaleString('id-ID')}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{todayCompleted.length} Pesanan Selesai</p>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-xl border border-pink-500/20 p-4 rounded-3xl">
          <p className="text-[10px] font-bold text-pink-300 uppercase tracking-wider">Antrean Aktif</p>
          <p className="text-xl font-black text-pink-300 mt-1">{totalPesananAktif} Pesanan</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Perlu Diproses</p>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/20 p-4 rounded-3xl">
          <p className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Total Transaksi</p>
          <p className="text-xl font-black text-purple-300 mt-1">{todayOrders.length} Pesanan</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Masuk Hari Ini</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-5xl mx-auto flex gap-2 overflow-x-auto mt-6 pb-1 no-scrollbar relative z-10">
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
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
              activeTab === tab.id ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-slate-950 shadow-lg shadow-rose-950/40' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="max-w-5xl mx-auto mt-4 relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => <div key={n} className="h-44 bg-slate-900/50 rounded-3xl animate-pulse border border-slate-800" />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-xs text-slate-400">Tidak ada pesanan di tab ini.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((ord) => (
              <div key={ord.id} className="bg-slate-900/80 backdrop-blur-xl border border-rose-900/30 p-4 rounded-3xl flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-sm font-black text-rose-300">Meja #{ord.tables?.nomor || '-'}</span>
                      <p className="text-xs font-bold text-white mt-0.5">👤 {ord.nama_pemesan}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                        ord.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        ord.status === 'diproses' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        ord.status === 'selesai' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300'
                      }`}>{ord.status}</span>
                      <button onClick={ringOrderBell} className="text-xs bg-slate-800 p-1 rounded-lg border border-slate-700 hover:bg-rose-900 transition" title="Bunyikan Bel">
                        🔔 Bel
                      </button>
                    </div>
                  </div>

                  <ul className="mt-3 space-y-1 text-xs text-slate-300">
                    {ord.order_items?.map((item: any) => (
                      <li key={item.id} className="flex justify-between">
                        <span><strong className="text-pink-400">{item.qty}x</strong> {item.menu_items?.nama}</span>
                        <span className="text-slate-500">Rp {(item.harga_satuan * item.qty).toLocaleString('id-ID')}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-2 border-t border-slate-800 flex justify-between text-xs font-black">
                    <span className="text-slate-400">Total Pembayaran</span>
                    <span className="text-rose-300 text-sm">Rp {ord.total_harga?.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <div className="flex gap-1.5">
                    {ord.status === 'pending' && (
                      <button onClick={() => updateStatus(ord.id, 'diproses')} className="flex-1 py-2 bg-amber-500 text-slate-950 text-xs font-black rounded-xl">Proses Pesanan</button>
                    )}
                    {ord.status === 'diproses' && (
                      <button onClick={() => updateStatus(ord.id, 'selesai')} className="flex-1 py-2 bg-pink-500 text-slate-950 text-xs font-black rounded-xl">Selesaikan Pesanan</button>
                    )}
                    <button onClick={() => updateStatus(ord.id, 'dibatalkan')} className="px-3 py-2 bg-slate-950 text-red-400 border border-slate-800 text-xs font-bold rounded-xl">Batal</button>
                  </div>
                  <button onClick={() => setSelectedOrderForPrint(ord)} className="w-full py-2 bg-slate-800 text-rose-200 text-xs font-bold rounded-xl border border-slate-700">🖨️ Cetak Struk</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Struk */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-sm rounded-3xl p-6 font-mono text-xs space-y-3">
            <div className="text-center pb-2 border-b border-dashed border-slate-300">
              <h2 className="text-base font-bold">🌸 WARUNG KOPI KITA</h2>
              <p className="text-[10px] text-slate-400">{new Date(selectedOrderForPrint.created_at).toLocaleString('id-ID')}</p>
            </div>
            <div className="space-y-1 border-b border-dashed border-slate-300 pb-2">
              <p>Pelanggan: <strong>{selectedOrderForPrint.nama_pemesan}</strong></p>
              <p>Meja: <strong>#{selectedOrderForPrint.tables?.nomor}</strong></p>
            </div>
            <div className="space-y-1 border-b border-dashed border-slate-300 pb-2">
              {selectedOrderForPrint.order_items?.map((it: any) => (
                <div key={it.id} className="flex justify-between">
                  <span>{it.qty}x {it.menu_items?.nama}</span>
                  <span>Rp {(it.harga_satuan * it.qty).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span>TOTAL:</span>
              <span>Rp {selectedOrderForPrint.total_harga?.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex gap-2 pt-2 print:hidden font-sans">
              <button onClick={() => window.print()} className="flex-1 py-2.5 bg-rose-600 text-white font-bold rounded-xl">🖨️ Cetak</button>
              <button onClick={() => setSelectedOrderForPrint(null)} className="px-4 py-2.5 bg-slate-200 text-slate-800 font-bold rounded-xl">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
