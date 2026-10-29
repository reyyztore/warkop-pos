'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// PRESET TEMA DENGAN KOMBINASI WARNA & EMOJI
const THEME_PRESETS = [
  { name: 'Slate Dark', bgColor: '#0f172a', textColor: '#ffffff', accentColor: '#10b981', emoji: '☕' },
  { name: 'Emerald Warkop', bgColor: '#064e3b', textColor: '#ecfdf5', accentColor: '#34d399', emoji: '🍵' },
  { name: 'Midnight Purple', bgColor: '#311042', textColor: '#fae8ff', accentColor: '#c084fc', emoji: '🧋' },
  { name: 'Warm Amber', bgColor: '#451a03', textColor: '#fef3c7', accentColor: '#f59e0b', emoji: '🥐' },
  { name: 'Rose Velvet', bgColor: '#4c0519', textColor: '#ffe4e6', accentColor: '#f43f5e', emoji: '🍰' },
  { name: 'Ocean Blue', bgColor: '#0c4a6e', textColor: '#e0f2fe', accentColor: '#38bdf8', emoji: '🍹' },
  { name: 'Neon Cyber', bgColor: '#09090b', textColor: '#ffffff', accentColor: '#22c55e', emoji: '⚡' },
  { name: 'Espresso Black', bgColor: '#121212', textColor: '#e5e5e5', accentColor: '#d97706', emoji: '☕' },
  { name: 'Retro Brown', bgColor: '#271c19', textColor: '#f5e0dc', accentColor: '#fb923c', emoji: '🍩' },
  { name: 'Mint Fresh', bgColor: '#022c22', textColor: '#a7f3d0', accentColor: '#10b981', emoji: '🍧' },
]

