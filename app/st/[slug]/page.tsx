'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function DynamicStoreContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params?.slug as string
  const mejaParam = searchParams.get('meja')
  const supabase = createClient()

  // Auth & Animated Eye Tracker State
  const [session, setSession] = useState<any>(null)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authPhone, setAuthPhone] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 })

  // Customer Sound Bell Option
  const [customerSoundOption, setCustomerSoundOption] = useState<number>(1)

  const [activeNav, setActiveNav] = useState<'menu' | 'status' | 'game' | 'profile'>('menu')
  const [selectedGame, setSelectedGame] = useState<number>(1)

  // Toko X State
  const [storeData, setStoreData] = useState<any>(null)
  const [storeId, setStoreId] = useState<string>('')
  const [storeName, setStoreName] = useState('Warung Kopi')
  const [storeAvatar, setStoreAvatar] = useState('')
  const [qrisUrl, setQrisUrl] = useState('')
  const [bgColor, setBgColor] = useState('#0f172a')
  const [announcement, setAnnouncement] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [isOpen, setIsOpen] = useState(true)

  // Data Menu & Cart
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [cart, setCart] = useState<{ [key: string]: number }>({})
  const [selectedTable, setSelectedTable] = useState(mejaParam || '')
  const [tables, setTables] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<'qris' | 'kasir'>('kasir')

  // Modal State QRIS & Bukti
  const [showQrisModal, setShowQrisModal] = useState(false)
  const [activeOrderForQris, setActiveOrderForQris] = useState<any>(null)
  const [uploadingBukti, setUploadingBukti] = useState(false)
  const [buktiFile, setBuktiFile] = useState<File | null>(null)

  // Data Pelanggan & Status Pesanan
  const [myOrders, setMyOrders] = useState<any[]>([])
  const [userData, setUserData] = useState<{ name: string; phone: string; email: string; avatarUrl: string }>({
    name: '',
    phone: '',
    email: '',
    avatarUrl: '',
  })
  const [editingName, setEditingName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // --- 10 GAMES STATES ---
  const [tttBoard, setTttBoard] = useState(Array(9).fill(null))
  const [tttIsX, setTttIsX] = useState(true)
  const [guessTarget, setGuessTarget] = useState(Math.floor(Math.random() * 20) + 1)
  const [guessInput, setGuessInput] = useState('')
  const [guessMsg, setGuessMsg] = useState('Tebak angka 1 - 20!')
  const [rpsResult, setRpsResult] = useState('Pilih salah satu!')
  const [cards, setCards] = useState(['☕', '☕', '🥐', '🥐', '🍰', '🍰', '🧃', '🧃'].sort(() => Math.random() - 0.5))
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [clicks, setClicks] = useState(0)
  const [mathA, setMathA] = useState(Math.floor(Math.random() * 10) + 1)
  const [mathB, setMathB] = useState(Math.floor(Math.random() * 10) + 1)
  const [mathAns, setMathAns] = useState('')
  const [mathMsg, setMathMsg] = useState('Jawab pertanyaan matematika!')
  const [colorTarget, setColorTarget] = useState('#EF4444')
  const [colorMsg, setColorMsg] = useState('Pilih warna yang sesuai!')
  const [coinResult, setCoinResult] = useState('Tekan tombol untuk lempar koin!')
  const [scrambleWord] = useState('WARKOP')
  const [scrambleInput, setScrambleInput] = useState('')
  const [scrambleMsg, setScrambleMsg] = useState('Susun kata: A K R P O W')
  const [reactState, setReactState] = useState<'idle' | 'waiting' | 'ready'>('idle')
  const [reactTime, setReactTime] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number>(0)

  // Audio Voice Helper
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'id-ID'
    window.speechSynthesis.speak(utterance)
  }

  const playCustomerBellSound = () => {
    if (customerSoundOption === 1) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        const audioCtx = new AudioCtx()
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime)
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2)
        osc.connect(gain)
        gain.connect(audioCtx.destination)
        osc.start()
        osc.stop(audioCtx.currentTime + 1.2)
      } catch (e) {}
    } else if (customerSoundOption === 2) {
      speakText(`Pesanan kamu di Meja ${selectedTable || ''} sudah siap kak!`)
    } else if (customerSoundOption === 3) {
      speakText('Halo, pesanan kamu sudah jadi, silakan diambil ya!')
    }
  }

  // Mouse move tracker untuk animasi mata mengintai
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const offsetX = (e.clientX / window.innerWidth - 0.5) * 12
      const offsetY = (e.clientY / window.innerHeight - 0.5) * 12
      setPupilPos({ x: offsetX, y: offsetY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    checkSession()
    if (slug) fetchStoreDetails()
  }, [slug])

  useEffect(() => {
    if (!storeId) return

    // Realtime Listener Khusus Toko X
    const channel = supabase
      .channel(`meja-customer-${storeId}`)
      .on('broadcast', { event: 'ring-table-bell' }, (payload: any) => {
        if (payload.payload?.tableNo?.toString() === selectedTable?.toString()) {
          playCustomerBellSound()
          alert(`🔔 Meja #${selectedTable}: Dipanggil Kasir Toko! Pesanan Kamu Siap.`)
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `store_id=eq.${storeId}` }, (payload: any) => {
        if (userData.name) fetchMyOrders(storeId, userData.name)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'stores', filter: `id=eq.${storeId}` }, (payload: any) => {
        if (payload.new) updateStoreConfig(payload.new)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [storeId, selectedTable, userData.name, customerSoundOption])

  const checkSession = async () => {
    const { data: { session: activeSession } } = await supabase.auth.getSession()
    if (activeSession) {
      setSession(activeSession)
      const name = activeSession.user.user_metadata?.full_name || activeSession.user.email?.split('@')[0] || 'Pelanggan'
      const phone = activeSession.user.user_metadata?.phone || '-'
      const email = activeSession.user.email || ''
      const avatarUrl = activeSession.user.user_metadata?.avatar_url || ''
      setUserData({ name, phone, email, avatarUrl })
      setEditingName(name)
      if (storeId) fetchMyOrders(storeId, name)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    try {
      if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: { full_name: authName, phone: authPhone },
          },
        })
        if (error) throw error
        alert('🎉 Pendaftaran berhasil! Silakan login.')
        setAuthMode('login')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        })
        if (error) throw error
        setSession(data.session)
        const name = data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'Pelanggan'
        const phone = data.session.user.user_metadata?.phone || '-'
        const email = data.session.user.email || ''
        const avatarUrl = data.session.user.user_metadata?.avatar_url || ''
        setUserData({ name, phone, email, avatarUrl })
        setEditingName(name)
        if (storeId) fetchMyOrders(storeId, name)
      }
    } catch (err: any) {
      alert(err.message || 'Gagal autentikasi.')
    } finally {
      setAuthLoading(false)
    }
  }

  const fetchStoreDetails = async () => {
    setLoading(true)
    const { data: store } = await supabase.from('stores').select('*').eq('slug', slug).single()

    if (store) {
      setStoreData(store)
      setStoreId(store.id)
      updateStoreConfig(store)

      const { data: catData } = await supabase.from('categories').select('*').eq('store_id', store.id).order('urutan')
      const { data: menuData } = await supabase.from('menu_items').select('*').eq('store_id', store.id).eq('tersedia', true)
      const { data: tblData } = await supabase.from('tables').select('*').eq('store_id', store.id).eq('aktif', true).order('nomor')

      if (catData) setCategories(catData)
      if (menuData) setMenuItems(menuData)
      if (tblData) setTables(tblData)

      if (userData.name) fetchMyOrders(store.id, userData.name)
    }
    setLoading(false)
  }

  const updateStoreConfig = (store: any) => {
    if (store.store_name) setStoreName(store.store_name)
    if (store.avatar_url) setStoreAvatar(store.avatar_url)
    if (store.qris_url) setQrisUrl(store.qris_url)
    if (store.bg_color) setBgColor(store.bg_color)
    if (store.announcement) setAnnouncement(store.announcement)
    if (store.banner_url) setBannerUrl(store.banner_url)
    if (store.is_open !== undefined) setIsOpen(store.is_open)
  }

  const fetchMyOrders = async (targetStoreId: string, nameFilter: string) => {
    if (!targetStoreId || !nameFilter) return

    const { data } = await supabase
      .from('orders')
      .select('*, tables(nomor), order_items(*, menu_items(nama))')
      .eq('store_id', targetStoreId)
      .eq('nama_pemesan', nameFilter)
      .order('created_at', { ascending: false })

    if (data) setMyOrders(data)
  }

  const updateCart = (id: string, delta: number) => {
    if (!isOpen) return
    setCart((prev) => {
      const current = prev[id] || 0
      const updated = current + delta
      if (updated <= 0) {
        const copy = { ...prev }
        delete copy[id]
        return copy
      }
      return { ...prev, [id]: updated }
    })
  }

  const getTotalHarga = () => Object.entries(cart).reduce((total, [id, qty]) => {
    const item = menuItems.find((m) => m.id === id)
    return total + (item ? item.harga * qty : 0)
  }, 0)

  const getTotalItem = () => Object.values(cart).reduce((a, b) => a + b, 0)

  const handleCheckout = async () => {
    if (!isOpen) {
      alert('Maaf, Toko sedang TUTUP. Pemesanan tidak dapat diproses.')
      return
    }
    if (!selectedTable) {
      alert('Silakan pilih nomor meja kamu terlebih dahulu!')
      return
    }
    if (Object.keys(cart).length === 0) {
      alert('Pilih minimal 1 menu sebelum memesan.')
      return
    }

    setSubmitting(true)
    try {
      const targetTable = tables.find((t) => t.nomor.toString() === selectedTable.toString())
      if (!targetTable) throw new Error('Meja tidak valid.')

      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert({
          store_id: storeId,
          table_id: targetTable.id,
          nama_pemesan: userData.name,
          email_pemesan: userData.email || null,
          phone_pemesan: userData.phone,
          total_harga: getTotalHarga(),
          status: 'pending',
          metode_pembayaran: selectedPayment,
          is_paid: false,
        })
        .select()
        .single()

      if (orderErr) throw orderErr

      const orderItems = Object.entries(cart).map(([menuId, qty]) => {
        const item = menuItems.find((m) => m.id === menuId)
        return {
          order_id: orderData.id,
          menu_id: menuId,
          qty,
          harga_satuan: item?.harga || 0,
        }
      })

      await supabase.from('order_items').insert(orderItems)

      if (selectedPayment === 'qris') {
        setActiveOrderForQris(orderData)
        setShowQrisModal(true)
      } else {
        alert('🚀 Pesanan berhasil dikirim ke kasir toko!')
      }

      setCart({})
      setActiveNav('status')
      fetchMyOrders(storeId, userData.name)
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim pesanan.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNudgeKasir = async () => {
    if (!storeId) return
    await supabase.channel(`kasir-dashboard-${storeId}`).send({
      type: 'broadcast',
      event: 'customer-ring-bell',
      payload: { tableNo: selectedTable || '??', customerName: userData.name },
    })
    alert(`🔔 Bel Meja #${selectedTable} telah dibunyikan di Kasir Toko!`)
  }

  const handleUploadBukti = async (orderId: string) => {
    if (!buktiFile || !storeId) {
      alert('Pilih file foto bukti transfer terlebih dahulu.')
      return
    }

    setUploadingBukti(true)
    try {
      const fileExt = buktiFile.name.split('.').pop()
      const filePath = `store/${storeId}/bukti_order_${orderId}_${Date.now()}.${fileExt}`

      await supabase.storage.from('menu-images').upload(filePath, buktiFile)
      const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath)

      await supabase.from('orders').update({
        bukti_pembayaran_url: data.publicUrl,
      }).eq('id', orderId)

      alert('✅ Bukti pembayaran berhasil terkirim ke kasir toko!')
      setBuktiFile(null)
      setShowQrisModal(false)
      fetchMyOrders(storeId, userData.name)
    } catch (e: any) {
      alert(e.message || 'Gagal mengirim bukti pembayaran.')
    } finally {
      setUploadingBukti(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      let avatarUrl = userData.avatarUrl
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `avatars/cust_${Date.now()}.${fileExt}`
        await supabase.storage.from('menu-images').upload(filePath, avatarFile)
        const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath)
        avatarUrl = data.publicUrl
      }

      if (session) {
        await supabase.auth.updateUser({
          data: { full_name: editingName, avatar_url: avatarUrl },
        })
      }

      setUserData((prev) => ({ ...prev, name: editingName, avatarUrl }))
      alert('Profil pelanggan berhasil diperbarui!')
    } catch (e: any) {
      alert(e.message)
    }
  }

  const filteredMenuItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(m => m.category_id === activeCategory)

  const winner = calculateWinner(tttBoard)

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-xs">Memuat toko {slug}...</div>
  }

  if (!storeData) {
    return <div className="min-h-screen bg-slate-950 text-rose-400 flex items-center justify-center text-xs">Toko tidak ditemukan.</div>
  }

  // TAMPILAN LOGIN DENGAN ANIMASI MATA MENGINTAI INTERAKTIF
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5 text-center shadow-2xl relative z-10">
          
          {/* Karakter Animasi Mengintai */}
          <div className="relative w-24 h-24 mx-auto bg-slate-800 rounded-full border-2 border-emerald-500 flex items-center justify-center overflow-hidden">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center relative">
                {!isPasswordFocused ? (
                  <div className="w-3 h-3 bg-slate-950 rounded-full transition-transform duration-75" style={{ transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)` }} />
                ) : (
                  <span className="text-[10px] text-slate-950 font-black">🙈</span>
                )}
              </div>
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center relative">
                {!isPasswordFocused ? (
                  <div className="w-3 h-3 bg-slate-950 rounded-full transition-transform duration-75" style={{ transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)` }} />
                ) : (
                  <span className="text-[10px] text-slate-950 font-black">🙈</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-lg font-black text-white">{storeName}</h1>
            <p className="text-xs text-slate-400 mt-1">Masuk untuk pesan makanan dari meja kamu.</p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button onClick={() => setAuthMode('login')} className={`flex-1 py-1.5 rounded-lg ${authMode === 'login' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>Masuk</button>
            <button onClick={() => setAuthMode('register')} className={`flex-1 py-1.5 rounded-lg ${authMode === 'register' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>Daftar</button>
          </div>

          <form onSubmit={handleAuth} className="space-y-3 text-left">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</label>
                  <input type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} required placeholder="Budi Santoso" className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">No. HP / WA</label>
                  <input type="text" value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} required placeholder="08123456789" className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl" />
                </div>
              </>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Email Pelanggan</label>
              <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required placeholder="pelanggan@gmail.com" className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Kata Sandi</label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                required
                placeholder="••••••••"
                className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl"
              />
            </div>

            <button type="submit" disabled={authLoading} className="w-full py-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl">
              {authLoading ? 'Memproses...' : authMode === 'login' ? 'Masuk & Mulai Pesan ➔' : 'Daftar Akun Baru ➔'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-slate-100 pb-28 font-sans transition-colors duration-300" style={{ backgroundColor: bgColor }}>
      
      {/* Banner Status Buka / Tutup Toko Realtime */}
      {!isOpen ? (
        <div className="bg-rose-600 text-white p-3 text-center text-xs font-black shadow-lg sticky top-0 z-30">
          🚫 TOKO SEDANG TUTUP. Anda hanya dapat melihat menu saat ini.
        </div>
      ) : (
        <div className="bg-emerald-600 text-slate-950 p-1.5 text-center text-[10px] font-bold">
          ● Toko Sedang Buka (Siap Menerima Pesanan)
        </div>
      )}

      {/* Top Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0">
              {storeAvatar ? <img src={storeAvatar} alt="Logo" className="w-full h-full object-cover" /> : '☕'}
            </div>
            <div>
              <span className="text-[9px] font-bold tracking-wider text-emerald-400 uppercase">Warkop Digital</span>
              <h1 className="text-base font-extrabold text-white line-clamp-1">{storeName}</h1>
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-800 text-emerald-400 font-bold text-xs px-3 py-2 pr-7 rounded-xl focus:outline-none"
            >
              <option value="">Pilih Meja</option>
              {tables.map((t) => (
                <option key={t.id} value={t.nomor}>Meja #{t.nomor}</option>
              ))}
            </select>
            <span className="absolute right-2.5 top-2.5 text-[10px] text-emerald-400 pointer-events-none">▼</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        
        {/* Banner Promosi dari Kasir Toko X */}
        {bannerUrl && (
          <div className="w-full h-36 rounded-2xl overflow-hidden border border-slate-800">
            <img src={bannerUrl} alt="Banner Promosi" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Pengumuman Toko X */}
        {announcement && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-2xl text-center">
            📢 {announcement}
          </div>
        )}

        {/* TAB 1: MENU KATALOG */}
        {activeNav === 'menu' && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${
                  activeCategory === 'all' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                Semua Menu
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${
                    activeCategory === cat.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {cat.nama}
                </button>
              ))}
            </div>

            {filteredMenuItems.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8 bg-slate-900/40 border border-slate-800 rounded-2xl">Belum ada menu di toko ini.</p>
            ) : (
              filteredMenuItems.map((item) => {
                const qty = cart[item.id] || 0
                return (
                  <div key={item.id} className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center gap-3.5">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                      {item.foto_url ? <img src={item.foto_url} alt={item.nama} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">☕</div>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm line-clamp-1">{item.nama}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{item.deskripsi || 'Racikan khas toko kami.'}</p>
                      <p className="text-xs font-black text-emerald-400 mt-1.5">Rp {item.harga?.toLocaleString('id-ID')}</p>
                    </div>

                    <div className="flex flex-col items-center">
                      {qty > 0 ? (
                        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
                          <button onClick={() => updateCart(item.id, -1)} className="w-7 h-7 bg-slate-800 text-white rounded-lg text-xs font-bold">-</button>
                          <span className="w-6 text-center text-xs font-black text-emerald-400">{qty}</span>
                          <button onClick={() => updateCart(item.id, 1)} disabled={!isOpen} className="w-7 h-7 bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold disabled:opacity-50">+</button>
                        </div>
                      ) : (
                        <button onClick={() => updateCart(item.id, 1)} disabled={!isOpen} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl disabled:opacity-50">+ Tambah</button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* TAB 2: STATUS PESANAN */}
        {activeNav === 'status' && (
          <div className="space-y-4">
            <div className="bg-amber-950/30 border border-amber-500/30 p-3.5 rounded-2xl text-center space-y-1">
              <p className="text-xs font-bold text-amber-300">🔔 Panggil Kasir Ke Meja Kamu</p>
              <button onClick={handleNudgeKasir} className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-black rounded-xl">🔔 Pencet Bel Panggil Kasir Toko</button>
            </div>

            {myOrders.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-400">Belum ada pesanan aktif di toko ini saat ini.</div>
            ) : myOrders.map((ord) => (
              <div key={ord.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-emerald-400">Meja #{ord.tables?.nomor || '-'}</span>
                    <p className="text-[10px] text-slate-500">{new Date(ord.created_at).toLocaleString('id-ID')}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${ord.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{ord.status}</span>
                </div>

                <div className="flex gap-2 pt-1 border-t border-b border-slate-800/80 py-2">
                  <button onClick={() => { setActiveOrderForQris(ord); setShowQrisModal(true); }} className="flex-1 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800/80 text-xs font-bold rounded-xl">📲 Lihat QRIS Toko</button>
                  <button onClick={() => { setActiveOrderForQris(ord); setShowQrisModal(true); }} className="flex-1 py-1.5 bg-blue-950 text-blue-300 border border-blue-800/80 text-xs font-bold rounded-xl">📤 Kirim Bukti Bayar</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: 10 MINI GAMES ANTI-BOSAN */}
        {activeNav === 'game' && (
          <div className="space-y-4 text-center">
            <h2 className="text-base font-bold text-white">🎮 Arena 10 Games Anti-Bosan</h2>
            
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {[
                { id: 1, name: '1. TicTacToe' },
                { id: 2, name: '2. Tebak Angka' },
                { id: 3, name: '3. Su-Wit' },
                { id: 4, name: '4. Memory' },
                { id: 5, name: '5. Clicker' },
                { id: 6, name: '6. Kuis Math' },
                { id: 7, name: '7. Tebak Warna' },
                { id: 8, name: '8. Lempar Koin' },
                { id: 9, name: '9. Acak Kata' },
                { id: 10, name: '10. Tes Reaksi' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGame(g.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${
                    selectedGame === g.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>

            {/* Game 1: TicTacToe (Lengkap Indicator) */}
            {selectedGame === 1 && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl inline-block max-w-xs w-full space-y-3">
                <p className="text-xs font-bold text-emerald-400">
                  {winner ? `🎉 PEMENANG: ${winner}!` : tttBoard.every(Boolean) ? '🤝 HASIL SERI!' : `Giliran Main: ${tttIsX ? '❌' : '⭕'}`}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {tttBoard.map((cell, idx) => (
                    <button key={idx} onClick={() => {
                      if (cell || winner) return
                      const next = [...tttBoard]
                      next[idx] = tttIsX ? '❌' : '⭕'
                      setTttBoard(next)
                      setTttIsX(!tttIsX)
                    }} className="h-16 bg-slate-950 border border-slate-800 text-xl font-black rounded-xl text-white">
                      {cell}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setTttBoard(Array(9).fill(null)); setTttIsX(true); }} className="px-4 py-2 bg-slate-800 text-xs font-bold rounded-xl text-white">🔄 Reset Game</button>
              </div>
            )}

            {/* Game 2: Tebak Angka */}
            {selectedGame === 2 && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                <p className="text-xs font-bold text-emerald-400">{guessMsg}</p>
                <input type="number" value={guessInput} onChange={(e) => setGuessInput(e.target.value)} placeholder="Masukkan angka (1-20)" className="w-full p-2.5 bg-slate-950 border border-slate-800 text-center text-xs font-bold text-white rounded-xl" />
                <div className="flex gap-2">
                  <button onClick={() => {
                    const num = parseInt(guessInput)
                    if (num === guessTarget) setGuessMsg('🎉 BENAR KAN! Kamu menang!')
                    else if (num < guessTarget) setGuessMsg('Too low! Angka lebih besar.')
                    else setGuessMsg('Too high! Angka lebih kecil.')
                  }} className="flex-1 py-2 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl">Tebak!</button>
                  <button onClick={() => { setGuessTarget(Math.floor(Math.random() * 20) + 1); setGuessInput(''); setGuessMsg('Tebak angka 1 - 20!'); }} className="px-3 py-2 bg-slate-800 text-xs font-bold rounded-xl">🔄 Reset</button>
                </div>
              </div>
            )}

            {/* Game 3: Suwit */}
            {selectedGame === 3 && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                <p className="text-xs font-bold text-emerald-400">{rpsResult}</p>
                <div className="flex justify-center gap-2">
                  {['✊ Batu', '✋ Kertas', '✌️ Gunting'].map((choice, i) => (
                    <button key={i} onClick={() => {
                      const bot = ['✊ Batu', '✋ Kertas', '✌️ Gunting'][Math.floor(Math.random() * 3)]
                      setRpsResult(`Kamu: ${choice} vs Bot: ${bot}`)
                    }} className="px-3 py-2 bg-slate-950 border border-slate-800 text-xs font-bold rounded-xl">{choice}</button>
                  ))}
                </div>
                <button onClick={() => setRpsResult('Pilih salah satu!')} className="px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-xl">🔄 Reset</button>
              </div>
            )}

            {/* Game 4: Memory */}
            {selectedGame === 4 && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {cards.map((card, idx) => (
                    <button key={idx} onClick={() => {
                      if (flipped.length < 2 && !flipped.includes(idx)) {
                        const nextFlipped = [...flipped, idx]
                        setFlipped(nextFlipped)
                        if (nextFlipped.length === 2) {
                          if (cards[nextFlipped[0]] === cards[nextFlipped[1]]) setMatched((m) => [...m, nextFlipped[0], nextFlipped[1]])
                          setTimeout(() => setFlipped([]), 800)
                        }
                      }
                    }} className="h-14 bg-slate-950 border border-slate-800 text-lg rounded-xl">
                      {flipped.includes(idx) || matched.includes(idx) ? card : '❓'}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setCards(['☕', '☕', '🥐', '🥐', '🍰', '🍰', '🧃', '🧃'].sort(() => Math.random() - 0.5)); setFlipped([]); setMatched([]); }} className="px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-xl">🔄 Reset Card</button>
              </div>
            )}

            {/* Game 5: Clicker */}
            {selectedGame === 5 && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                <p className="text-xs font-bold text-emerald-400">Total Klik: {clicks}</p>
                <button onClick={() => setClicks(clicks + 1)} className="w-full py-6 bg-emerald-500 text-slate-950 font-black text-lg rounded-2xl">⚡ KLIK SECEPATNYA!</button>
                <button onClick={() => setClicks(0)} className="px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-xl">🔄 Reset Skor</button>
              </div>
            )}

            {/* Game 6: Kuis Math */}
            {selectedGame === 6 && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                <p className="text-xs font-bold text-emerald-400">{mathMsg}</p>
                <p className="text-sm font-black text-white">{mathA} + {mathB} = ?</p>
                <input type="number" value={mathAns} onChange={(e) => setMathAns(e.target.value)} placeholder="Hasil?" className="w-full p-2 bg-slate-950 border border-slate-800 text-center text-xs rounded-xl text-white" />
                <div className="flex gap-2">
                  <button onClick={() => {
                    if (parseInt(mathAns) === mathA + mathB) setMathMsg('✅ Benar Sekali!')
                    else setMathMsg('❌ Salah, coba lagi!')
                  }} className="flex-1 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl">Jawab</button>
                  <button onClick={() => { setMathA(Math.floor(Math.random() * 10) + 1); setMathB(Math.floor(Math.random() * 10) + 1); setMathAns(''); setMathMsg('Jawab pertanyaan matematika!'); }} className="px-3 py-2 bg-slate-800 text-xs font-bold rounded-xl">🔄 Soal Baru</button>
                </div>
              </div>
            )}

            {/* Game 7: Color Guess */}
            {selectedGame === 7 && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                <p className="text-xs font-bold text-emerald-400">{colorMsg}</p>
                <div className="w-16 h-16 rounded-2xl mx-auto border-2 border-white" style={{ backgroundColor: colorTarget }} />
                <div className="flex justify-center gap-2">
                  {['#EF4444', '#10B981', '#3B82F6'].map((c, i) => (
                    <button key={i} onClick={() => {
                      if (c === colorTarget) setColorMsg('🎉 Benar! Warna pas.')
                      else setColorMsg('❌ Warna salah!')
                    }} className="px-3 py-2 bg-slate-950 border border-slate-800 text-xs font-bold rounded-xl" style={{ color: c }}>Warna {i+1}</button>
                  ))}
                </div>
                <button onClick={() => {
                  const colors = ['#EF4444', '#10B981', '#3B82F6']
                  setColorTarget(colors[Math.floor(Math.random() * colors.length)])
                  setColorMsg('Pilih warna yang sesuai!')
                }} className="px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-xl">🔄 Acak Warna</button>
              </div>
            )}

            {/* Game 8: Lempar Koin */}
            {selectedGame === 8 && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                <p className="text-xs font-bold text-emerald-400">{coinResult}</p>
                <button onClick={() => setCoinResult(Math.random() > 0.5 ? '🪙 HASIL: GAMBAR' : '🪙 HASIL: ANGKA')} className="w-full py-3 bg-amber-500 text-slate-950 font-black text-xs rounded-xl">Lempar Koin!</button>
                <button onClick={() => setCoinResult('Tekan tombol untuk lempar koin!')} className="px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-xl">🔄 Reset</button>
              </div>
            )}

            {/* Game 9: Acak Kata */}
            {selectedGame === 9 && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                <p className="text-xs font-bold text-emerald-400">{scrambleMsg}</p>
                <input type="text" value={scrambleInput} onChange={(e) => setScrambleInput(e.target.value.toUpperCase())} placeholder="Jawaban kamu" className="w-full p-2 bg-slate-950 border border-slate-800 text-center text-xs font-bold text-white rounded-xl" />
                <div className="flex gap-2">
                  <button onClick={() => {
                    if (scrambleInput === scrambleWord) setScrambleMsg('🎉 BENAR! KATA = WARKOP')
                    else setScrambleMsg('❌ Masih Salah!')
                  }} className="flex-1 py-2 bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl">Cek</button>
                  <button onClick={() => { setScrambleInput(''); setScrambleMsg('Susun kata: A K R P O W'); }} className="px-3 py-2 bg-slate-800 text-xs font-bold rounded-xl">🔄 Reset</button>
                </div>
              </div>
            )}

            {/* Game 10: Tes Reaksi */}
            {selectedGame === 10 && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                {reactState === 'idle' && (
                  <button onClick={() => {
                    setReactState('waiting')
                    setTimeout(() => {
                      setReactState('ready')
                      setStartTime(Date.now())
                    }, Math.random() * 2000 + 1000)
                  }} className="w-full py-4 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl">Mulai Tes Reaksi</button>
                )}
                {reactState === 'waiting' && <p className="text-xs text-amber-400 font-bold animate-pulse">Tunggu warna berubah hijau...</p>}
                {reactState === 'ready' && (
                  <button onClick={() => {
                    setReactTime(Date.now() - startTime)
                    setReactState('idle')
                  }} className="w-full py-6 bg-emerald-400 text-slate-950 font-black text-base rounded-xl">KLIK SEKARANG!</button>
                )}
                {reactTime && <p className="text-xs font-bold text-emerald-300">Kecepatan Reaksi: {reactTime} ms</p>}
                <button onClick={() => { setReactState('idle'); setReactTime(null); }} className="px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-xl">🔄 Reset Game</button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROFIL PELANGGAN + PENGATURAN NADA DERING */}
        {activeNav === 'profile' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 text-center">
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-3xl">
                {userData.avatarUrl ? <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : '👤'}
              </div>

              <div className="space-y-3 text-left">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Ubah Foto Profil Pelanggan</label>
                  <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:bg-emerald-950 file:text-emerald-300" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Ganti Nama Pelanggan</label>
                  <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-xs font-bold text-white rounded-xl" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Pilihan Nada Dering Panggilan Kasir</label>
                  <select value={customerSoundOption} onChange={(e) => setCustomerSoundOption(Number(e.target.value))} className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl">
                    <option value={1}>1. Bel Dering Biasa</option>
                    <option value={2}>2. "Pesanan kamu di Meja X sudah siap kak!"</option>
                    <option value={3}>3. "Halo, pesanan kamu sudah jadi, silakan diambil!"</option>
                  </select>
                </div>

                <button onClick={handleSaveProfile} className="w-full py-2.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl">💾 Simpan Perubahan Profil</button>
                <button onClick={async () => { await supabase.auth.signOut(); location.reload(); }} className="w-full py-2.5 bg-rose-950 text-rose-400 font-bold text-xs rounded-xl border border-rose-800">🚪 Keluar (Logout)</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Cart */}
      {activeNav === 'menu' && Object.keys(cart).length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-30">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/40 p-3.5 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{getTotalItem()} Menu Dipilih</p>
                <p className="text-base font-black text-emerald-400">Rp {getTotalHarga().toLocaleString('id-ID')}</p>
              </div>
              <div className="flex gap-2 text-[10px] font-bold">
                <button onClick={() => setSelectedPayment('kasir')} className={`px-2.5 py-1.5 rounded-xl border ${selectedPayment === 'kasir' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>Bayar Kasir</button>
                <button onClick={() => setSelectedPayment('qris')} className={`px-2.5 py-1.5 rounded-xl border ${selectedPayment === 'qris' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>QRIS</button>
              </div>
            </div>

            <button onClick={handleCheckout} disabled={submitting || !isOpen} className="w-full py-2.5 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl disabled:opacity-50">
              {submitting ? 'Mengirim...' : !isOpen ? 'Toko Sedang Tutup' : 'Pesan Sekarang →'}
            </button>
          </div>
        </div>
      )}

      {/* Modal QRIS Toko X */}
      {showQrisModal && activeOrderForQris && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-sm rounded-3xl p-6 text-center space-y-4">
            <h3 className="text-base font-bold text-emerald-400">📲 Pembayaran QRIS Toko</h3>
            <div className="w-56 h-56 mx-auto bg-white p-2 rounded-2xl flex items-center justify-center">
              {qrisUrl ? <img src={qrisUrl} alt="QRIS Toko" className="w-full h-full object-contain" /> : <p className="text-xs text-slate-500">QRIS belum diupload oleh kasir toko</p>}
            </div>

            <div className="pt-2 border-t border-slate-800 text-left space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Kirim Bukti Pembayaran</label>
              <input type="file" accept="image/*" onChange={(e) => setBuktiFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-400 file:py-1 file:px-3 file:rounded-xl file:bg-emerald-950 file:text-emerald-300" />
              <button onClick={() => handleUploadBukti(activeOrderForQris.id)} disabled={uploadingBukti} className="w-full py-2.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl">
                {uploadingBukti ? 'Mengirim...' : '📤 Kirim Bukti Ke Kasir'}
              </button>
            </div>
            <button onClick={() => setShowQrisModal(false)} className="w-full py-2 bg-slate-950 border border-slate-800 text-xs font-bold rounded-xl text-slate-400">Tutup</button>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 p-2 z-40">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 text-center">
          <button onClick={() => setActiveNav('menu')} className={`py-1.5 text-xs font-bold rounded-xl ${activeNav === 'menu' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'}`}>☕ Menu</button>
          <button onClick={() => setActiveNav('status')} className={`py-1.5 text-xs font-bold rounded-xl ${activeNav === 'status' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'}`}>📡 Status</button>
          <button onClick={() => setActiveNav('game')} className={`py-1.5 text-xs font-bold rounded-xl ${activeNav === 'game' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'}`}>🎮 Game</button>
          <button onClick={() => setActiveNav('profile')} className={`py-1.5 text-xs font-bold rounded-xl ${activeNav === 'profile' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'}`}>👤 Profil</button>
        </div>
      </div>
    </div>
  )
}

function calculateWinner(squares: any[]) {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a]
  }
  return null
}

export default function StoreSlugPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500 text-center bg-slate-950 min-h-screen">Memuat warkop...</div>}>
      <DynamicStoreContent />
    </Suspense>
  )
}
