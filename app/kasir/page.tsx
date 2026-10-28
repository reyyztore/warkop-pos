'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function KasirDashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('semua')
  const [selectedBuktiUrl, setSelectedBuktiUrl] = useState<string | null>(null)

  // Profile Store & Multi-Tenant State
  const [storeId, setStoreId] = useState<string | null>(null)
  const [cashierName, setCashierName] = useState('')
  const [storeName, setStoreName] = useState('Warung Kopi Kita')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [qrisUrl, setQrisUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [qrisFile, setQrisFile] = useState<File | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Tampilan Toko State
  const [bgColor, setBgColor] = useState('#0f172a')
  const [primaryColor, setPrimaryColor] = useState('#10b981')
  const [announcement, setAnnouncement] = useState('')
  const [isOpen, setIsOpen] = useState(true)
  const [bannerUrl, setBannerUrl] = useState('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [showTampilanModal, setShowTampilanModal] = useState(false)

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

  const playIncomingOrderSound = () => {
    if (kasirSoundOption === 1) playBellSound()
    if (kasirSoundOption === 2) speakText('Ada pesanan masuk bos', false)
    if (kasirSoundOption === 3) speakText('Pesanan masuk nih', false)
  }

  useEffect(() => {
    checkAuthAndFetch()
  }, [])

  useEffect(() => {
    if (!storeId) return

    // Realtime Broadcast Khusus Store ID Ini
    const channel = supabase
      .channel(`kasir-dashboard-${storeId}`)
      .on('broadcast', { event: 'customer-ring-bell' }, (payload: any) => {
        playBellSound()
        const table = payload.payload?.tableNo || '??'
        setCustomerBellAlert(`🔔 Meja #${table} memanggil kasir!`)
        setTimeout(() => setCustomerBellAlert(null), 8000)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders', filter: `store_id=eq.${storeId}` }, () => {
        playIncomingOrderSound()
        fetchOrders(storeId)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `store_id=eq.${storeId}` }, () => {
        fetchOrders(storeId)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [storeId, kasirSoundOption])

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      window.location.href = '/kasir/login'
      return
    }

    // Ambil Profile User & Store ID
    const { data: profile } = await supabase.from('profiles').select('*, stores(*)').eq('id', session.user.id).single()
    
    if (profile) {
      setCashierName(profile.full_name || session.user.email?.split('@')[0] || 'Kasir')
      
      const currentStoreId = profile.store_id || profile.stores?.id
      if (currentStoreId) {
        setStoreId(currentStoreId)

        // Ambil Data Pengaturan Toko dari Tabel `stores`
        const { data: storeData } = await supabase.from('stores').select('*').eq('id', currentStoreId).single()
        if (storeData) {
          if (storeData.store_name) setStoreName(storeData.store_name)
          if (storeData.avatar_url) setAvatarUrl(storeData.avatar_url)
          if (storeData.qris_url) setQrisUrl(storeData.qris_url)
          if (storeData.bg_color) setBgColor(storeData.bg_color)
          if (storeData.primary_color) setPrimaryColor(storeData.primary_color)
          if (storeData.announcement) setAnnouncement(storeData.announcement)
          if (storeData.banner_url) setBannerUrl(storeData.banner_url)
          if (storeData.is_open !== undefined) setIsOpen(storeData.is_open)
        }

        fetchOrders(currentStoreId)
      } else {
        setLoading(false)
        alert('Akun kamu belum terhubung dengan toko mana pun. Silakan daftar toko terlebih dahulu.')
      }
    }
  }

  const fetchOrders = async (targetStoreId: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, tables(nomor), order_items(*, menu_items(nama))')
      .eq('store_id', targetStoreId)
      .order('created_at', { ascending: false })

    if (data) setOrders(data)
    setLoading(false)
  }

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    if (storeId) fetchOrders(storeId)
  }

  const togglePaidStatus = async (orderId: string, currentPaid: boolean) => {
    await supabase.from('orders').update({ is_paid: !currentPaid }).eq('id', orderId)
    if (storeId) fetchOrders(storeId)
  }

  const ringSpecificTableBell = async (tableNo: any) => {
    if (!storeId) return
    await supabase.channel(`meja-customer-${storeId}`).send({
      type: 'broadcast',
      event: 'ring-table-bell',
      payload: { tableNo },
    })
    alert(`🔔 Bel terkirim ke Meja #${tableNo}`)
  }

  const handleToggleStoreOpen = async () => {
    if (!storeId) return
    try {
      const nextOpenState = !isOpen
      setIsOpen(nextOpenState)

      const { error } = await supabase.from('stores').update({
        is_open: nextOpenState,
      }).eq('id', storeId)

      if (error) throw error
      alert(`Status toko berhasil diubah menjadi: ${nextOpenState ? 'BUKA ✅' : 'TUTUP 🚫'}`)
    } catch (e: any) {
      alert(`Gagal mengubah status toko: ${e.message}`)
    }
  }

  const handleSaveProfile = async () => {
    if (!storeId) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      let newAvatarUrl = avatarUrl
      let newQrisUrl = qrisUrl

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `store/${storeId}/avatar_${Date.now()}.${fileExt}`
        await supabase.storage.from('menu-images').upload(filePath, avatarFile)
        const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath)
        newAvatarUrl = data.publicUrl
      }

      if (qrisFile) {
        const fileExt = qrisFile.name.split('.').pop()
        const filePath = `store/${storeId}/qris_${Date.now()}.${fileExt}`
        await supabase.storage.from('menu-images').upload(filePath, qrisFile)
        const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath)
        newQrisUrl = data.publicUrl
      }

      // Update Akun Kasir
      await supabase.from('profiles').update({
        full_name: cashierName,
      }).eq('id', session.user.id)

      // Update Data Toko di Tabel Stores
      await supabase.from('stores').update({
        store_name: storeName,
        avatar_url: newAvatarUrl,
        qris_url: newQrisUrl,
      }).eq('id', storeId)

      setAvatarUrl(newAvatarUrl)
      setQrisUrl(newQrisUrl)
      setShowProfileModal(false)
      alert('✅ Profil Kasir, Nama Toko, Foto Logo & QRIS berhasil disimpan!')
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleSaveTampilan = async () => {
    if (!storeId) return
    try {
      let newBannerUrl = bannerUrl

      if (bannerFile) {
        const fileExt = bannerFile.name.split('.').pop()
        const filePath = `store/${storeId}/banner_${Date.now()}.${fileExt}`
        await supabase.storage.from('menu-images').upload(filePath, bannerFile)
        const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath)
        newBannerUrl = data.publicUrl
      }

      await supabase.from('stores').update({
        bg_color: bgColor,
        primary_color: primaryColor,
        announcement: announcement,
        banner_url: newBannerUrl,
        is_open: isOpen,
      }).eq('id', storeId)

      setBannerUrl(newBannerUrl)
      setShowTampilanModal(false)
      alert('🎨 Tampilan Toko berhasil diperbarui ke seluruh HP Pelanggan!')
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
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Header */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center text-xl">
            {avatarUrl ? <img src={avatarUrl} alt="Logo" className="w-full h-full object-cover" /> : '☕'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">{storeName}</h1>
              <button 
                onClick={handleToggleStoreOpen}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black transition active:scale-95 ${
                  isOpen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {isOpen ? '● Toko Buka' : '○ Toko Tutup'}
              </button>
            </div>
            <p className="text-xs text-slate-400">Kasir Aktif: <strong className="text-emerald-400">{cashierName}</strong></p>
          </div>
        </div>

        {/* Menu Navigasi Kasir */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowProfileModal(true)} className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-emerald-300 rounded-2xl flex items-center gap-1">
            <span>👤</span> Profil Kasir & QRIS
          </button>
          <button onClick={() => setShowTampilanModal(true)} className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-amber-300 rounded-2xl flex items-center gap-1">
            <span>🎨</span> Edit Tampilan Toko
          </button>
          <Link href="/kasir/menu" className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-2xl">
            🌸 Kelola Menu
          </Link>
          <Link href="/kasir/meja" className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-2xl">
            🪑 Kelola Meja
          </Link>
        </div>
      </div>

      {/* Alert Bell Pelanggan */}
      {customerBellAlert && (
        <div className="max-w-5xl mx-auto mt-4 p-3.5 bg-amber-500 text-slate-950 text-xs font-black rounded-2xl shadow-xl flex justify-between items-center">
          <span>{customerBellAlert}</span>
          <button onClick={() => setCustomerBellAlert(null)} className="text-xs px-2 py-1 bg-slate-950 text-white rounded-lg">Tutup</button>
        </div>
      )}

      {/* Pengaturan Sound */}
      <div className="max-w-5xl mx-auto mt-4 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <span>🔊</span> Suara Pesanan Masuk Kasir:
        </span>
        <select value={kasirSoundOption} onChange={(e) => setKasirSoundOption(Number(e.target.value))} className="bg-slate-950 border border-slate-800 text-xs text-white p-2 rounded-xl focus:outline-none">
          <option value={1}>1. Bel Biasa</option>
          <option value={2}>2. "Ada pesanan masuk bos"</option>
          <option value={3}>3. "Pesanan masuk nih"</option>
        </select>
      </div>

      {/* Ringkasan Omzet */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 relative z-10">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Omzet Hari Ini</p>
          <p className="text-xl font-black text-emerald-400 mt-1">Rp {totalOmzetHariIni.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Antrean Aktif</p>
          <p className="text-xl font-black text-amber-400 mt-1">{totalPesananAktif} Pesanan</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Transaksi</p>
          <p className="text-xl font-black text-blue-400 mt-1">{todayOrders.length} Pesanan</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-5xl mx-auto flex gap-2 overflow-x-auto mt-6 pb-1 no-scrollbar relative z-10">
        {[{ id: 'semua', label: 'Semua Status' }, { id: 'pending', label: '⏳ Baru' }, { id: 'diproses', label: '🍳 Diproses' }, { id: 'selesai', label: '✅ Selesai' }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${activeTab === tab.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Pesanan */}
      <div className="max-w-5xl mx-auto mt-4 relative z-10 space-y-3">
        {loading ? (
          <div className="h-44 bg-slate-900/50 rounded-3xl animate-pulse border border-slate-800" />
        ) : filteredOrders.map((ord) => (
          <div key={ord.id} className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3">
            <div className="flex justify-between items-start pb-3 border-b border-slate-800/80">
              <div className="space-y-0.5">
                <span className="text-sm font-black text-emerald-400">Meja #{ord.tables?.nomor || '-'}</span>
                
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-[11px] space-y-0.5 mt-1">
                  <p className="font-bold text-white">👤 Pemesan: {ord.nama_pemesan}</p>
                  <p className="text-slate-400">📧 Email: {ord.email_pemesan || 'Tamu / Tanpa Email'}</p>
                  <p className="text-slate-400">📱 No. HP/WA: {ord.phone_pemesan || '-'}</p>
                </div>

                <span className="text-[10px] text-slate-500 inline-block mt-1">Metode Bayar: <strong className="text-emerald-400">{ord.metode_pembayaran?.toUpperCase()}</strong></span>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${ord.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : ord.status === 'diproses' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>{ord.status}</span>
                
                <button onClick={() => ringSpecificTableBell(ord.tables?.nomor)} className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-1 rounded-lg font-bold">
                  🔔 Ring Meja #{ord.tables?.nomor}
                </button>
              </div>
            </div>

            <ul className="space-y-1 text-xs text-slate-300">
              {ord.order_items?.map((item: any) => (
                <li key={item.id} className="flex justify-between">
                  <span><strong className="text-emerald-400">{item.qty}x</strong> {item.menu_items?.nama}</span>
                  <span className="text-slate-500">Rp {(item.harga_satuan * item.qty).toLocaleString('id-ID')}</span>
                </li>
              ))}
            </ul>

            {ord.bukti_pembayaran_url && (
              <div className="p-2 bg-blue-950/40 border border-blue-800/60 rounded-xl flex justify-between items-center text-xs">
                <span className="text-blue-300 font-bold">📷 Bukti Transfer Pelanggan</span>
                <button onClick={() => setSelectedBuktiUrl(ord.bukti_pembayaran_url)} className="px-2.5 py-1 bg-blue-500 text-slate-950 font-black rounded-lg text-[10px]">
                  Lihat Bukti
                </button>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-black">
              <span>Total: <strong className="text-emerald-400">Rp {ord.total_harga?.toLocaleString('id-ID')}</strong></span>
              <button onClick={() => togglePaidStatus(ord.id, ord.is_paid)} className={`px-3 py-1 rounded-xl text-[10px] font-bold ${ord.is_paid ? 'bg-emerald-500 text-slate-950' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                {ord.is_paid ? '✅ Lunas' : '❌ Belum Bayar'}
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              {ord.status === 'pending' && <button onClick={() => updateStatus(ord.id, 'diproses')} className="flex-1 py-2 bg-amber-500 text-slate-950 text-xs font-black rounded-xl">Proses Pesanan</button>}
              {ord.status === 'diproses' && <button onClick={() => updateStatus(ord.id, 'selesai')} className="flex-1 py-2 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl">Selesaikan Pesanan</button>}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: PROFIL KASIR & QRIS */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-emerald-400">👤 Pengaturan Profil Kasir & QRIS</h2>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Akun Kasir</label>
                <input type="text" value={cashierName} onChange={(e) => setCashierName(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Warkop / Warung</label>
                <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Foto Logo Warkop</label>
                <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-400 file:py-1 file:px-3 file:rounded-xl file:bg-emerald-950 file:text-emerald-300" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Foto QRIS Pembayaran</label>
                <input type="file" accept="image/*" onChange={(e) => setQrisFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-400 file:py-1 file:px-3 file:rounded-xl file:bg-emerald-950 file:text-emerald-300" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={handleSaveProfile} className="flex-1 py-2.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl">Simpan Profil</button>
              <button onClick={() => setShowProfileModal(false)} className="px-4 py-2.5 bg-slate-800 text-xs font-bold rounded-xl">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT TAMPILAN TOKO */}
      {showTampilanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-amber-400">🎨 Edit Tampilan Toko</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs font-bold">Status Buka Toko</span>
                <button onClick={handleToggleStoreOpen} className={`px-4 py-1.5 rounded-xl text-xs font-black ${isOpen ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                  {isOpen ? 'TOKO BUKA' : 'TOKO TUTUP'}
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Pesan Pengumuman Toko</label>
                <input type="text" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Contoh: Promo Es Kopi Diskon 20%!" className="w-full p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Banner Promosi (Gambar)</label>
                <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-400 file:py-1 file:px-3 file:rounded-xl file:bg-amber-950 file:text-amber-300" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Warna Background</label>
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-9 bg-slate-950 border border-slate-800 rounded-xl p-1 cursor-pointer" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Warna Utama</label>
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full h-9 bg-slate-950 border border-slate-800 rounded-xl p-1 cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={handleSaveTampilan} className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl">Terapkan Ke Pelanggan</button>
              <button onClick={() => setShowTampilanModal(false)} className="px-4 py-2.5 bg-slate-800 text-xs font-bold rounded-xl">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* View Bukti Transfer Modal */}
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
    </div>
  )
}