export default function KasirDashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('semua')
  const [selectedBuktiUrl, setSelectedBuktiUrl] = useState<string | null>(null)

  // Profile Store & Multi-Tenant State
  const [storeId, setStoreId] = useState<string | null>(null)
  const [storeSlug, setStoreSlug] = useState<string>('')
  const [cashierName, setCashierName] = useState('')
  const [storeName, setStoreName] = useState('Warung Kopi Kita')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [qrisUrl, setQrisUrl] = useState('')
  const [expiredAt, setExpiredAt] = useState<string | null>(null)
  const [daysRemaining, setDaysRemaining] = useState<number>(0)

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [qrisFile, setQrisFile] = useState<File | null>(null)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Tampilan Toko & Tema Kustom State
  const [announcement, setAnnouncement] = useState('')
  const [isOpen, setIsOpen] = useState(true)
  const [bannerUrl, setBannerUrl] = useState('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [showTampilanModal, setShowTampilanModal] = useState(false)

  // Fitur Wifi, Maps, WA Komplain, Sosmed, Jam Operasional, Fasilitas & Tema Visual
  const [mapsUrl, setMapsUrl] = useState('')
  const [waComplaint, setWaComplaint] = useState('')
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([])
  const [wifiActive, setWifiActive] = useState(false)
  const [wifiName, setWifiName] = useState('')
  const [wifiPassword, setWifiPassword] = useState('')
  const [jamOperasional, setJamOperasional] = useState('')
  const [fasilitasInput, setFasilitasInput] = useState('')
  const [themeStyle, setThemeStyle] = useState('glassmorphic')
  const [bgImageUrl, setBgImageUrl] = useState('')
  const [bgImageFile, setBgImageFile] = useState<File | null>(null)

  // 🎴 LOYALTY CARD STATE DISIMPAN KASIR
  const [loyaltyActive, setLoyaltyActive] = useState<boolean>(false)
  const [loyaltyCode, setLoyaltyCode] = useState<string>('')
  const [loyaltyMaxStamps, setLoyaltyMaxStamps] = useState<number>(10)

  const [selectedPreset, setSelectedPreset] = useState('Slate Dark')
  const [themeConfig, setThemeConfig] = useState({
    bgColor: '#0f172a',
    textColor: '#ffffff',
    accentColor: '#10b981',
    emoji: '☕'
  })

  // Sound Options & Notifications
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

    const channel = supabase
      .channel(`kasir-dashboard-${storeId}`)
      .on('broadcast', { event: 'customer-ring-bell' }, (payload: any) => {
        playBellSound()
        const table = payload.payload?.tableNo || '??'
        setCustomerBellAlert(`🔔 Meja #${table} memanggil kasir!`)
        setTimeout(() => setCustomerBellAlert(null), 8000)
      })
      .on('broadcast', { event: 'order-cancelled-by-customer' }, (payload: any) => {
        playBellSound()
        const table = payload.payload?.tableNo || '??'
        const name = payload.payload?.customerName || 'Pelanggan'
        speakText(`Pesanan di meja ${table} dibatalkan oleh pembeli`, false)
        setCustomerBellAlert(`🚫 Pesanan Meja #${table} (${name}) dibatalkan oleh pembeli!`)
        fetchOrders(storeId)
        setTimeout(() => setCustomerBellAlert(null), 10000)
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

    const { data: profile } = await supabase.from('profiles').select('*, stores(*)').eq('id', session.user.id).single()

    if (profile) {
      setCashierName(profile.full_name || session.user.email?.split('@')[0] || 'Kasir')

      let currentStoreId = profile.store_id
      if (!currentStoreId) {
        const { data: userStore } = await supabase.from('stores').select('id, slug').eq('owner_id', session.user.id).limit(1).single()
        if (userStore) {
          currentStoreId = userStore.id
          await supabase.from('profiles').update({ store_id: userStore.id }).eq('id', session.user.id)
        }
      }

      if (currentStoreId) {
        setStoreId(currentStoreId)

        const { data: storeData } = await supabase.from('stores').select('*').eq('id', currentStoreId).single()
        if (storeData) {
          setStoreSlug(storeData.slug || '')
          if (storeData.store_name) setStoreName(storeData.store_name)
          if (storeData.avatar_url) setAvatarUrl(storeData.avatar_url)
          if (storeData.qris_url) setQrisUrl(storeData.qris_url)
          if (storeData.announcement) setAnnouncement(storeData.announcement)
          if (storeData.banner_url) setBannerUrl(storeData.banner_url)
          if (storeData.is_open !== undefined) setIsOpen(storeData.is_open)

          // Load Info Tambahan
          if (storeData.maps_url) setMapsUrl(storeData.maps_url)
          if (storeData.wa_complaint) setWaComplaint(storeData.wa_complaint)
          if (storeData.social_links) setSocialLinks(storeData.social_links || [])
          if (storeData.wifi_active !== undefined) setWifiActive(storeData.wifi_active)
          if (storeData.wifi_name) setWifiName(storeData.wifi_name)
          if (storeData.wifi_password) setWifiPassword(storeData.wifi_password)
          if (storeData.jam_operasional) setJamOperasional(storeData.jam_operasional)
          if (storeData.fasilitas) setFasilitasInput(Array.isArray(storeData.fasilitas) ? storeData.fasilitas.join(', ') : '')
          if (storeData.theme_style) setThemeStyle(storeData.theme_style)
          if (storeData.bg_image_url) setBgImageUrl(storeData.bg_image_url)
          if (storeData.theme_config) setThemeConfig(storeData.theme_config)

          // Load Loyalty Settings
          if (storeData.loyalty_active !== undefined) setLoyaltyActive(storeData.loyalty_active)
          if (storeData.loyalty_code) setLoyaltyCode(storeData.loyalty_code)
          if (storeData.loyalty_max_stamps) setLoyaltyMaxStamps(storeData.loyalty_max_stamps)

          // Hitung Sisa Langganan
          if (storeData.expired_at) {
            setExpiredAt(storeData.expired_at)
            const diff = new Date(storeData.expired_at).getTime() - new Date().getTime()
            setDaysRemaining(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))))
          }
        }

        fetchOrders(currentStoreId)
      } else {
        setLoading(false)
        alert('Akun kamu belum terhubung dengan toko mana pun. Silakan mendaftar toko terlebih dahulu.')
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

      await supabase.from('stores').update({ is_open: nextOpenState }).eq('id', storeId)
      alert(`Status toko diubah menjadi: ${nextOpenState ? 'BUKA ✅' : 'TUTUP 🚫'}`)
    } catch (e: any) {
      alert(`Gagal: ${e.message}`)
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

      await supabase.from('profiles').update({ full_name: cashierName }).eq('id', session.user.id)
      await supabase.from('stores').update({
        store_name: storeName,
        avatar_url: newAvatarUrl,
        qris_url: newQrisUrl,
      }).eq('id', storeId)

      setAvatarUrl(newAvatarUrl)
      setQrisUrl(newQrisUrl)
      setShowProfileModal(false)
      alert('✅ Profil Kasir & Toko Berhasil Disimpan!')
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleSelectPresetTheme = (preset: typeof THEME_PRESETS[0]) => {
    setSelectedPreset(preset.name)
    setThemeConfig({
      bgColor: preset.bgColor,
      textColor: preset.textColor,
      accentColor: preset.accentColor,
      emoji: preset.emoji,
    })
  }

  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'Instagram', url: '' }])
  }

  const handleUpdateSocialLink = (index: number, key: 'platform' | 'url', value: string) => {
    const updated = [...socialLinks]
    updated[index][key] = value
    setSocialLinks(updated)
  }

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index))
  }

  const handleSaveTampilan = async () => {
    if (!storeId) return
    try {
      let newBannerUrl = bannerUrl
      let newBgImageUrl = bgImageUrl

      if (bannerFile) {
        const fileExt = bannerFile.name.split('.').pop()
        const filePath = `store/${storeId}/banner_${Date.now()}.${fileExt}`
        await supabase.storage.from('menu-images').upload(filePath, bannerFile)
        const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath)
        newBannerUrl = data.publicUrl
      }

      if (bgImageFile) {
        const fileExt = bgImageFile.name.split('.').pop()
        const filePath = `store/${storeId}/bg_${Date.now()}.${fileExt}`
        await supabase.storage.from('menu-images').upload(filePath, bgImageFile)
        const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath)
        newBgImageUrl = data.publicUrl
      }

      const meFasilitas = fasilitasInput ? fasilitasInput.split(',').map((f) => f.trim()).filter(Boolean) : []

      await supabase.from('stores').update({
        theme_config: themeConfig,
        theme_style: themeStyle,
        bg_image_url: newBgImageUrl,
        announcement: announcement,
        banner_url: newBannerUrl,
        is_open: isOpen,
        maps_url: mapsUrl,
        wa_complaint: waComplaint,
        social_links: socialLinks,
        wifi_active: wifiActive,
        wifi_name: wifiName,
        wifi_password: wifiPassword,
        jam_operasional: jamOperasional,
        fasilitas: meFasilitas,
        loyalty_active: loyaltyActive,
        loyalty_code: loyaltyCode,
        loyalty_max_stamps: loyaltyMaxStamps,
      }).eq('id', storeId)

      setBannerUrl(newBannerUrl)
      setBgImageUrl(newBgImageUrl)
      setShowTampilanModal(false)
      alert('🎨 Tampilan & Fitur Toko Berhasil Diperbarui!')
    } catch (e: any) {
      alert(e.message)
    }
  }

  const customerStoreUrl = typeof window !== 'undefined' && storeSlug ? `${window.location.origin}/st/${storeSlug}` : ''

  const isToday = (dateStr: string) => new Date(dateStr).toDateString() === new Date().toDateString()
  const todayOrders = orders.filter((o) => isToday(o.created_at))
  const todayCompleted = todayOrders.filter((o) => o.status === 'selesai')
  const totalOmzetHariIni = todayCompleted.reduce((acc, curr) => acc + (curr.total_harga || 0), 0)
  const totalPesananAktif = orders.filter((o) => o.status === 'pending' || o.status === 'diproses').length

  const filteredOrders = orders.filter((ord) => activeTab === 'semua' || ord.status === activeTab)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans pb-16 relative overflow-hidden">
      
      {/* Top Bar Header */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center text-xl shrink-0">
            {avatarUrl ? <img src={avatarUrl} alt="Logo" className="w-full h-full object-cover" /> : themeConfig.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">{storeName}</h1>
              <button 
                onClick={handleToggleStoreOpen}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                  isOpen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {isOpen ? '● Toko Buka' : '○ Toko Tutup'}
              </button>
            </div>
            <p className="text-xs text-slate-400">Kasir: <strong className="text-emerald-400">{cashierName}</strong></p>
          </div>
        </div>

        {/* Menu Navigasi Kasir */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowProfileModal(true)} className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-emerald-300 rounded-2xl">
            👤 Profil & QRIS
          </button>
          <button onClick={() => setShowTampilanModal(true)} className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-amber-300 rounded-2xl">
            🎨 Edit Tema & Info Toko
          </button>
          <Link href="/kasir/menu" className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-2xl">
            🌸 Kelola Menu
          </Link>
          <Link href="/kasir/meja" className="px-3.5 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-2xl">
            🪑 Kelola Meja
          </Link>
        </div>
      </div>

      {/* BOX LINK PELANGGAN KHUSUS TOKO INI */}
      {customerStoreUrl && (
        <div className="max-w-5xl mx-auto mt-4 p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <p className="font-bold text-emerald-300">🔗 Link Toko Pelanggan Kamu (Khusus Akun Ini):</p>
            <p className="text-slate-300 font-mono text-[11px] mt-0.5 select-all">{customerStoreUrl}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(customerStoreUrl)
                alert('✅ Link Toko berhasil disalin!')
              }}
              className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-xl"
            >
              📋 Salin Link
            </button>
            <a
              href={customerStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-white font-bold rounded-xl"
            >
              🌐 Buka Toko
            </a>
          </div>
        </div>
      )}

      {/* Alert Bell & Notifikasi Pembatalan Pelanggan */}
      {customerBellAlert && (
        <div className="max-w-5xl mx-auto mt-4 p-3.5 bg-amber-500 text-slate-950 text-xs font-black rounded-2xl shadow-xl flex justify-between items-center animate-bounce">
          <span>{customerBellAlert}</span>
          <button onClick={() => setCustomerBellAlert(null)} className="text-xs px-2 py-1 bg-slate-950 text-white rounded-lg">Tutup</button>
        </div>
      )}

      {/* Ringkasan Omzet */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Omzet Hari Ini</p>
          <p className="text-xl font-black text-emerald-400 mt-1">Rp {totalOmzetHariIni.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Antrean Aktif</p>
          <p className="text-xl font-black text-amber-400 mt-1">{totalPesananAktif} Pesanan</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Transaksi</p>
          <p className="text-xl font-black text-blue-400 mt-1">{todayOrders.length} Pesanan</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-5xl mx-auto flex gap-2 overflow-x-auto mt-6 pb-1 no-scrollbar">
        {[
          { id: 'semua', label: 'Semua Status' },
          { id: 'pending', label: '⏳ Baru' },
          { id: 'diproses', label: '🍳 Diproses' },
          { id: 'selesai', label: '✅ Selesai' },
          { id: 'batal', label: '❌ Dibatalkan' }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-2xl text-xs font-bold ${activeTab === tab.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Pesanan */}
      <div className="max-w-5xl mx-auto mt-4 space-y-3">
        {loading ? (
          <div className="h-44 bg-slate-900/50 rounded-3xl animate-pulse border border-slate-800" />
        ) : filteredOrders.map((ord) => (
          <div key={ord.id} className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3">
            <div className="flex justify-between items-start pb-3 border-b border-slate-800">
              <div>
                <span className="text-sm font-black text-emerald-400">Meja #{ord.tables?.nomor || '-'}</span>
                
                <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-[11px] space-y-0.5 mt-1">
                  <p className="font-bold text-white">👤 Pemesan: {ord.nama_pemesan}</p>
                  <p className="text-slate-400">📧 Email: {ord.email_pemesan || 'Tamu / Tanpa Email'}</p>
                  <p className="text-slate-400">📱 No. HP/WA: {ord.phone_pemesan || '-'}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${ord.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : ord.status === 'batal' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-300'}`}>{ord.status}</span>
                <button onClick={() => ringSpecificTableBell(ord.tables?.nomor)} className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-1 rounded-lg font-bold">
                  🔔 Ring Meja #{ord.tables?.nomor}
                </button>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              {ord.order_items?.map((item: any) => (
                <li key={item.id} className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60 space-y-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white"><strong className="text-emerald-400">{item.qty}x</strong> {item.menu_items?.nama}</span>
                      {item.varian && (
                        <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${item.varian === 'dingin' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                          {item.varian === 'dingin' ? '🧊 Dingin' : '🔥 Panas'}
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 font-mono">Rp {(item.harga_satuan * item.qty).toLocaleString('id-ID')}</span>
                  </div>
                  {item.catatan && (
                    <p className="text-[10px] text-amber-300/90 italic bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/30">
                      📝 Catatan: "{item.catatan}"
                    </p>
                  )}
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

      {/* MODAL PROFIL & LANGGANAN KASIR */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-emerald-400">👤 Pengaturan Profil & QRIS</h2>
            
            <div className="bg-slate-950 border border-amber-500/40 p-3.5 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">⏳ Masa Aktif Langganan Toko</span>
              <p className="text-xs font-bold text-white">
                Sisa Waktu: <span className="text-emerald-400 font-mono text-sm font-black">{daysRemaining} Hari</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Tanggal Kedaluwarsa: {expiredAt ? new Date(expiredAt).toLocaleDateString('id-ID') : 'Belum Ditentukan'}
              </p>
              <a
                href="https://wa.me/6285150725531?text=Halo%20Raihan,%20saya%20mau%20tambah%20waktu%20langganan%20sistem%20POS%20toko%20saya"
                target="_blank"
                rel="noreferrer"
                className="block text-center w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition"
              >
                ➕ Tambah Waktu Langganan (Chat Raihan WhatsApp)
              </a>
            </div>

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

      {/* MODAL EDIT TEMA VISUAL, BACKGROUND GAMBAR, WIFI, MAPS, SOSMED & LOYALTY CARD */}
      {showTampilanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-lg rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-amber-400">🎨 Edit Tema & Info Toko</h2>
            
            <div className="space-y-4">
              {/* PILIHAN TEMA VISUAL */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih Gaya Tema Visual Toko</label>
                <select
                  value={themeStyle}
                  onChange={(e) => setThemeStyle(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs rounded-xl text-white font-bold"
                >
                  <option value="glassmorphic">🍸 Gelas Kaca / Frosted Glass (Cerah Transparan)</option>
                  <option value="bubble">🫧 Gelembung Ceria (Merah Muda / Pink Pastel)</option>
                  <option value="fresh_mint">🍃 Fresh Mint (Hijau Muda)</option>
                  <option value="sky_blue">☁️ Soft Sky (Biru Muda)</option>
                  <option value="warm_latte">☕ Warm Latte (Cokelat Muda Aesthetic)</option>
                </select>
              </div>

              {/* UPLOAD CUSTOM BACKGROUND GAMBAR TOKO */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Foto Background Toko (Wallpaper Pelanggan)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBgImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:py-1 file:px-3 file:rounded-xl file:bg-amber-950 file:text-amber-300"
                />
              </div>

              {/* 🎴 FORM PENGATURAN LOYALTY CARD TOKO */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-400">🎴 Aktifkan Loyalty Card Toko</span>
                  <input
                    type="checkbox"
                    checked={loyaltyActive}
                    onChange={(e) => setLoyaltyActive(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </div>

                {loyaltyActive && (
                  <div className="space-y-2 pt-1 border-t border-slate-800">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Kode Loyalty Hari Ini</label>
                      <input
                        type="text"
                        placeholder="Contoh: WARKOPPING01"
                        value={loyaltyCode}
                        onChange={(e) => setLoyaltyCode(e.target.value.toUpperCase())}
                        className="w-full mt-1 p-2 bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-amber-300 rounded-xl uppercase"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Target Kotak Stamp</label>
                      <input
                        type="number"
                        min={3}
                        max={20}
                        value={loyaltyMaxStamps}
                        onChange={(e) => setLoyaltyMaxStamps(Number(e.target.value))}
                        className="w-full mt-1 p-2 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Pilihan Preset Warna */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih 10 Preset Warna Toko</label>
                <div className="grid grid-cols-2 gap-2 mt-1 max-h-36 overflow-y-auto p-1">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPresetTheme(preset)}
                      className={`p-2 rounded-xl text-left text-xs font-bold border flex items-center justify-between ${
                        themeConfig.bgColor === preset.bgColor ? 'border-amber-400 bg-slate-950' : 'border-slate-800 bg-slate-950/40'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{preset.emoji}</span>
                        <span className="text-white text-[11px]">{preset.name}</span>
                      </span>
                      <div className="w-4 h-4 rounded-full border border-slate-700" style={{ backgroundColor: preset.bgColor }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Emoji & Status Toko */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Emoji Toko</label>
                  <input
                    type="text"
                    value={themeConfig.emoji}
                    onChange={(e) => setThemeConfig({ ...themeConfig, emoji: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 text-xs text-center rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Status Toko</label>
                  <button onClick={handleToggleStoreOpen} type="button" className={`w-full p-2.5 rounded-xl text-xs font-black ${isOpen ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                    {isOpen ? 'TOKO BUKA' : 'TOKO TUTUP'}
                  </button>
                </div>
              </div>

              {/* Jam Operasional & Fasilitas Toko */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Jam Operasional Toko</label>
                <input
                  type="text"
                  placeholder="Contoh: Setiap Hari 09.00 - 23.00 WIB"
                  value={jamOperasional}
                  onChange={(e) => setJamOperasional(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Fasilitas Toko (Pisahkan Koma)</label>
                <input
                  type="text"
                  placeholder="Contoh: 🔌 Colokan Listrik, ❄️ AC, 🚬 Smoking Area, 🎮 Board Game"
                  value={fasilitasInput}
                  onChange={(e) => setFasilitasInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Pesan Pengumuman</label>
                <input type="text" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Banner Promosi</label>
                <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-400 file:py-1 file:px-3 file:rounded-xl file:bg-amber-950 file:text-amber-300" />
              </div>

              {/* Pengaturan Wifi Toko */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-300">📶 Fasilitas Wi-Fi Toko</span>
                  <input type="checkbox" checked={wifiActive} onChange={(e) => setWifiActive(e.target.checked)} className="w-4 h-4" />
                </div>
                {wifiActive && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <input type="text" placeholder="Nama Wifi (SSID)" value={wifiName} onChange={(e) => setWifiName(e.target.value)} className="p-2 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl" />
                    <input type="text" placeholder="Password Wifi" value={wifiPassword} onChange={(e) => setWifiPassword(e.target.value)} className="p-2 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl" />
                  </div>
                )}
              </div>

              {/* Google Maps & WA Komplain */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Link Google Maps Toko</label>
                <input type="text" placeholder="https://maps.google.com/..." value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nomor WhatsApp Komplain Toko</label>
                <input type="tel" placeholder="081234567890" value={waComplaint} onChange={(e) => setWaComplaint(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl" />
              </div>

              {/* Social Links Dynamic */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Link Media Sosial Toko</label>
                  <button type="button" onClick={handleAddSocialLink} className="text-[10px] px-2 py-1 bg-amber-500/20 text-amber-300 rounded-lg font-bold">+ Tambah Sosmed</button>
                </div>
                {socialLinks.map((link, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input type="text" placeholder="Instagram / TikTok" value={link.platform} onChange={(e) => handleUpdateSocialLink(idx, 'platform', e.target.value)} className="w-1/3 p-2 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl" />
                    <input type="text" placeholder="https://instagram.com/..." value={link.url} onChange={(e) => handleUpdateSocialLink(idx, 'url', e.target.value)} className="flex-1 p-2 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl" />
                    <button type="button" onClick={() => handleRemoveSocialLink(idx)} className="text-xs text-rose-400 font-bold px-1.5">✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={handleSaveTampilan} className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl">Terapkan Perubahan</button>
              <button onClick={() => setShowTampilanModal(false)} className="px-4 py-2.5 bg-slate-800 text-xs font-bold rounded-xl">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal View Bukti */}
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
