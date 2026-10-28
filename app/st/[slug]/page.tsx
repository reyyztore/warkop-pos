'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function DynamicStoreContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params?.slug as string
  const mejaParam = searchParams.get('meja')
  const supabase = createClient()

  // --- STATE PWA INSTALLER & PEMBERITAHUAN SCAN BARCODE ---
  const [showInstallBtn, setShowInstallBtn] = useState<boolean>(true)
  const [showScanNotice, setShowScanNotice] = useState<boolean>(true) // State untuk kotak pemberitahuan scan ulang

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setShowInstallBtn(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    alert(
      `Cara Pasang Aplikasi ${storeName}:\n\n` +
      `1. Klik ikon titik tiga (⋮) atau tombol Share (📤) di browser HP kamu.\n` +
      `2. Pilih menu "Tambahkan ke Layar Utama" / "Add to Home Screen".\n` +
      `3. Setelah aplikasi terpasang, SCAN KEMBALI barcode di meja agar nomor meja otomatis terdeteksi!`
    )
  }

  // --- AUTH STATE & REFS ---
  const [session, setSession] = useState<any>(null)
  const [isRegister, setIsRegister] = useState(false)
  const [nama, setNama] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  // --- INTERACTIVE CHARACTER STATE ---
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isHoveringButton, setIsHoveringButton] = useState(false)
  const [badgeText, setBadgeText] = useState('Mengawasimu 👀')
  const [badgeClass, setBadgeClass] = useState('bg-purple-950/80 text-purple-300 border-purple-800')

  // Mouth Shapes & Eyelid State
  const [mouthPurple, setMouthPurple] = useState('M-8 18 Q0 24 8 18')
  const [mouthOrange, setMouthOrange] = useState('M-6 14 Q0 19 6 14')
  const [mouthBlack, setMouthBlack] = useState('M-4 10 Q0 14 4 10')
  const [mouthYellow, setMouthYellow] = useState('M-5 6 Q0 10 5 6')
  const [eyelidOpacity, setEyelidOpacity] = useState('0')

  const svgRef = useRef<SVGSVGElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

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

  // 10 Games States
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

  // --- EYE TRACKING LOGIC ---
  const pupilsData = [
    { id: 'pupil-purple-l', center: { x: 176, y: 185 }, maxR: 6 },
    { id: 'pupil-purple-r', center: { x: 224, y: 185 }, maxR: 6 },
    { id: 'pupil-orange-l', center: { x: 244, y: 255 }, maxR: 5 },
    { id: 'pupil-orange-r', center: { x: 276, y: 255 }, maxR: 5 },
    { id: 'pupil-black-l', center: { x: 336, y: 120 }, maxR: 4 },
    { id: 'pupil-black-r', center: { x: 364, y: 120 }, maxR: 4 },
    { id: 'pupil-yellow-l', center: { x: 98, y: 304 }, maxR: 3.5 },
    { id: 'pupil-yellow-r', center: { x: 122, y: 304 }, maxR: 3.5 },
  ]

  const updatePupils = (targetX: number, targetY: number) => {
    if (isPasswordFocused && !isPasswordVisible) return
    if (!svgRef.current) return

    const rect = svgRef.current.getBoundingClientRect()
    const svgX = ((targetX - rect.left) / rect.width) * 500
    const svgY = ((targetY - rect.top) / rect.height) * 400

    pupilsData.forEach(({ id, center, maxR }) => {
      const el = document.getElementById(id)
      if (!el) return
      const dx = svgX - center.x
      const dy = svgY - center.y
      const angle = Math.atan2(dy, dx)
      const dist = Math.min(maxR, Math.hypot(dx, dy) / 12)

      const px = Math.cos(angle) * dist
      const py = Math.sin(angle) * dist
      el.style.transform = `translate(${px}px, ${py}px)`
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isInputFocused && !isPasswordFocused && !isHoveringButton) {
        updatePupils(e.clientX, e.clientY)
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isInputFocused, isPasswordFocused, isHoveringButton, isPasswordVisible])

  // --- REACTION HANDLERS ---
  const handleInputFocus = (ref: React.RefObject<HTMLInputElement | null>) => {
    setIsInputFocused(true)
    setBadgeText('Memerhatikan input ✍️')
    setBadgeClass('bg-blue-950/80 text-blue-300 border-blue-800')

    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      updatePupils(rect.left + 40, rect.top + rect.height / 2)
    }

    setMouthPurple('M-8 16 Q0 26 8 16')
    setMouthOrange('M-6 13 Q0 22 6 13')
  }

  const handleInputBlur = () => {
    setIsInputFocused(false)
    resetState()
  }

  const handlePasswordFocus = () => {
    setIsPasswordFocused(true)
    if (!isPasswordVisible) {
      coverEyes()
    } else {
      showShockedState()
    }
  }

  const handlePasswordBlur = () => {
    setIsPasswordFocused(false)
    uncoverEyes()
    resetState()
  }

  const coverEyes = () => {
    setBadgeText('Jangan diintip! 🙈')
    setBadgeClass('bg-amber-950/80 text-amber-300 border-amber-800')
    setEyelidOpacity('1')
    setMouthPurple('M-4 18 Q0 16 4 18')
    setMouthOrange('M-4 15 Q0 13 4 15')
  }

  const uncoverEyes = () => {
    setEyelidOpacity('0')
  }

  const showShockedState = () => {
    uncoverEyes()
    setBadgeText('Kelihatan nih! 😲')
    setBadgeClass('bg-rose-950/80 text-rose-300 border-rose-800')
    setMouthPurple('M-6 14 Q0 28 6 14')
    setMouthOrange('M-5 12 Q0 24 5 12')
    setMouthBlack('M-4 8 Q0 18 4 8')
    setMouthYellow('M-4 4 Q0 12 4 4')
  }

  const togglePasswordVisibility = () => {
    const nextState = !isPasswordVisible
    setIsPasswordVisible(nextState)
    if (nextState) {
      showShockedState()
    } else if (isPasswordFocused) {
      coverEyes()
    }
  }

  const handleButtonHover = () => {
    setIsHoveringButton(true)
    if (!isPasswordFocused) {
      setBadgeText('Siap masuk! 🎉')
      setBadgeClass('bg-emerald-950/80 text-emerald-300 border-emerald-800')
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        updatePupils(rect.left + rect.width / 2, rect.top + rect.height / 2)
      }
      setMouthPurple('M-10 16 Q0 28 10 16')
      setMouthOrange('M-8 13 Q0 24 8 13')
    }
  }

  const handleButtonLeave = () => {
    setIsHoveringButton(false)
    if (!isInputFocused && !isPasswordFocused) {
      resetState()
    }
  }

  const resetState = () => {
    setBadgeText('Mengawasimu 👀')
    setBadgeClass('bg-purple-950/80 text-purple-300 border-purple-800')
    setMouthPurple('M-8 18 Q0 24 8 18')
    setMouthOrange('M-6 14 Q0 19 6 14')
    setMouthBlack('M-4 10 Q0 14 4 10')
    setMouthYellow('M-5 6 Q0 10 5 6')
  }

  // --- SOUND ALERT HELPER ---
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

  useEffect(() => {
    checkSession()
    if (slug) fetchStoreDetails()
  }, [slug])

  useEffect(() => {
    if (!storeId) return

    const channel = supabase
      .channel(`meja-customer-${storeId}`)
      .on('broadcast', { event: 'ring-table-bell' }, (payload: any) => {
        if (payload.payload?.tableNo?.toString() === selectedTable?.toString()) {
          playCustomerBellSound()
          alert(`🔔 Meja #${selectedTable}: Dipanggil Kasir Toko! Pesanan Kamu Siap.`)
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `store_id=eq.${storeId}` }, () => {
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
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: nama.trim(), phone: phone.trim() },
          },
        })
        if (error) throw error
        alert('🎉 Pendaftaran berhasil! Silakan login.')
        setIsRegister(false)
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        setSession(data.session)
        const name = data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'Pelanggan'
        const userPhone = data.session.user.user_metadata?.phone || '-'
        const userEmail = data.session.user.email || ''
        const avatarUrl = data.session.user.user_metadata?.avatar_url || ''
        setUserData({ name, phone: userPhone, email: userEmail, avatarUrl })
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
  const isCovering = isPasswordFocused && !isPasswordVisible
  const isShocked = isPasswordVisible && isPasswordFocused

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-xs">Memuat toko {slug}...</div>
  }

  if (!storeData) {
    return <div className="min-h-screen bg-slate-950 text-rose-400 flex items-center justify-center text-xs">Toko tidak ditemukan.</div>
  }

  // TAMPILAN LOGIN MASKOT KARTUN INTERAKTIF
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-3 sm:p-6 font-sans">
        {/* LINK MANIFEST DINAMIS SANGAT PENTING */}
        <head>
          <link rel="manifest" href={`/st/${slug}/manifest`} />
        </head>

        <style jsx global>{`
          .pupil {
            transition: transform 0.05s ease-out;
          }
          .eyelid {
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
            transform-origin: center;
          }
          .character-arm {
            transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
            transform-origin: bottom center;
          }
          .character-body {
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .mouth {
            transition: d 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
          }
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-6px) rotate(1deg); }
          }
          @keyframes float-reverse {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(-1.5deg); }
          }
          .animate-float-1 { animation: float-slow 4s ease-in-out infinite; }
          .animate-float-2 { animation: float-reverse 4.5s ease-in-out infinite 0.5s; }

          .is-covering .purple-arm-left { transform: translate(22px, -78px) rotate(42deg) scale(1.1); }
          .is-covering .purple-arm-right { transform: translate(-22px, -78px) rotate(-42deg) scale(1.1); }
          .is-covering .orange-hand-left { transform: translate(18px, -42px) rotate(35deg); }
          .is-covering .orange-hand-right { transform: translate(-18px, -42px) rotate(-35deg); }
          .is-covering .black-char { transform: translateY(70px) rotate(-8deg); }

          .is-shocked .pupil { transform: scale(1.4) !important; }
        `}</style>

        <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px] backdrop-blur-xl">
          
          {/* Kolom Kiri: Stage Karakter Interaktif */}
          <div
            className={`lg:col-span-6 bg-slate-950/60 relative p-6 sm:p-8 flex flex-col justify-between items-center overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800 select-none min-h-[320px] lg:min-h-full ${
              isCovering ? 'is-covering' : ''
            } ${isShocked ? 'is-shocked' : ''}`}
          >
            <div className="absolute top-10 left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Toko Pelanggan */}
            <div className="w-full flex justify-between items-center z-10">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs text-emerald-400 shrink-0">
                  {storeAvatar ? <img src={storeAvatar} alt="Logo" className="w-full h-full object-cover" /> : '☕'}
                </div>
                <span className="text-[11px] font-black tracking-wider text-slate-200 uppercase line-clamp-1">WARKOP {storeName}</span>
              </div>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all duration-300 ${badgeClass}`}>
                {badgeText}
              </span>
            </div>

            {/* Canvas SVG Karakter Interaktif */}
            <div className="relative w-full max-w-[400px] aspect-[4/3] my-auto flex items-center justify-center">
              <svg ref={svgRef} id="characters-svg" viewBox="0 0 500 400" className="w-full h-full overflow-visible">
                <ellipse cx="250" cy="365" rx="190" ry="14" fill="#0F172A" />

                {/* 1. Karakter Kuning */}
                <g id="char-yellow" className="character-body animate-float-1" style={{ transformOrigin: '110px 320px' }}>
                  <rect x="75" y="275" width="70" height="70" rx="16" transform="rotate(45 110 310)" fill="#FACC15" />
                  <g transform="translate(110, 310)">
                    <circle cx="-12" cy="-6" r="7" fill="white" />
                    <circle id="pupil-yellow-l" className="pupil" cx="-12" cy="-6" r="3.5" fill="#1E293B" />
                    <path id="eyelid-yellow-l" className="eyelid" d="M-19 -13 h14 v14 h-14 Z" fill="#FACC15" style={{ opacity: eyelidOpacity }} />
                    <circle cx="12" cy="-6" r="7" fill="white" />
                    <circle id="pupil-yellow-r" className="pupil" cx="12" cy="-6" r="3.5" fill="#1E293B" />
                    <path id="eyelid-yellow-r" className="eyelid" d="M5 -13 h14 v14 h-14 Z" fill="#FACC15" style={{ opacity: eyelidOpacity }} />
                    <path id="mouth-yellow" className="mouth" d={mouthYellow} stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
                  </g>
                </g>

                {/* 2. Karakter Hitam */}
                <g id="char-black" className="character-body animate-float-2" style={{ transformOrigin: '350px 180px' }}>
                  <rect className="black-char transition-transform duration-500" x="315" y="70" width="70" height="230" rx="35" fill="#1E293B" />
                  <g className="black-char transition-transform duration-500" transform="translate(350, 120)">
                    <circle cx="-14" cy="0" r="10" fill="white" />
                    <circle id="pupil-black-l" className="pupil" cx="-14" cy="0" r="5" fill="#0F172A" />
                    <ellipse id="eyelid-black-l" className="eyelid" cx="-14" cy="0" rx="10.5" ry="10.5" fill="#1E293B" style={{ opacity: eyelidOpacity }} />
                    <circle cx="14" cy="0" r="10" fill="white" />
                    <circle id="pupil-black-r" className="pupil" cx="14" cy="0" r="5" fill="#0F172A" />
                    <ellipse id="eyelid-black-r" className="eyelid" cx="14" cy="0" rx="10.5" ry="10.5" fill="#0F172A" style={{ opacity: eyelidOpacity }} />
                    <path id="mouth-black" className="mouth" d={mouthBlack} stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                  </g>
                </g>

                {/* 3. Karakter Ungu Utama */}
                <g id="char-purple" className="character-body animate-float-1" style={{ transformOrigin: '200px 240px' }}>
                  <path d="M130 360 V180 A70 70 0 0 1 270 180 V360 Z" fill="#6366F1" />
                  <g transform="translate(200, 185)">
                    <circle cx="-24" cy="0" r="14" fill="white" />
                    <circle id="pupil-purple-l" className="pupil" cx="-24" cy="0" r="6.5" fill="#1E1B4B" />
                    <rect id="eyelid-purple-l" className="eyelid" x="-40" y="-16" width="32" height="32" fill="#6366F1" rx="4" style={{ opacity: eyelidOpacity }} />
                    <circle cx="24" cy="0" r="14" fill="white" />
                    <circle id="pupil-purple-r" className="pupil" cx="24" cy="0" r="6.5" fill="#1E1B4B" />
                    <rect id="eyelid-purple-r" className="eyelid" x="8" y="-16" width="32" height="32" fill="#6366F1" rx="4" style={{ opacity: eyelidOpacity }} />
                    <path id="mouth-purple" className="mouth" d={mouthPurple} stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                  </g>
                  <path className="purple-arm-left character-arm" d="M130 260 C 110 260, 110 210, 130 200" stroke="#4F46E5" strokeWidth="16" strokeLinecap="round" fill="none" />
                  <path className="purple-arm-right character-arm" d="M270 260 C 290 260, 290 210, 270 200" stroke="#4F46E5" strokeWidth="16" strokeLinecap="round" fill="none" />
                </g>

                {/* 4. Karakter Oranye */}
                <g id="char-orange" className="character-body animate-float-2" style={{ transformOrigin: '270px 290px' }}>
                  <path d="M205 360 V260 A55 55 0 0 1 315 260 V360 Z" fill="#F97316" />
                  <g transform="translate(260, 255)">
                    <circle cx="-16" cy="0" r="12" fill="white" />
                    <circle id="pupil-orange-l" className="pupil" cx="-16" cy="0" r="5.5" fill="#431407" />
                    <rect id="eyelid-orange-l" className="eyelid" x="-30" y="-14" width="28" height="28" fill="#F97316" style={{ opacity: eyelidOpacity }} />
                    <circle cx="16" cy="0" r="12" fill="white" />
                    <circle id="pupil-orange-r" className="pupil" cx="16" cy="0" r="5.5" fill="#431407" />
                    <rect id="eyelid-orange-r" className="eyelid" x="2" y="-14" width="28" height="28" fill="#F97316" style={{ opacity: eyelidOpacity }} />
                    <path id="mouth-orange" className="mouth" d={mouthOrange} stroke="#431407" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </g>
                  <circle className="orange-hand-left character-arm" cx="215" cy="300" r="12" fill="#EA580C" />
                  <circle className="orange-hand-right character-arm" cx="305" cy="300" r="12" fill="#EA580C" />
                </g>
              </svg>
            </div>

            <p className="text-[11px] text-slate-500 font-medium">Sistem Pemesanan Warkop POS Interaktif</p>
          </div>

          {/* Kolom Kanan: Form Login Toko Pelanggan */}
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center bg-slate-900/40">
            <div className="mb-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center text-xl shrink-0">
                {storeAvatar ? <img src={storeAvatar} alt="Logo Toko" className="w-full h-full object-cover" /> : '☕'}
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">{storeName}</h1>
                <p className="text-slate-400 text-xs mt-0.5 font-medium">
                  {isRegister ? 'Lengkapi data untuk membuat akun baru' : 'Silakan masuk ke akun pelanggan kamu'}
                </p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="w-full bg-slate-950 p-1 rounded-2xl flex mb-5 border border-slate-800">
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 ${
                  !isRegister ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 ${
                  isRegister ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                Daftar Akun
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-3.5">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      ref={nameRef}
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      onFocus={() => handleInputFocus(nameRef)}
                      onBlur={handleInputBlur}
                      placeholder="Contoh: Raihan"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Nomor WhatsApp / HP
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onFocus={() => handleInputFocus(nameRef)}
                      onBlur={handleInputBlur}
                      placeholder="081234567890"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => handleInputFocus(emailRef)}
                  onBlur={handleInputBlur}
                  placeholder="nama@email.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white text-xs"
                  >
                    {isPasswordVisible ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                ref={buttonRef}
                type="submit"
                disabled={authLoading}
                onMouseEnter={handleButtonHover}
                onMouseLeave={handleButtonLeave}
                className="w-full py-3 mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {authLoading ? 'Memproses...' : isRegister ? 'Daftar Sekarang →' : 'Masuk Aplikasi →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-slate-100 pb-28 font-sans transition-colors duration-300" style={{ backgroundColor: bgColor }}>
      
      {/* LINK MANIFEST DINAMIS SANGAT PENTING */}
      <head>
        <link rel="manifest" href={`/st/${slug}/manifest`} />
      </head>

      {/* BANNER FLOATING PWA INSTALLER UNTUK PELANGGAN */}
      {showInstallBtn && (
        <div className="bg-slate-900 border-b border-emerald-500/40 p-3 sticky top-0 z-40 shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              {storeAvatar ? <img src={storeAvatar} alt="Logo Toko" className="w-full h-full object-cover" /> : '☕'}
            </div>
            <div>
              <p className="text-xs font-black text-white">Install App {storeName}</p>
              <p className="text-[10px] text-slate-400">Pesan menu cepat tanpa scan QR ulang</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition active:scale-95 shrink-0 shadow-md shadow-emerald-500/20"
          >
            Install
          </button>
        </div>
      )}

      {/* 🌟 KOTAK PEMBERITAHUAN BARU: SCAN KEMBALI BARCODE SETELAH INSTALL */}
      {showScanNotice && (
        <div className="max-w-md mx-auto p-3 pt-3">
          <div className="bg-blue-950/80 border border-blue-500/50 p-3.5 rounded-2xl flex items-start gap-3 shadow-lg relative">
            <div className="text-xl shrink-0 mt-0.5">📱</div>
            <div className="flex-1 min-w-0 pr-6">
              <h4 className="text-xs font-black text-blue-300 uppercase tracking-wider">Informasi Penting</h4>
              <p className="text-[11px] text-slate-200 mt-1 leading-relaxed">
                Setelah selesai menginstal aplikasi, harap <strong className="text-emerald-400">scan kembali barcode di meja</strong> agar nomor meja kamu terdeteksi otomatis!
              </p>
            </div>
            <button
              onClick={() => setShowScanNotice(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded-lg bg-slate-900/50"
              title="Tutup"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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

            {/* Game 1: TicTacToe */}
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

        {/* TAB 4: PROFIL PELANGGAN + NADA DERING */}
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
    <Suspense fallback={<p className="text-xs text-slate-500 text-center bg-slate-950 min-h-screen">Memuat warkop...</p>}>
      <DynamicStoreContent />
    </Suspense>
  )
}
