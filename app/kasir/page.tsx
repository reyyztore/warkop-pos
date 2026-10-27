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
  const [selectedBuktiUrl, setSelectedBuktiUrl] = useState<string | null>(null)

  // Profile Toko & QRIS State
  const [storeName, setStoreName] = useState('Warung Kopi Kita')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [qrisFile, setQrisFile] = useState<File | null>(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [qrisUrl, setQrisUrl] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Sound Options
  const [kasirSoundOption, setKasirSoundOption] = useState<number>(2)
  const [customerBellAlert, setCustomerBellAlert] = useState<string | null>(null)

  const supabase = createClient()

  const speakText = (text: string, loop: boolean = false) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'id-ID'
    if (loop) utterance.onend = () => window.speechSynthesis.speak(utterance)
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

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      if (!profile || (profile.role !== 'cashier' && profile.role !== 'admin')) {
        window.location.href = '/kasir/login'
        return
      }

      if (profile.store_name) setStoreName(profile.store_name)
      if (profile.avatar_url) setAvatarUrl(profile.avatar_url)
      if (profile.qris_url) setQrisUrl(profile.qris_url)

      fetchOrders()
    }

    checkAuthAndFetch()

    // Realtime Listener Bel Pelanggan Ke Kasir
    const channel = supabase
      .channel('kasir-dashboard-realtime')
      .on('broadcast', { event: 'customer-ring-bell' }, (payload: any) => {
        playBellSound(false)
        const table = payload.payload?.tableNo || '??'
        setCustomerBellAlert(`🔔 Meja #${table} memanggil kasir!`)
        setTimeout(() => setCustomerBellAlert(null), 8000)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        playIncomingOrderSound()
        fetchOrders()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
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

  const togglePaidStatus = async (orderId: string, currentPaid: boolean) => {
    await supabase.from('orders').update({ is_paid: !currentPaid }).eq('id', orderId)
    fetchOrders()
  }

  const ringSpecificTableBell = async (tableNo: any) => {
    await supabase.channel('meja-customer-realtime').send({
      type: 'broadcast',
      event: 'ring-table-bell',
      payload: { tableNo },
    })
    alert(`🔔 Bel terkirim ke Meja #${tableNo}`)
  }

  const handleSaveStoreProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      let newAvatarUrl = avatarUrl
      let newQrisUrl = qrisUrl

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `store/avatar_${Date.now()}.${fileExt}`
        await supabase.storage.from('menu-images').upload(filePath, avatarFile)
        const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath)
        newAvatarUrl = data.publicUrl
      }

      if (qrisFile) {
        const fileExt = qrisFile.name.split('.').pop()
        const filePath = `store/qris_${Date.now()}.${fileExt}`
        await supabase.storage.from('menu-images').upload(filePath, qrisFile)
        const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath)
        newQrisUrl = data.publicUrl
      }

      await supabase.from('profiles').update({
        store_name: storeName,
        avatar_url: newAvatarUrl,
        qris_url: newQrisUrl,
      }).eq('id', session.user.id)

      setAvatarUrl(newAvatarUrl)
      setQrisUrl(newQrisUrl)
      setShowProfileModal(false)
      alert('Profil warkop & foto QRIS berhasil diperbarui! Tampilan pelanggan otomatis terupdate.')
    } catch (e: any) {
      alert(e.message)
    }
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

      {/* Top Bar Navigation */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-rose-900/30 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 p-0.5 shadow-lg">
            <div className="w-full h-full bg-slate-950 rounded-[14px] overflow-hidden flex items-center justify-center text-xl text-rose-300">
              {avatarUrl ? <img src={avatarUrl} alt="Logo" className="w-full h-full object-cover" /> : '🌸'}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black text-rose-200">{storeName}</h1>
            <p className="text-xs text-rose-300/60 font-medium">Dashboard POS & Kasir Realtime</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowProfileModal(true)} className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-rose-300 rounded-2xl">
            ⚙️ Profil & QRIS Toko
          </button>
          <Link href="/kasir/menu" className="px-3.5 py-2 bg-rose-950/40 border border-rose-800/40 text-xs font-bold text-rose-200 rounded-2xl">
            🌸 Kelola Menu
          </Link>
          <Link href="/kasir/meja" className="px-3.5 py-2 bg-purple-950/40 border border-purple-800/40 text-xs font-bold text-purple-200 rounded-2xl">
            🪑 Kelola Meja
          </Link>
        </div>
      </div>

      {/* Alert Customer Bell */}
      {customerBellAlert && (
        <div className="max-w-5xl mx-auto mt-4 p-3.5 bg-amber-500 text-slate-950 text-xs font-black rounded-2xl shadow-xl flex justify-between items-center">
          <span>{customerBellAlert}</span>
          <button onClick={() => setCustomerBellAlert(null)} className="text-xs px-2 py-1 bg-slate-950 text-white rounded-lg">Tutup</button>
        </div>
      )}

      {/* Setting Nada Kasir */}
      <div className="max-w-5xl mx-auto mt-4 bg-slate-900/80 border border-rose-900/30 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <span className="text-xs font-bold text-rose-300 flex items-center gap-2">
          <span>🔊</span> Sound Pesanan Masuk Kasir:
        </span>
        <select value={kasirSoundOption} onChange={(e) => setKasirSoundOption(Number(e.target.value))} className="bg-slate-950 border border-slate-800 text-xs text-white p-2 rounded-xl focus:outline-none">
          <option value={1}>1. Bel Biasa</option>
          <option value={2}>2. "Ada pesanan masuk bos"</option>
          <option value={3}>3. "Pesanan masuk nih"</option>
          <option value={4}>4. Berulang Random (1-3)</option>
        </select>
      </div>

      {/* Omzet Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 relative z-10">
        <div className="bg-slate-900/80 border border-rose-500/20 p-4 rounded-3xl">
          <p className="text-[10px] font-bold text-rose-300 uppercase">Omzet Hari Ini</p>
          <p className="text-xl font-black text-rose-300 mt-1">Rp {totalOmzetHariIni.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-slate-900/80 border border-pink-500/20 p-4 rounded-3xl">
          <p className="text-[10px] font-bold text-pink-300 uppercase">Antrean Aktif</p>
          <p className="text-xl font-black text-pink-300 mt-1">{totalPesananAktif} Pesanan</p>
        </div>
        <div className="bg-slate-900/80 border border-purple-500/20 p-4 rounded-3xl">
          <p className="text-[10px] font-bold text-purple-300 uppercase">Total Transaksi</p>
          <p className="text-xl font-black text-purple-300 mt-1">{todayOrders.length} Pesanan</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-5xl mx-auto flex gap-2 overflow-x-auto mt-6 pb-1 no-scrollbar relative z-10">
        {[{ id: 'semua', label: 'Semua Status' }, { id: 'pending', label: '⏳ Baru' }, { id: 'diproses', label: '🍳 Diproses' }, { id: 'selesai', label: '✅ Selesai' }, { id: 'dibatalkan', label: '❌ Batal' }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${activeTab === tab.id ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
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
        ) : filteredOrders.map((ord) => (
          <div key={ord.id} className="bg-slate-900/80 border border-rose-900/30 p-4 rounded-3xl space-y-3 mb-3">
            <div className="flex justify-between items-start pb-3 border-b border-slate-800">
              <div>
                <span className="text-sm font-black text-rose-300">Meja #{ord.tables?.nomor || '-'}</span>
                <p className="text-xs font-bold text-white mt-0.5">👤 {ord.nama_pemesan}</p>
                <span className="text-[10px] text-slate-400">Bayar: <strong className="text-emerald-400">{ord.metode_pembayaran?.toUpperCase()}</strong></span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${ord.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : ord.status === 'diproses' ? 'bg-blue-500/20 text-blue-300' : ord.status === 'selesai' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{ord.status}</span>
                
                {/* Bel Berulang Meja Spesifik */}
                <button onClick={() => ringSpecificTableBell(ord.tables?.nomor)} className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-1 rounded-md font-bold hover:bg-amber-500 hover:text-slate-950 transition">
                  🔔 Ring Meja #{ord.tables?.nomor}
                </button>
              </div>
            </div>

            <ul className="space-y-1 text-xs text-slate-300">
              {ord.order_items?.map((item: any) => (
                <li key={item.id} className="flex justify-between">
                  <span><strong className="text-pink-400">{item.qty}x</strong> {item.menu_items?.nama}</span>
                  <span className="text-slate-500">Rp {(item.harga_satuan * item.qty).toLocaleString('id-ID')}</span>
                </li>
              ))}
            </ul>

            {/* Bukti Transfer Section */}
            {ord.bukti_pembayaran_url && (
              <div className="p-2 bg-blue-950/40 border border-blue-800/60 rounded-xl flex justify-between items-center text-xs">
                <span className="text-blue-300 font-bold">📷 Bukti Transfer Pelanggan</span>
                <button onClick={() => setSelectedBuktiUrl(ord.bukti_pembayaran_url)} className="px-2.5 py-1 bg-blue-500 text-slate-950 font-black rounded-lg text-[10px]">
                  🖼️ Lihat Bukti
                </button>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-black">
              <span>Total: <strong className="text-rose-300">Rp {ord.total_harga?.toLocaleString('id-ID')}</strong></span>
              <button onClick={() => togglePaidStatus(ord.id, ord.is_paid)} className={`px-3 py-1 rounded-xl text-[10px] font-bold ${ord.is_paid ? 'bg-emerald-500 text-slate-950' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                {ord.is_paid ? '✅ Lunas' : '❌ Belum Bayar'}
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              {ord.status === 'pending' && <button onClick={() => updateStatus(ord.id, 'diproses')} className="flex-1 py-2 bg-amber-500 text-slate-950 text-xs font-black rounded-xl">Proses Pesanan</button>}
              {ord.status === 'diproses' && <button onClick={() => updateStatus(ord.id, 'selesai')} className="flex-1 py-2 bg-pink-500 text-slate-950 text-xs font-black rounded-xl">Selesaikan Pesanan</button>}
              <button onClick={() => setSelectedOrderForPrint(ord)} className="px-4 py-2 bg-slate-800 text-rose-200 text-xs font-bold rounded-xl">🖨️ Struk</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal View Bukti Transfer */}
      {selectedBuktiUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-sm rounded-3xl p-5 text-center space-y-3">
            <h3 className="text-sm font-bold text-blue-300">📷 Bukti Transfer Pelanggan</h3>
            <div className="w-full h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
              <img src={selectedBuktiUrl} alt="Bukti Transfer" className="w-full h-full object-contain" />
            </div>
            <button onClick={() => setSelectedBuktiUrl(null)} className="w-full py-2 bg-slate-800 font-bold text-xs rounded-xl">Tutup</button>
          </div>
        </div>
      )}

      {/* Modal Profile Toko & QRIS */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-bold text-rose-300">⚙️ Pengaturan Profil Toko & QRIS</h2>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Warkop / Warung</label>
                <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Foto Logo Warkop</label>
                <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-400 file:py-1 file:px-3 file:rounded-xl file:bg-rose-950 file:text-rose-300" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Foto QRIS Pembayaran</label>
                <input type="file" accept="image/*" onChange={(e) => setQrisFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-400 file:py-1 file:px-3 file:rounded-xl file:bg-rose-950 file:text-rose-300" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={handleSaveStoreProfile} className="flex-1 py-2.5 bg-rose-500 text-slate-950 font-black text-xs rounded-xl">Simpan Perubahan</button>
              <button onClick={() => setShowProfileModal(false)} className="px-4 py-2.5 bg-slate-800 text-xs font-bold rounded-xl">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
