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
  const [showScanNotice, setShowScanNotice] = useState<boolean>(true)

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

  const [mouthPurple, setMouthPurple] = useState('M-8 18 Q0 24 8 18')
  const [mouthOrange, setMouthOrange] = useState('M-6 14 Q0 19 6 14')
  const [mouthBlack, setMouthBlack] = useState('M-4 10 Q0 14 4 10')
  const [mouthYellow, setMouthYellow] = useState('M-5 6 Q0 10 5 6')
  const [eyelidOpacity, setEyelidOpacity] = useState('0')

  const svgRef = useRef<SVGSVGElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  // 🔔 CUSTOMER SOUND BELL OPTION
  const [customerSoundOption, setCustomerSoundOption] = useState<number>(2)
  const [activeNav, setActiveNav] = useState<'menu' | 'status' | 'info' | 'game' | 'profile'>('menu')
  const [selectedGame, setSelectedGame] = useState<number>(1)

  // Toko State
  const [storeData, setStoreData] = useState<any>(null)
  const [storeId, setStoreId] = useState<string>('')
  const [storeName, setStoreName] = useState('Warung Kopi')
  const [storeAvatar, setStoreAvatar] = useState('')
  const [qrisUrl, setQrisUrl] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [isOpen, setIsOpen] = useState(true)

  // 🌟 FITUR TEMA VISUAL, BACKGROUND WALLPAPER, INFO TOKO & CROSS SELLING
  const [mapsUrl, setMapsUrl] = useState('')
  const [waComplaint, setWaComplaint] = useState('')
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([])
  const [wifiActive, setWifiActive] = useState(false)
  const [wifiName, setWifiName] = useState('')
  const [wifiPassword, setWifiPassword] = useState('')
  const [jamOperasional, setJamOperasional] = useState('')
  const [fasilitas, setFasilitas] = useState<string[]>([])
  const [bgImageUrl, setBgImageUrl] = useState('')
  const [themeStyle, setThemeStyle] = useState('glassmorphic')
  const [recommendationActive, setRecommendationActive] = useState<boolean>(true)
  const [themeConfig, setThemeConfig] = useState({
    bgColor: '#0f172a',
    textColor: '#ffffff',
    accentColor: '#10b981',
    emoji: '☕'
  })

  // 🎴 FITUR LOYALTY CARD STATE
  const [userStamps, setUserStamps] = useState<number>(0)
  const [inputLoyaltyCode, setInputLoyaltyCode] = useState<string>('')
  const [claimingStamp, setClaimingStamp] = useState<boolean>(false)

  // 🎟️ PROMO CODE STATES
  const [promos, setPromos] = useState<any[]>([])
  const [inputPromoCode, setInputPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<any>(null)

  // Data Menu & Cart Baru
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [cart, setCart] = useState<{ [key: string]: { qty: number; varian: 'panas' | 'dingin'; catatan: string; menuId: string } }>({})
  const [selectedTable, setSelectedTable] = useState(mejaParam || '')
  const [tables, setTables] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<'qris' | 'kasir'>('kasir')

  // Modal State QRIS, Bukti & Struk
  const [showQrisModal, setShowQrisModal] = useState(false)
  const [activeOrderForQris, setActiveOrderForQris] = useState<any>(null)
  const [uploadingBukti, setUploadingBukti] = useState(false)
  const [buktiFile, setBuktiFile] = useState<File | null>(null)

  const [selectedStrukOrder, setSelectedStrukOrder] = useState<any>(null)
  const [strukMode, setStrukMode] = useState<'biasa' | 'original' | 'custom'>('original')
  const [customStrukBg, setCustomStrukBg] = useState<string | null>(null)

  // ULASAN PELANGGAN
  const [reviewActive, setReviewActive] = useState<boolean>(false)
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false)
  const [reviewOrderTarget, setReviewOrderTarget] = useState<any>(null)
  const [reviewRating, setReviewRating] = useState<number>(5)
  const [reviewComment, setReviewComment] = useState<string>('')

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

  // EYE TRACKING LOGIC
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
    if (!isPasswordVisible) coverEyes()
    else showShockedState()
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

  const uncoverEyes = () => setEyelidOpacity('0')

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
    if (nextState) showShockedState()
    else if (isPasswordFocused) coverEyes()
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
    if (!isInputFocused && !isPasswordFocused) resetState()
  }

  const resetState = () => {
    setBadgeText('Mengawasimu 👀')
    setBadgeClass('bg-purple-950/80 text-purple-300 border-purple-800')
    setMouthPurple('M-8 18 Q0 24 8 18')
    setMouthOrange('M-6 14 Q0 19 6 14')
    setMouthBlack('M-4 10 Q0 14 4 10')
    setMouthYellow('M-5 6 Q0 10 5 6')
  }

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
      const sessionStoreSlug = activeSession.user.user_metadata?.store_slug
      if (sessionStoreSlug && sessionStoreSlug !== slug) {
        setSession(null)
        return
      }

      setSession(activeSession)
      const name = activeSession.user.user_metadata?.full_name || activeSession.user.email?.split('@')[0] || 'Pelanggan'
      const phone = activeSession.user.user_metadata?.phone || '-'
      const realEmail = activeSession.user.user_metadata?.real_email || activeSession.user.email || ''
      const avatarUrl = activeSession.user.user_metadata?.avatar_url || ''
      setUserData({ name, phone, email: realEmail, avatarUrl })
      setEditingName(name)
      if (storeId) {
        fetchMyOrders(storeId, name)
        fetchUserLoyalty(storeId, activeSession.user.id)
      }
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    try {
      const tenantEmail = `${slug.toLowerCase()}_${email.trim().toLowerCase()}`

      if (isRegister) {
        const { data: authData, error } = await supabase.auth.signUp({
          email: tenantEmail,
          password,
          options: {
            data: { 
              full_name: nama.trim(), 
              phone: phone.trim(),
              real_email: email.trim(),
              store_id: storeId,
              store_slug: slug,
            },
          },
        })
        if (error) throw error

        if (authData.user && storeId) {
          await supabase.from('profiles').insert({
            id: authData.user.id,
            full_name: nama.trim(),
            phone: phone.trim(),
            store_id: storeId,
          })
        }

        alert('🎉 Pendaftaran akun toko berhasil! Silakan login.')
        setIsRegister(false)
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: tenantEmail,
          password,
        })
        if (error) throw new Error('Email atau kata sandi salah untuk toko ini!')

        setSession(data.session)
        const name = data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'Pelanggan'
        const userPhone = data.session.user.user_metadata?.phone || '-'
        const realEmail = data.session.user.user_metadata?.real_email || data.session.user.email || ''
        const avatarUrl = data.session.user.user_metadata?.avatar_url || ''
        setUserData({ name, phone: userPhone, email: realEmail, avatarUrl })
        setEditingName(name)
        if (storeId) {
          fetchMyOrders(storeId, name)
          fetchUserLoyalty(storeId, data.session.user.id)
        }
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
      const { data: menuData } = await supabase.from('menu_items').select('*').eq('store_id', store.id)
      const { data: tblData } = await supabase.from('tables').select('*').eq('store_id', store.id).eq('aktif', true).order('nomor')
      const { data: promoData } = await supabase.from('store_promos').select('*').eq('store_id', store.id).eq('aktif', true)

      if (catData) setCategories(catData)
      if (menuData) setMenuItems(menuData)
      if (tblData) setTables(tblData)
      if (promoData) setPromos(promoData)

      if (session?.user) {
        fetchMyOrders(store.id, userData.name)
        fetchUserLoyalty(store.id, session.user.id)
      }
    }
    setLoading(false)
  }

  const updateStoreConfig = (store: any) => {
    if (store.store_name) setStoreName(store.store_name)
    if (store.avatar_url) setStoreAvatar(store.avatar_url)
    if (store.qris_url) setQrisUrl(store.qris_url)
    if (store.announcement) setAnnouncement(store.announcement)
    if (store.banner_url) setBannerUrl(store.banner_url)
    if (store.is_open !== undefined) setIsOpen(store.is_open)

    if (store.maps_url) setMapsUrl(store.maps_url)
    if (store.wa_complaint) setWaComplaint(store.wa_complaint)
    if (store.social_links) setSocialLinks(store.social_links || [])
    if (store.wifi_active !== undefined) setWifiActive(store.wifi_active)
    if (store.wifi_name) setWifiName(store.wifi_name)
    if (store.wifi_password) setWifiPassword(store.wifi_password)
    if (store.jam_operasional) setJamOperasional(store.jam_operasional)
    if (store.fasilitas) setFasilitas(store.fasilitas || [])
    if (store.bg_image_url) setBgImageUrl(store.bg_image_url)
    if (store.theme_style) setThemeStyle(store.theme_style)
    if (store.theme_config) setThemeConfig(store.theme_config)
    if (store.review_active !== undefined) setReviewActive(store.review_active)
    if (store.recommendation_active !== undefined) setRecommendationActive(store.recommendation_active)
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

  const fetchUserLoyalty = async (targetStoreId: string, userId: string) => {
    if (!targetStoreId || !userId) return
    const { data } = await supabase
      .from('customer_loyalty')
      .select('stamps_count')
      .eq('store_id', targetStoreId)
      .eq('user_id', userId)
      .single()

    if (data) setUserStamps(data.stamps_count || 0)
  }

  const handleClaimStamp = async () => {
    if (!session?.user || !storeData) return
    if (!inputLoyaltyCode.trim()) {
      alert('Masukkan kode loyalty hari ini!')
      return
    }

    if (inputLoyaltyCode.trim().toUpperCase() !== storeData.loyalty_code?.toUpperCase()) {
      alert('❌ Kode loyalty salah! Tanya ke kasir untuk kode hari ini.')
      return
    }

    setClaimingStamp(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data: existing } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('store_id', storeId)
        .eq('user_id', session.user.id)
        .single()

      if (existing && existing.last_claim_date === today) {
        alert('⚠️ Kamu sudah mengklaim stamp loyalty untuk hari ini! Coba lagi besok.')
        return
      }

      const nextStamps = Math.min((existing?.stamps_count || 0) + 1, storeData.loyalty_max_stamps || 10)

      await supabase.from('customer_loyalty').upsert({
        store_id: storeId,
        user_id: session.user.id,
        stamps_count: nextStamps,
        last_claim_date: today,
        updated_at: new Date().toISOString(),
      })

      setUserStamps(nextStamps)
      setInputLoyaltyCode('')
      alert(`🎉 BERHASIL! Stamp kamu bertambah menjadi ${nextStamps}/${storeData.loyalty_max_stamps || 10}!`)
    } catch (err: any) {
      alert(err.message || 'Gagal klaim stamp.')
    } finally {
      setClaimingStamp(false)
    }
  }

  const updateCartItem = (menuId: string, varian: 'panas' | 'dingin', delta: number) => {
    if (!isOpen) return
    const menu = menuItems.find((m) => m.id === menuId)
    if (menu && (menu.stok <= 0 || menu.is_sold_out || !menu.tersedia)) {
      alert('Maaf, menu ini sedang SOLD OUT / HABIS!')
      return
    }

    const key = `${menuId}_${varian}`
    setCart((prev) => {
      const current = prev[key] || { qty: 0, varian, catatan: '', menuId }
      const newQty = current.qty + delta
      if (newQty <= 0) {
        const copy = { ...prev }
        delete copy[key]
        return copy
      }
      return { ...prev, [key]: { ...current, qty: newQty } }
    })
  }

  const updateCartNotes = (key: string, catatan: string) => {
    setCart((prev) => {
      if (!prev[key]) return prev
      return { ...prev, [key]: { ...prev[key], catatan } }
    })
  }

  const getSubtotalHarga = () => Object.entries(cart).reduce((total, [key, item]) => {
    const menu = menuItems.find((m) => m.id === item.menuId)
    if (!menu) return total
    const hargaSatuan = item.varian === 'dingin' && menu.harga_dingin ? menu.harga_dingin : (menu.harga_panas || menu.harga)
    return total + hargaSatuan * item.qty
  }, 0)

  const getDiskonNominal = () => {
    if (!appliedPromo) return 0
    const subtotal = getSubtotalHarga()
    if (subtotal < (appliedPromo.minimal_transaksi || 0)) return 0

    if (appliedPromo.tipe_diskon === 'persen') {
      return (subtotal * appliedPromo.nilai_diskon) / 100
    }
    return Math.min(appliedPromo.nilai_diskon, subtotal)
  }

  const getTotalHarga = () => Math.max(0, getSubtotalHarga() - getDiskonNominal())

  const getTotalItem = () => Object.values(cart).reduce((a, b) => a + b.qty, 0)

  const handleApplyPromo = () => {
    if (!inputPromoCode.trim()) return
    const found = promos.find((p) => p.kode.toUpperCase() === inputPromoCode.trim().toUpperCase())
    if (!found) {
      alert('❌ Kode promo tidak ditemukan atau sudah tidak berlaku.')
      return
    }
    if (getSubtotalHarga() < (found.minimal_transaksi || 0)) {
      alert(`⚠️ Minimal transaksi untuk promo ini adalah Rp ${found.minimal_transaksi?.toLocaleString('id-ID')}`)
      return
    }
    setAppliedPromo(found)
    alert(`🎉 Kode promo ${found.kode} berhasil dipasang!`)
  }

  // 📲 BAGIKAN DETAIL TAGIHAN KE WHATSAPP (PATUNGAN)
  const handleShareCartToWA = () => {
    if (Object.keys(cart).length === 0) {
      alert('Keranjang masih kosong!')
      return
    }

    let text = `*RINGKASAN PESANAN MEJA #${selectedTable || '-'} - ${storeName.toUpperCase()}*\n`
    text += `-----------------------------------\n`

    Object.values(cart).forEach((item) => {
      const menu = menuItems.find((m) => m.id === item.menuId)
      const hargaSatuan = item.varian === 'dingin' && menu?.harga_dingin ? menu.harga_dingin : (menu?.harga_panas || menu?.harga || 0)
      text += `• ${item.qty}x ${menu?.nama} (${item.varian}) = Rp ${(hargaSatuan * item.qty).toLocaleString('id-ID')}\n`
      if (item.catatan) text += `  _Catatan: ${item.catatan}_\n`
    })

    text += `-----------------------------------\n`
    text += `💰 *TOTAL TAGIHAN MEJA: Rp ${getTotalHarga().toLocaleString('id-ID')}*\n`
    text += `\nYuk patungan / bayarin pesanan ini! ☕🔥`

    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(waUrl, '_blank')
  }

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

      const diskonVal = getDiskonNominal()

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
          kode_promo: appliedPromo ? appliedPromo.kode : null,
          diskon_nominal: diskonVal,
        })
        .select()
        .single()

      if (orderErr) throw orderErr

      const orderItems = Object.entries(cart).map(([key, item]) => {
        const menu = menuItems.find((m) => m.id === item.menuId)
        const hargaSatuan = item.varian === 'dingin' && menu?.harga_dingin ? menu.harga_dingin : (menu?.harga_panas || menu?.harga || 0)
        return {
          order_id: orderData.id,
          menu_id: item.menuId,
          qty: item.qty,
          harga_satuan: hargaSatuan,
          varian: item.varian,
          catatan: item.catatan || null,
          hpp_satuan: menu?.hpp || 0,
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
      setAppliedPromo(null)
      setInputPromoCode('')
      setActiveNav('status')
      fetchMyOrders(storeId, userData.name)
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim pesanan.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewOrderTarget || !storeId) return
    try {
      await supabase.from('store_reviews').insert({
        store_id: storeId,
        order_id: reviewOrderTarget.id,
        customer_name: userData.name,
        rating: reviewRating,
        comment: reviewComment,
      })

      alert('🎉 Terima kasih atas ulasan & masukan kamu untuk toko ini!')
      setShowReviewModal(false)
      setReviewComment('')
    } catch (err: any) {
      alert('Gagal mengirim ulasan: ' + err.message)
    }
  }

  const handleReorder = (ord: any) => {
    if (!ord.order_items || ord.order_items.length === 0) return
    const newCart: any = { ...cart }

    ord.order_items.forEach((item: any) => {
      const key = `${item.menu_id}_${item.varian || 'panas'}`
      newCart[key] = {
        qty: (newCart[key]?.qty || 0) + item.qty,
        varian: item.varian || 'panas',
        catatan: item.catatan || '',
        menuId: item.menu_id
      }
    })

    setCart(newCart)
    setActiveNav('menu')
    alert('🔄 Menu dari pesanan lama berhasil dimasukkan kembali ke keranjang!')
  }

  const handleShareToWhatsApp = (ord: any) => {
    const formattedDate = new Date(ord.created_at).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    let text = `*STRUK PEMBAYARAN - ${storeName.toUpperCase()}*\n`
    text += `-----------------------------------\n`
    text += `🗓️ Waktu: ${formattedDate} WIB\n`
    text += `🪑 Meja: #${ord.tables?.nomor || '-'}\n`
    text += `👤 Pemesan: ${ord.nama_pemesan}\n`
    text += `-----------------------------------\n`
    text += `*DETAIL MENU:*\n`

    ord.order_items?.forEach((i: any) => {
      text += `• ${i.qty}x ${i.menu_items?.nama} (${i.varian || 'Panas'}) = Rp ${(i.harga_satuan * i.qty).toLocaleString('id-ID')}\n`
      if (i.catatan) text += `  _Catatan: ${i.catatan}_\n`
    })

    text += `-----------------------------------\n`
    if (ord.diskon_nominal > 0) {
      text += `🎟️ Diskon Promo: -Rp ${ord.diskon_nominal.toLocaleString('id-ID')}\n`
    }
    text += `💰 *TOTAL HARI INI: Rp ${ord.total_harga?.toLocaleString('id-ID')}*\n`
    text += `-----------------------------------\n`
    text += `Terima kasih atas kunjungannya!\n`
    text += `_Powered by Reyyztore_`

    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(waUrl, '_blank')
  }

  const handleCancelOrder = async (orderId: string) => {
    const confirmCancel = confirm('Apakah kamu yakin ingin membatalkan pesanan ini?')
    if (!confirmCancel) return

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'batal' })
        .eq('id', orderId)
        .eq('status', 'pending')

      if (error) throw error

      await supabase.channel(`kasir-dashboard-${storeId}`).send({
        type: 'broadcast',
        event: 'order-cancelled-by-customer',
        payload: { orderId, tableNo: selectedTable, customerName: userData.name },
      })

      alert('❌ Pesanan berhasil dibatalkan.')
      fetchMyOrders(storeId, userData.name)
    } catch (err: any) {
      alert(err.message || 'Gagal membatalkan pesanan. Pesanan mungkin sudah diproses oleh kasir.')
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

  // 💡 MENCARI REKOMENDASI MENU PENDAMPING (CROSS-SELLING)
  const getRecommendedItems = () => {
    if (Object.keys(cart).length === 0) return []
    const cartMenuIds = Object.values(cart).map((i) => i.menuId)
    return menuItems.filter((m) => !cartMenuIds.includes(m.id) && m.stok > 0 && !m.is_sold_out).slice(0, 3)
  }

  const recommendedItems = getRecommendedItems()
  const winner = calculateWinner(tttBoard)
  const isCovering = isPasswordFocused && !isPasswordVisible
  const isShocked = isPasswordVisible && isPasswordFocused

  const getThemeClasses = (style: string) => {
    switch (style) {
      case 'bubble':
        return {
          wrapper: 'bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 text-slate-800',
          card: 'bg-white/90 border-2 border-pink-300 rounded-[2rem] shadow-lg shadow-pink-200/50 hover:scale-[1.01] transition-all relative overflow-hidden',
          header: 'bg-white/80 backdrop-blur-md border-b-2 border-pink-200 text-pink-900',
          button: 'bg-pink-500 hover:bg-pink-600 text-white rounded-full font-black shadow-md shadow-pink-300',
          badge: 'bg-pink-100 text-pink-700 border border-pink-300 rounded-full',
          subCard: 'bg-pink-50/80 border border-pink-200 rounded-2xl',
        }
      case 'fresh_mint':
        return {
          wrapper: 'bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-200 text-slate-800',
          card: 'bg-white/90 border border-emerald-300 rounded-3xl shadow-md shadow-emerald-100 hover:scale-[1.01] transition-all relative overflow-hidden',
          header: 'bg-white/80 backdrop-blur-md border-b border-emerald-200 text-emerald-900',
          button: 'bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-md shadow-emerald-200',
          badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl',
          subCard: 'bg-emerald-50/80 border border-emerald-200 rounded-xl',
        }
      case 'sky_blue':
        return {
          wrapper: 'bg-gradient-to-br from-sky-100 via-blue-50 to-sky-200 text-slate-800',
          card: 'bg-white/95 border border-sky-200 rounded-3xl shadow-md shadow-sky-100 hover:scale-[1.01] transition-all relative overflow-hidden',
          header: 'bg-white/85 backdrop-blur-md border-b border-sky-200 text-sky-900',
          button: 'bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-black shadow-md shadow-sky-200',
          badge: 'bg-sky-100 text-sky-800 border border-sky-300 rounded-xl',
          subCard: 'bg-sky-50/80 border border-sky-200 rounded-xl',
        }
      case 'warm_latte':
        return {
          wrapper: 'bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 text-amber-950',
          card: 'bg-white/90 border border-amber-300 rounded-3xl shadow-md shadow-amber-200/50 hover:scale-[1.01] transition-all relative overflow-hidden',
          header: 'bg-white/80 backdrop-blur-md border-b border-amber-200 text-amber-900',
          button: 'bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black shadow-md shadow-amber-300',
          badge: 'bg-amber-100 text-amber-900 border border-amber-300 rounded-xl',
          subCard: 'bg-amber-50/80 border border-amber-200 rounded-xl',
        }
      case 'glassmorphic': default:
        return {
          wrapper: 'bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 text-slate-900',
          card: 'bg-white/60 backdrop-blur-md border border-white/80 rounded-3xl shadow-xl shadow-sky-950/5 hover:scale-[1.01] transition-all relative overflow-hidden',
          header: 'bg-white/40 backdrop-blur-xl border-b border-white/60 text-slate-900',
          button: 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-md shadow-indigo-200',
          badge: 'bg-white/70 backdrop-blur-sm text-indigo-900 border border-white/80 rounded-xl',
          subCard: 'bg-white/40 backdrop-blur-sm border border-white/60 rounded-xl',
        }
    }
  }

  const themeClasses = getThemeClasses(themeStyle)

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-xs">Memuat toko {slug}...</div>
  }

  if (!storeData) {
    return <div className="min-h-screen bg-slate-950 text-rose-400 flex items-center justify-center text-xs">Toko tidak ditemukan.</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-3 sm:p-6 font-sans">
        <head>
          <link rel="manifest" href={`/st/${slug}/manifest`} />
        </head>

        <style jsx global>{`
          .pupil { transition: transform 0.05s ease-out; }
          .eyelid { transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease; transform-origin: center; }
          .character-arm { transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); transform-origin: bottom center; }
          .character-body { transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
          .mouth { transition: d 0.2s ease, transform 0.2s ease, opacity 0.2s ease; }
          @keyframes float-slow { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-6px) rotate(1deg); } }
          @keyframes float-reverse { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-8px) rotate(-1.5deg); } }
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
          <div className={`lg:col-span-6 bg-slate-950/60 relative p-6 sm:p-8 flex flex-col justify-between items-center overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800 select-none min-h-[320px] lg:min-h-full ${isCovering ? 'is-covering' : ''} ${isShocked ? 'is-shocked' : ''}`}>
            <div className="absolute top-10 left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full flex justify-between items-center z-10">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs text-emerald-400 shrink-0">
                  {storeAvatar ? <img src={storeAvatar} alt="Logo" className="w-full h-full object-cover" /> : themeConfig.emoji}
                </div>
                <span className="text-[11px] font-black tracking-wider text-slate-200 uppercase line-clamp-1">{storeName}</span>
              </div>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all duration-300 ${badgeClass}`}>
                {badgeText}
              </span>
            </div>

            <div className="relative w-full max-w-[400px] aspect-[4/3] my-auto flex items-center justify-center">
              <svg ref={svgRef} id="characters-svg" viewBox="0 0 500 400" className="w-full h-full overflow-visible">
                <ellipse cx="250" cy="365" rx="190" ry="14" fill="#0F172A" />

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

          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center bg-slate-900/40">
            <div className="mb-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center text-xl shrink-0">
                {storeAvatar ? <img src={storeAvatar} alt="Logo Toko" className="w-full h-full object-cover" /> : themeConfig.emoji}
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">{storeName}</h1>
                <p className="text-slate-400 text-xs mt-0.5 font-medium">
                  {isRegister ? 'Lengkapi data untuk membuat akun khusus toko ini' : 'Silakan masuk ke akun pelanggan toko ini'}
                </p>
              </div>
            </div>

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
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
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
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor WhatsApp / HP</label>
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
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
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
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kata Sandi</label>
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
    <div
      className={`min-h-screen pb-28 font-sans transition-all duration-300 relative ${themeClasses.wrapper}`}
      style={{
        backgroundImage: bgImageUrl ? `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url('${bgImageUrl}')` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <head>
        <link rel="manifest" href={`/st/${slug}/manifest`} />
      </head>

      {/* PWA INSTALLER BANNER */}
      {showInstallBtn && (
        <div className="bg-slate-900 border-b border-emerald-500/40 p-3 sticky top-0 z-40 shadow-lg flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              {storeAvatar ? <img src={storeAvatar} alt="Logo Toko" className="w-full h-full object-cover" /> : themeConfig.emoji}
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

      {/* PEMBERITAHUAN SCAN KEMBALI BARCODE */}
      {showScanNotice && (
        <div className="max-w-md mx-auto p-3 pt-3">
          <div className="bg-blue-950/80 border border-blue-500/50 p-3.5 rounded-2xl flex items-start gap-3 shadow-lg relative text-white">
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

      {/* Banner Status Buka / Tutup Toko */}
      {!isOpen ? (
        <div className="bg-rose-600 text-white p-3 text-center text-xs font-black shadow-lg sticky top-0 z-30">
          🚫 TOKO SEDANG TUTUP. Anda hanya dapat melihat menu saat ini.
        </div>
      ) : (
        <div className="bg-emerald-600 text-slate-950 p-1.5 text-center text-[10px] font-bold">
          ● Toko Sedang Buka (Siap Menerima Pesanan)
        </div>
      )}

      {/* Top Header Toko */}
      <div className={`sticky top-0 z-20 ${themeClasses.header} p-4`}>
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0">
              {storeAvatar ? <img src={storeAvatar} alt="Logo" className="w-full h-full object-cover" /> : themeConfig.emoji}
            </div>
            <div>
              <span className="text-[9px] font-bold tracking-wider text-emerald-600 uppercase">Warkop Digital</span>
              <h1 className="text-base font-extrabold line-clamp-1">{storeName}</h1>
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="appearance-none bg-white/80 border border-slate-300 text-emerald-700 font-bold text-xs px-3 py-2 pr-7 rounded-xl focus:outline-none shadow-sm"
            >
              <option value="">Pilih Meja</option>
              {tables.map((t) => (
                <option key={t.id} value={t.nomor}>Meja #{t.nomor}</option>
              ))}
            </select>
            <span className="absolute right-2.5 top-2.5 text-[10px] text-emerald-600 pointer-events-none">▼</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {bannerUrl && (
          <div className="w-full h-36 rounded-2xl overflow-hidden border border-slate-800 shadow-md">
            <img src={bannerUrl} alt="Banner Promosi" className="w-full h-full object-cover" />
          </div>
        )}

        {/* PENGUMUMAN */}
        {announcement && (
          <div className={`${themeClasses.card} p-3.5 text-center shadow-md border-2 border-pink-300/80 bg-white/95 text-slate-800 font-bold text-xs flex items-center justify-center gap-2`}>
            <span className="text-base">📢</span>
            <span className="tracking-wide">{announcement}</span>
          </div>
        )}

        {/* TAB 1: MENU UTAMA */}
        {activeNav === 'menu' && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${
                  activeCategory === 'all' ? themeClasses.button : 'bg-white/80 text-slate-700 border border-slate-300'
                }`}
              >
                Semua Menu
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${
                    activeCategory === cat.id ? themeClasses.button : 'bg-white/80 text-slate-700 border border-slate-300'
                  }`}
                >
                  {cat.nama}
                </button>
              ))}
            </div>

            {filteredMenuItems.length === 0 ? (
              <p className={`text-xs text-slate-500 text-center py-8 ${themeClasses.card}`}>Belum ada menu di toko ini.</p>
            ) : (
              filteredMenuItems.map((item) => {
                const keyPanas = `${item.id}_panas`
                const keyDingin = `${item.id}_dingin`
                const qtyPanas = cart[keyPanas]?.qty || 0
                const qtyDingin = cart[keyDingin]?.qty || 0

                const isSoldOut = item.stok <= 0 || item.is_sold_out || !item.tersedia

                return (
                  <div key={item.id} className={`${themeClasses.card} p-3.5 space-y-3 relative ${isSoldOut ? 'opacity-60 grayscale-[0.3]' : ''}`}>
                    {isSoldOut ? (
                      <span className="absolute top-0 right-0 bg-rose-600 text-white font-black text-[9px] px-2.5 py-1 rounded-bl-xl shadow-sm z-10 uppercase tracking-wider">
                        🚫 SOLD OUT
                      </span>
                    ) : item.label ? (
                      <span className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[9px] px-2.5 py-1 rounded-bl-xl shadow-sm z-10 uppercase tracking-wider">
                        {item.label}
                      </span>
                    ) : null}

                    <div className="flex items-center gap-3.5">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center text-2xl shadow-inner">
                        {item.foto_url ? <img src={item.foto_url} alt={item.nama} className="w-full h-full object-cover" /> : themeConfig.emoji}
                      </div>

                      <div className="flex-1 min-w-0 pr-12">
                        <h3 className="font-bold text-sm line-clamp-1">{item.nama}</h3>
                        <p className="text-[11px] opacity-75 line-clamp-2 mt-0.5">{item.deskripsi || 'Racikan khas toko kami.'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                      <div className={`${themeClasses.subCard} p-2.5 flex items-center justify-between`}>
                        <div>
                          <span className="text-[10px] text-amber-600 font-bold">🔥 Panas</span>
                          <p className="text-xs font-black text-emerald-600">Rp {(item.harga_panas || item.harga)?.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {qtyPanas > 0 && <button onClick={() => updateCartItem(item.id, 'panas', -1)} className="w-6 h-6 bg-slate-200 text-slate-800 text-xs font-bold rounded-md">-</button>}
                          {qtyPanas > 0 && <span className="text-xs font-bold px-1 text-emerald-600">{qtyPanas}</span>}
                          <button onClick={() => updateCartItem(item.id, 'panas', 1)} disabled={!isOpen || isSoldOut} className="w-6 h-6 bg-emerald-500 text-white text-xs font-bold rounded-md disabled:opacity-40">+</button>
                        </div>
                      </div>

                      {item.harga_dingin && (
                        <div className={`${themeClasses.subCard} p-2.5 flex items-center justify-between`}>
                          <div>
                            <span className="text-[10px] text-cyan-600 font-bold">🧊 Dingin</span>
                            <p className="text-xs font-black text-emerald-600">Rp {item.harga_dingin?.toLocaleString('id-ID')}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {qtyDingin > 0 && <button onClick={() => updateCartItem(item.id, 'dingin', -1)} className="w-6 h-6 bg-slate-200 text-slate-800 text-xs font-bold rounded-md">-</button>}
                            {qtyDingin > 0 && <span className="text-xs font-bold px-1 text-emerald-600">{qtyDingin}</span>}
                            <button onClick={() => updateCartItem(item.id, 'dingin', 1)} disabled={!isOpen || isSoldOut} className="w-6 h-6 bg-emerald-500 text-white text-xs font-bold rounded-md disabled:opacity-40">+</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {(qtyPanas > 0 || qtyDingin > 0) && (
                      <div className="space-y-1.5 pt-1">
                        {qtyPanas > 0 && (
                          <input
                            type="text"
                            placeholder="Catatan porsi panas (misal: manis / sedikit gula)..."
                            value={cart[keyPanas]?.catatan || ''}
                            onChange={(e) => updateCartNotes(keyPanas, e.target.value)}
                            className="w-full px-3 py-1.5 bg-white/80 border border-slate-300 text-xs rounded-xl focus:outline-none"
                          />
                        )}
                        {qtyDingin > 0 && (
                          <input
                            type="text"
                            placeholder="Catatan porsi dingin (misal: es sedikit)..."
                            value={cart[keyDingin]?.catatan || ''}
                            onChange={(e) => updateCartNotes(keyDingin, e.target.value)}
                            className="w-full px-3 py-1.5 bg-white/80 border border-slate-300 text-xs rounded-xl focus:outline-none"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* TAB 2: STATUS PESANAN & STRUK PELANGGAN */}
        {activeNav === 'status' && (
          <div className="space-y-4">
            <div className={`${themeClasses.card} p-3.5 text-center space-y-1`}>
              <p className="text-xs font-bold text-amber-600">🔔 Panggil Kasir Ke Meja Kamu</p>
              <button onClick={handleNudgeKasir} className="px-4 py-2 bg-amber-500 text-white text-xs font-black rounded-xl shadow-md">
                🔔 Pencet Bel Panggil Kasir Toko
              </button>
            </div>

            {myOrders.length === 0 ? (
              <div className={`p-8 text-center text-xs opacity-75 ${themeClasses.card}`}>Belum ada pesanan aktif.</div>
            ) : myOrders.map((ord) => {
              const formattedTime = new Date(ord.created_at).toLocaleString('id-ID', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })

              return (
                <div key={ord.id} className={`${themeClasses.card} p-4 space-y-3`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-emerald-600">Meja #{ord.tables?.nomor || '-'}</span>
                      <p className="text-[10px] font-semibold text-slate-500 mt-0.5">🗓️ {formattedTime} WIB</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${ord.status === 'pending' ? 'bg-amber-500/20 text-amber-700' : ord.status === 'batal' ? 'bg-red-500/20 text-red-700' : 'bg-emerald-500/20 text-emerald-700'}`}>{ord.status}</span>
                  </div>

                  {ord.status === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(ord.id)}
                      className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition active:scale-95 shadow-sm"
                    >
                      🚫 Batalkan Pesanan Ini
                    </button>
                  )}

                  {ord.status === 'selesai' && reviewActive && (
                    <button
                      onClick={() => { setReviewOrderTarget(ord); setShowReviewModal(true); }}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition shadow-sm"
                    >
                      ⭐ Beri Ulasan / Feedback Pesanan Ini
                    </button>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-b border-slate-200/60 py-2">
                    <button onClick={() => setSelectedStrukOrder(ord)} className="py-1.5 bg-slate-800 text-white text-[11px] font-bold rounded-xl">
                      🧾 Lihat Struk
                    </button>
                    <button onClick={() => handleReorder(ord)} className="py-1.5 bg-emerald-500 text-slate-950 text-[11px] font-black rounded-xl">
                      🔄 Pesan Lagi
                    </button>
                    <button onClick={() => handleShareToWhatsApp(ord)} className="py-1.5 bg-green-600 text-white text-[11px] font-bold rounded-xl">
                      💬 Bagikan WA
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => { setActiveOrderForQris(ord); setShowQrisModal(true); }} className="flex-1 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl">📲 Lihat QRIS Toko</button>
                    <button onClick={() => { setActiveOrderForQris(ord); setShowQrisModal(true); }} className="flex-1 py-1.5 bg-blue-100 text-blue-800 border border-blue-300 text-xs font-bold rounded-xl">📤 Kirim Bukti Bayar</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* TAB 3: INFO TOKO */}
        {activeNav === 'info' && (
          <div className="space-y-4">
            {jamOperasional && (
              <div className={`${themeClasses.card} p-4 space-y-1`}>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-600">🕒 Jam Operasional Toko</h3>
                <p className="text-xs font-bold">{jamOperasional}</p>
              </div>
            )}

            {fasilitas && fasilitas.length > 0 && (
              <div className={`${themeClasses.card} p-4 space-y-2`}>
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-600">✨ Fasilitas Toko</h3>
                <div className="flex flex-wrap gap-1.5">
                  {fasilitas.map((fas, idx) => (
                    <span key={idx} className={`${themeClasses.badge} px-2.5 py-1 text-[11px] font-bold`}>
                      {fas}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {wifiActive && (
              <div className={`${themeClasses.card} p-4 space-y-2`}>
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-600">📶 Wi-Fi Toko Gratis</h3>
                <div className="text-xs space-y-1">
                  <p><span className="opacity-70">Nama SSID:</span> <strong>{wifiName || 'Tidak Diset'}</strong></p>
                  <p><span className="opacity-70">Password:</span> <strong className="font-mono text-emerald-600">{wifiPassword || 'Tidak Diset'}</strong></p>
                </div>
              </div>
            )}

            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noreferrer" className={`${themeClasses.card} block p-4 text-xs font-bold text-center text-sky-600 hover:underline`}>
                📍 Buka Lokasi Toko di Google Maps ➔
              </a>
            )}

            {waComplaint && (
              <a href={`https://wa.me/${waComplaint.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className={`${themeClasses.card} block p-4 text-xs font-bold text-center text-emerald-600 hover:underline`}>
                💬 WhatsApp Layanan / Komplain Toko ➔
              </a>
            )}

            {socialLinks && socialLinks.length > 0 && (
              <div className={`${themeClasses.card} p-4 space-y-2`}>
                <h4 className="text-xs font-bold opacity-75 uppercase">Media Sosial Toko</h4>
                <div className="flex flex-col gap-2">
                  {socialLinks.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noreferrer" className={`${themeClasses.subCard} p-2.5 text-xs font-bold text-emerald-700 hover:underline`}>
                      🔗 {link.platform}: {link.url}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GAMES */}
        {activeNav === 'game' && (
          <div className="space-y-4 text-center">
            <h2 className="text-base font-bold">🎮 Arena 10 Games Anti-Bosan</h2>
            
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
                    selectedGame === g.id ? themeClasses.button : 'bg-white/80 border border-slate-300 text-slate-700'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>

            {selectedGame === 1 && (
              <div className={`${themeClasses.card} p-5 inline-block max-w-xs w-full space-y-3`}>
                <p className="text-xs font-bold text-emerald-600">
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
                    }} className="h-16 bg-white/80 border border-slate-300 text-xl font-black rounded-xl">
                      {cell}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setTttBoard(Array(9).fill(null)); setTttIsX(true); }} className="px-4 py-2 bg-slate-800 text-xs font-bold rounded-xl text-white">🔄 Reset Game</button>
              </div>
            )}

            {selectedGame === 2 && (
              <div className={`${themeClasses.card} p-5 space-y-3`}>
                <p className="text-xs font-bold text-emerald-600">{guessMsg}</p>
                <input type="number" value={guessInput} onChange={(e) => setGuessInput(e.target.value)} placeholder="Masukkan angka (1-20)" className="w-full p-2.5 bg-white/80 border border-slate-300 text-center text-xs font-bold rounded-xl" />
                <div className="flex gap-2">
                  <button onClick={() => {
                    const num = parseInt(guessInput)
                    if (num === guessTarget) setGuessMsg('🎉 BENAR KAN! Kamu menang!')
                    else if (num < guessTarget) setGuessMsg('Too low! Angka lebih besar.')
                    else setGuessMsg('Too high! Angka lebih kecil.')
                  }} className={`flex-1 py-2 ${themeClasses.button} text-xs`}>Tebak!</button>
                  <button onClick={() => { setGuessTarget(Math.floor(Math.random() * 20) + 1); setGuessInput(''); setGuessMsg('Tebak angka 1 - 20!'); }} className="px-3 py-2 bg-slate-800 text-xs font-bold rounded-xl text-white">🔄 Reset</button>
                </div>
              </div>
            )}

            {selectedGame === 3 && (
              <div className={`${themeClasses.card} p-5 space-y-3`}>
                <p className="text-xs font-bold text-emerald-600">{rpsResult}</p>
                <div className="flex justify-center gap-2">
                  {['✊ Batu', '✋ Kertas', '✌️ Gunting'].map((choice, i) => (
                    <button key={i} onClick={() => {
                      const bot = ['✊ Batu', '✋ Kertas', '✌️ Gunting'][Math.floor(Math.random() * 3)]
                      setRpsResult(`Kamu: ${choice} vs Bot: ${bot}`)
                    }} className="px-3 py-2 bg-white/80 border border-slate-300 text-xs font-bold rounded-xl">{choice}</button>
                  ))}
                </div>
                <button onClick={() => setRpsResult('Pilih salah satu!')} className="px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-xl text-white">🔄 Reset</button>
              </div>
            )}

            {selectedGame === 4 && (
              <div className={`${themeClasses.card} p-5 space-y-3`}>
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
                    }} className="h-14 bg-white/80 border border-slate-300 text-lg rounded-xl">
                      {flipped.includes(idx) || matched.includes(idx) ? card : '❓'}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setCards(['☕', '☕', '🥐', '🥐', '🍰', '🍰', '🧃', '🧃'].sort(() => Math.random() - 0.5)); setFlipped([]); setMatched([]); }} className="px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-xl text-white">🔄 Reset Card</button>
              </div>
            )}

            {selectedGame === 5 && (
              <div className={`${themeClasses.card} p-5 space-y-3`}>
                <p className="text-xs font-bold text-emerald-600">Total Klik: {clicks}</p>
                <button onClick={() => setClicks(clicks + 1)} className={`w-full py-6 ${themeClasses.button} text-lg`}>⚡ KLIK SECEPATNYA!</button>
                <button onClick={() => setClicks(0)} className="px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-xl text-white">🔄 Reset Skor</button>
              </div>
            )}

            {selectedGame === 6 && (
              <div className={`${themeClasses.card} p-5 space-y-3`}>
                <p className="text-xs font-bold text-emerald-600">{mathMsg}</p>
                <p className="text-sm font-black">{mathA} + {mathB} = ?</p>
                <input type="number" value={mathAns} onChange={(e) => setMathAns(e.target.value)} placeholder="Hasil?" className="w-full p-2 bg-white/80 border border-slate-300 text-center text-xs rounded-xl" />
                <div className="flex gap-2">
                  <button onClick={() => {
                    if (parseInt(mathAns) === mathA + mathB) setMathMsg('✅ Benar Sekali!')
                    else setMathMsg('❌ Salah, coba lagi!')
                  }} className={`flex-1 py-2 ${themeClasses.button} text-xs`}>Jawab</button>
                  <button onClick={() => { setMathA(Math.floor(Math.random() * 10) + 1); setMathB(Math.floor(Math.random() * 10) + 1); setMathAns(''); setMathMsg('Jawab pertanyaan matematika!'); }} className="px-3 py-2 bg-slate-800 text-xs font-bold rounded-xl text-white">🔄 Soal Baru</button>
                </div>
              </div>
            )}

            {selectedGame === 7 && (
              <div className={`${themeClasses.card} p-5 space-y-3`}>
                <p className="text-xs font-bold text-emerald-600">{colorMsg}</p>
                <div className="w-16 h-16 rounded-2xl mx-auto border-2 border-white shadow-md" style={{ backgroundColor: colorTarget }} />
                <div className="flex justify-center gap-2">
                  {['#EF4444', '#10B981', '#3B82F6'].map((c, i) => (
                    <button key={i} onClick={() => {
                      if (c === colorTarget) setColorMsg('🎉 Benar! Warna pas.')
                      else setColorMsg('❌ Warna salah!')
                    }} className="px-3 py-2 bg-white/80 border border-slate-300 text-xs font-bold rounded-xl" style={{ color: c }}>Warna {i+1}</button>
                  ))}
                </div>
                <button onClick={() => {
                  const colors = ['#EF4444', '#10B981', '#3B82F6']
                  setColorTarget(colors[Math.floor(Math.random() * colors.length)])
                  setColorMsg('Pilih warna yang sesuai!')
                }} className="px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-xl text-white">🔄 Acak Warna</button>
              </div>
            )}

            {selectedGame === 8 && (
              <div className={`${themeClasses.card} p-5 space-y-3`}>
                <p className="text-xs font-bold text-emerald-600">{coinResult}</p>
                <button onClick={() => setCoinResult(Math.random() > 0.5 ? '🪙 HASIL: GAMBAR' : '🪙 HASIL: ANGKA')} className={`w-full py-3 ${themeClasses.button} text-xs`}>Lempar Koin!</button>
                <button onClick={() => setCoinResult('Tekan tombol untuk lempar koin!')} className="px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-xl text-white">🔄 Reset</button>
              </div>
            )}

            {selectedGame === 9 && (
              <div className={`${themeClasses.card} p-5 space-y-3`}>
                <p className="text-xs font-bold text-emerald-600">{scrambleMsg}</p>
                <input type="text" value={scrambleInput} onChange={(e) => setScrambleInput(e.target.value.toUpperCase())} placeholder="Jawaban kamu" className="w-full p-2 bg-white/80 border border-slate-300 text-center text-xs font-bold rounded-xl" />
                <div className="flex gap-2">
                  <button onClick={() => {
                    if (scrambleInput === scrambleWord) setScrambleMsg('🎉 BENAR! KATA = WARKOP')
                    else setScrambleMsg('❌ Masih Salah!')
                  }} className={`flex-1 py-2 ${themeClasses.button} text-xs`}>Cek</button>
                  <button onClick={() => { setScrambleInput(''); setScrambleMsg('Susun kata: A K R P O W'); }} className="px-3 py-2 bg-slate-800 text-xs font-bold rounded-xl text-white">🔄 Reset</button>
                </div>
              </div>
            )}

            {selectedGame === 10 && (
              <div className={`${themeClasses.card} p-5 space-y-3`}>
                {reactState === 'idle' && (
                  <button onClick={() => {
                    setReactState('waiting')
                    setTimeout(() => {
                      setReactState('ready')
                      setStartTime(Date.now())
                    }, Math.random() * 2000 + 1000)
                  }} className={`w-full py-4 ${themeClasses.button} text-xs`}>Mulai Tes Reaksi</button>
                )}
                {reactState === 'waiting' && <p className="text-xs text-amber-600 font-bold animate-pulse">Tunggu warna berubah hijau...</p>}
                {reactState === 'ready' && (
                  <button onClick={() => {
                    setReactTime(Date.now() - startTime)
                    setReactState('idle')
                  }} className="w-full py-6 bg-emerald-500 text-white font-black text-base rounded-xl shadow-lg">KLIK SEKARANG!</button>
                )}
                {reactTime && <p className="text-xs font-bold text-emerald-600">Kecepatan Reaksi: {reactTime} ms</p>}
                <button onClick={() => { setReactState('idle'); setReactTime(null); }} className="px-3 py-1.5 bg-slate-800 text-xs font-bold rounded-xl text-white">🔄 Reset Game</button>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PROFIL PELANGGAN & LOYALTY CARD */}
        {activeNav === 'profile' && (
          <div className="space-y-4">
            {storeData?.loyalty_active && (
              <div className={`${themeClasses.card} p-5 space-y-4 text-center border-2 border-amber-300 bg-amber-50/90`}>
                <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                  <h3 className="text-xs font-black text-amber-900 uppercase tracking-wider">🎴 Loyalty Card Toko</h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    {userStamps} / {storeData.loyalty_max_stamps || 10} Stamp
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2 my-3">
                  {Array.from({ length: storeData.loyalty_max_stamps || 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-12 rounded-xl border-2 flex items-center justify-center text-lg font-black transition-all ${
                        i < userStamps
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-md scale-105'
                          : 'bg-white/80 border-amber-200 text-amber-300'
                      }`}
                    >
                      {i < userStamps ? '✓' : i + 1}
                    </div>
                  ))}
                </div>

                {userStamps < (storeData.loyalty_max_stamps || 10) ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Masukkan Kode Loyalty Hari Ini..."
                        value={inputLoyaltyCode}
                        onChange={(e) => setInputLoyaltyCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 text-xs font-bold bg-white border border-amber-300 rounded-xl focus:outline-none text-slate-800 uppercase"
                      />
                      <button
                        onClick={handleClaimStamp}
                        disabled={claimingStamp}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
                      >
                        {claimingStamp ? '...' : 'Klaim'}
                      </button>
                    </div>
                    <p className="text-[10px] text-amber-700 italic">*Kode diperbarui oleh kasir setiap hari & hanya bisa diklaim 1x per hari.</p>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl space-y-1">
                    <p className="text-xs font-black text-emerald-800">🎉 Selamat! Stamp Kamu Sudah Penuh!</p>
                    <p className="text-[11px] text-emerald-700">Tunjukkan tampilan ini ke kasir untuk mendapatkan <strong>1 Menu Gratis Bebas Pilih</strong>!</p>
                  </div>
                )}
              </div>
            )}

            <div className={`${themeClasses.card} p-6 space-y-4 text-center`}>
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-slate-200 border-2 border-emerald-500 flex items-center justify-center text-3xl shadow-md">
                {userData.avatarUrl ? <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : '👤'}
              </div>

              <div className="space-y-3 text-left">
                <div>
                  <label className="text-[10px] font-bold opacity-75 uppercase">Ubah Foto Profil Pelanggan</label>
                  <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:bg-emerald-100 file:text-emerald-800" />
                </div>

                <div>
                  <label className="text-[10px] font-bold opacity-75 uppercase">Ganti Nama Pelanggan</label>
                  <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} className="w-full p-2.5 bg-white/80 border border-slate-300 text-xs font-bold rounded-xl" />
                </div>

                <div>
                  <label className="text-[10px] font-bold opacity-75 uppercase">Pilihan Nada Dering Panggilan Kasir</label>
                  <select value={customerSoundOption} onChange={(e) => setCustomerSoundOption(Number(e.target.value))} className="w-full mt-1 p-2.5 bg-white/80 border border-slate-300 text-xs rounded-xl">
                    <option value={1}>1. Bel Dering Biasa</option>
                    <option value={2}>2. "Pesanan kamu di Meja X sudah siap kak!"</option>
                    <option value={3}>3. "Halo, pesanan kamu sudah jadi, silakan diambil!"</option>
                  </select>
                </div>

                <button onClick={handleSaveProfile} className={`w-full py-2.5 ${themeClasses.button} text-xs`}>💾 Simpan Perubahan Profil</button>
                <button onClick={async () => { await supabase.auth.signOut(); location.reload(); }} className="w-full py-2.5 bg-rose-500 text-white font-bold text-xs rounded-xl">🚪 Keluar (Logout)</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Cart, Kode Promo & Rekomendasi Menu Pendamping */}
      {activeNav === 'menu' && Object.keys(cart).length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-30">
          <div className={`${themeClasses.card} p-3.5 space-y-3 shadow-2xl backdrop-blur-xl border border-white/80`}>
            
            {/* 💡 WIDGET REKOMENDASI MENU PENDAMPING (CROSS-SELLING) */}
            {recommendationActive && recommendedItems.length > 0 && (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1.5">
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider">💡 Pas banget dikombinasikan dengan:</p>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {recommendedItems.map((rec) => (
                    <div key={rec.id} className="bg-white/90 p-2 rounded-xl border border-slate-200 shrink-0 flex items-center gap-2 text-xs">
                      <div>
                        <p className="font-bold text-slate-800 text-[11px] line-clamp-1">{rec.nama}</p>
                        <p className="text-[10px] text-emerald-600 font-bold">Rp {(rec.harga_panas || rec.harga)?.toLocaleString('id-ID')}</p>
                      </div>
                      <button
                        onClick={() => updateCartItem(rec.id, 'panas', 1)}
                        className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] rounded-lg shadow"
                      >
                        + Tambah
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Punya Kode Promo Toko?"
                value={inputPromoCode}
                onChange={(e) => setInputPromoCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-xl uppercase focus:outline-none"
              />
              <button onClick={handleApplyPromo} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition active:scale-95 shrink-0">
                Pasang Promo
              </button>
            </div>

            {appliedPromo && (
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl text-[10px] font-bold flex justify-between items-center border border-emerald-300">
                <span>🎟️ Promo {appliedPromo.kode} Terpasang</span>
                <button onClick={() => setAppliedPromo(null)} className="text-rose-600 font-bold hover:underline">Hapus</button>
              </div>
            )}

            <div className="flex justify-between items-center pt-1">
              <div>
                <p className="text-[10px] font-bold opacity-75 uppercase">{getTotalItem()} Menu Dipilih</p>
                <p className="text-base font-black text-emerald-600">Rp {getTotalHarga().toLocaleString('id-ID')}</p>
              </div>
              <div className="flex gap-2 text-[10px] font-bold">
                <button onClick={() => setSelectedPayment('kasir')} className={`px-2.5 py-1.5 rounded-xl border ${selectedPayment === 'kasir' ? themeClasses.button : 'bg-white/80 text-slate-600 border-slate-300'}`}>Bayar Kasir</button>
                <button onClick={() => setSelectedPayment('qris')} className={`px-2.5 py-1.5 rounded-xl border ${selectedPayment === 'qris' ? themeClasses.button : 'bg-white/80 text-slate-600 border-slate-300'}`}>QRIS</button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleShareCartToWA}
                className="py-2.5 px-3 bg-green-600 hover:bg-green-500 text-white font-black text-xs rounded-2xl shadow transition"
              >
                📲 Patungan WA
              </button>
              <button onClick={handleCheckout} disabled={submitting || !isOpen} className={`flex-1 py-2.5 ${themeClasses.button} text-xs disabled:opacity-50`}>
                {submitting ? 'Mengirim...' : !isOpen ? 'Toko Sedang Tutup' : 'Pesan Sekarang →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ULASAN & FEEDBACK PELANGGAN */}
      {showReviewModal && reviewOrderTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border border-slate-200 w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-amber-600">⭐ Beri Ulasan Toko</h3>
            <p className="text-xs text-slate-500">Bagaimana kualitas makanan & pelayanan toko kami?</p>

            <div className="flex justify-center gap-2 text-2xl cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className={star <= reviewRating ? 'text-amber-400' : 'text-slate-300'}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              rows={3}
              placeholder="Tulis ulasan/saran kamu untuk toko..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 text-xs rounded-xl focus:outline-none text-slate-800 font-medium"
            />

            <div className="flex gap-2">
              <button onClick={handleSubmitReview} className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow">
                Kirim Ulasan
              </button>
              <button onClick={() => setShowReviewModal(false)} className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold text-xs rounded-xl">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal QRIS Toko */}
      {showQrisModal && activeOrderForQris && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 border border-slate-200 w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-emerald-600">📲 Pembayaran QRIS Toko</h3>
            <div className="w-56 h-56 mx-auto bg-slate-50 p-2 rounded-2xl flex items-center justify-center border border-slate-200">
              {qrisUrl ? <img src={qrisUrl} alt="QRIS Toko" className="w-full h-full object-contain" /> : <p className="text-xs text-slate-500">QRIS belum diupload oleh kasir toko</p>}
            </div>

            <div className="pt-2 border-t border-slate-200 text-left space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Kirim Bukti Pembayaran</label>
              <input type="file" accept="image/*" onChange={(e) => setBuktiFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-600 file:py-1 file:px-3 file:rounded-xl file:bg-emerald-100 file:text-emerald-800" />
              <button onClick={() => handleUploadBukti(activeOrderForQris.id)} disabled={uploadingBukti} className="w-full py-2.5 bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md">
                {uploadingBukti ? 'Mengirim...' : '📤 Kirim Bukti Ke Kasir'}
              </button>
            </div>
            <button onClick={() => setShowQrisModal(false)} className="w-full py-2 bg-slate-100 text-xs font-bold rounded-xl text-slate-600">Tutup</button>
          </div>
        </div>
      )}

      {/* MODAL STRUK INTERAKTIF & CUSTOM BACKGROUND */}
      {selectedStrukOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-sm rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-black text-center text-emerald-400">🧾 Struk Pembayaran {storeName}</h3>

            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
              <button onClick={() => setStrukMode('biasa')} className={`flex-1 py-1.5 rounded-lg transition ${strukMode === 'biasa' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400'}`}>Biasa</button>
              <button onClick={() => setStrukMode('original')} className={`flex-1 py-1.5 rounded-lg transition ${strukMode === 'original' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400'}`}>Original</button>
              <button onClick={() => setStrukMode('custom')} className={`flex-1 py-1.5 rounded-lg transition ${strukMode === 'custom' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400'}`}>Custom</button>
            </div>

            {strukMode === 'custom' && (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Upload Foto Background Struk</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setCustomStrukBg(URL.createObjectURL(file))
                  }}
                  className="w-full text-xs text-slate-400 file:py-1 file:px-2 file:rounded-xl file:bg-emerald-950 file:text-emerald-300 mt-1"
                />
              </div>
            )}

            <div
              id="struk-printable"
              className={`p-4 rounded-2xl text-slate-900 space-y-3 font-mono text-xs relative shadow-xl ${
                strukMode === 'biasa' ? 'bg-slate-100' : 'bg-white'
              }`}
              style={{
                backgroundImage: strukMode === 'custom' && customStrukBg ? `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url('${customStrukBg}')` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {strukMode === 'original' && storeAvatar && (
                <div className="w-12 h-12 mx-auto rounded-full overflow-hidden mb-1 border border-slate-300 shadow-sm">
                  <img src={storeAvatar} alt="Logo Toko" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="text-center border-b border-dashed border-slate-400 pb-2">
                <h4 className="font-black text-sm uppercase text-slate-900">{storeName}</h4>
                <p className="text-[10px] text-slate-600 font-sans">
                  {new Date(selectedStrukOrder.created_at).toLocaleString('id-ID', {
                    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })} WIB
                </p>
                <p className="text-[10px] text-slate-600 font-sans">Meja: #{selectedStrukOrder.tables?.nomor} | Pemesan: {selectedStrukOrder.nama_pemesan}</p>
              </div>

              <div className="space-y-1.5">
                {selectedStrukOrder.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-[11px]">
                    <span>{item.qty}x {item.menu_items?.nama} ({item.varian || 'Panas'})</span>
                    <span>Rp {(item.harga_satuan * item.qty).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-400 pt-2 space-y-1 text-right font-bold text-xs">
                {selectedStrukOrder.diskon_nominal > 0 && (
                  <p className="text-emerald-700">Diskon Promo: -Rp {selectedStrukOrder.diskon_nominal.toLocaleString('id-ID')}</p>
                )}
                <p className="text-sm font-black text-slate-900">TOTAL: Rp {selectedStrukOrder.total_harga?.toLocaleString('id-ID')}</p>
              </div>

              <div className="text-center pt-2 border-t border-slate-300 text-[9px] text-slate-500 font-sans">
                <p>Terima Kasih Atas Kunjungan Anda!</p>
                <p className="font-bold text-slate-700 mt-0.5">Powered by Reyyztore</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => window.print()} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow transition">
                🖨️ Cetak / Simpan
              </button>
              <button onClick={() => handleShareToWhatsApp(selectedStrukOrder)} className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl shadow transition">
                💬 Kirim WA
              </button>
            </div>
            <button onClick={() => setSelectedStrukOrder(null)} className="w-full py-2 bg-slate-800 text-xs font-bold rounded-xl text-slate-400 hover:text-white">
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* FOOTER BRANDING REYYZTORE */}
      <footer className="text-center py-4 text-[10px] text-slate-400 font-medium">
        Powered by <strong className="text-emerald-400">Reyyztore</strong> • Digital POS System
      </footer>

      {/* Bottom Nav Bar Pelanggan */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 p-2 z-40 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 text-center">
          <button onClick={() => setActiveNav('menu')} className={`py-1.5 text-xs font-bold rounded-xl ${activeNav === 'menu' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'}`}>☕ Menu</button>
          <button onClick={() => setActiveNav('status')} className={`py-1.5 text-xs font-bold rounded-xl ${activeNav === 'status' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'}`}>📡 Status</button>
          <button onClick={() => setActiveNav('info')} className={`py-1.5 text-xs font-bold rounded-xl ${activeNav === 'info' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'}`}>ℹ️ Info</button>
          <button onClick={() => setActiveNav('game')} className={`py-1.5 text-xs font-bold rounded-xl ${activeNav === 'game' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'}`}>🎮 Game</button>
          <button onClick={() => setActiveNav('profile')} className={`py-1.5 text-xs font-bold rounded-xl ${activeNav === 'profile' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500'}`}>👤 Profil</button>
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
