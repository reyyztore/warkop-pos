'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

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
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('semua')
  const [selectedBuktiUrl, setSelectedBuktiUrl] = useState<string | null>(null)

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

  const [announcement, setAnnouncement] = useState('')
  const [isOpen, setIsOpen] = useState(true)
  const [bannerUrl, setBannerUrl] = useState('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [showTampilanModal, setShowTampilanModal] = useState(false)

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

  // --- FITUR LOYALTY CARD STATE (DINAMIS) ---
  const [loyaltyActive, setLoyaltyActive] = useState<boolean>(false)
  const [loyaltyCode, setLoyaltyCode] = useState<string>('')
  const [loyaltyMaxStamps, setLoyaltyMaxStamps] = useState<number>(10)
  const [loyaltyType, setLoyaltyType] = useState<'original' | 'theme' | 'custom'>('original')
  const [loyaltyStampContent, setLoyaltyStampContent] = useState<string>('☕')
  const [loyaltyStampImageFile, setLoyaltyStampImageFile] = useState<File | null>(null)

  const [selectedPreset, setSelectedPreset] = useState('Slate Dark')
  const [themeConfig, setThemeConfig] = useState({
    bgColor: '#0f172a',
    textColor: '#ffffff',
    accentColor: '#10b981',
    emoji: '☕'
  })

  const [promos, setPromos] = useState<any[]>([])
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [newPromoCode, setNewPromoCode] = useState('')
  const [newPromoType, setNewPromoType] = useState<'flat' | 'persen'>('flat')
  const [newPromoVal, setNewPromoVal] = useState<number>(0)
  const [newPromoMin, setNewPromoMin] = useState<number>(0)

  const [rekapPeriode, setRekapPeriode] = useState<'hari' | 'minggu' | 'bulan'>('hari')
  const [showRekapModal, setShowRekapModal] = useState(false)

  const [kasirSoundOption, setKasirSoundOption] = useState<number>(2)
  const [customerBellAlert, setCustomerBellAlert] = useState<string | null>(null)

  const [kdsActive, setKdsActive] = useState<boolean>(true)
  const [stockActive, setStockActive] = useState<boolean>(true)
  const [recommendationActive, setRecommendationActive] = useState<boolean>(true)
  const [bluetoothActive, setBluetoothActive] = useState<boolean>(true)
  const [shiftActive, setShiftActive] = useState<boolean>(true)
  const [tableMgmtActive, setTableMgmtActive] = useState<boolean>(true)
  const [ownerModeActive, setOwnerModeActive] = useState<boolean>(true)

  const [masterPin, setMasterPin] = useState<string>('123456')
  const [showPinModal, setShowPinModal] = useState<boolean>(false)
  const [inputPin, setInputPin] = useState<string>('')
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  const [activeShift, setActiveShift] = useState<any>(null)
  const [showShiftModal, setShowShiftModal] = useState<boolean>(false)
  const [modalAwalInput, setModalAwalInput] = useState<string>('')
  const [kasFisikInput, setKasFisikInput] = useState<string>('')

  const [selectedOrderForAction, setSelectedOrderForAction] = useState<any>(null)
  const [targetTableNo, setTargetTableNo] = useState<string>('')
  const [showMoveTableModal, setShowMoveTableModal] = useState<boolean>(false)

  const [btDevice, setBtDevice] = useState<any>(null)
  const [btServer, setBtServer] = useState<any>(null)
  const [isBtConnected, setIsBtConnected] = useState<boolean>(false)

  const supabase = createClient()

  const speakText = (text: string, loop: boolean = false) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'id-ID'
    if (loop) utterance.onend = () => window.speechSynthesis.speak(utterance)
    window.speechSynthesis.speak(utterance)
  }

  const speakTableBell = (tableNo: string) => {
    speakText(`Panggilan! Meja ${tableNo} menekan panggilan.`, false)
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
      .on('broadcast', { event: 'new-order' }, () => {
        playIncomingOrderSound()
        fetchOrders(storeId)
      })
      .on('broadcast', { event: 'customer-ring-bell' }, (payload: any) => {
        const table = payload.payload?.tableNo || '??'
        speakTableBell(table)
        setCustomerBellAlert(`🔔 Meja #${table} menekan panggilan!`)
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
        const { data: userStore } = await supabase.from('stores').select('id, slug').eq('owner_id', session.user.id).order('created_at', { ascending: false }).limit(1).single()
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

          if (storeData.loyalty_active !== undefined) setLoyaltyActive(storeData.loyalty_active)
          if (storeData.loyalty_code) setLoyaltyCode(storeData.loyalty_code)
          if (storeData.loyalty_max_stamps) setLoyaltyMaxStamps(storeData.loyalty_max_stamps)
          if (storeData.loyalty_type) setLoyaltyType(storeData.loyalty_type)
          if (storeData.loyalty_stamp_content) setLoyaltyStampContent(storeData.loyalty_stamp_content)

          if (storeData.kds_active !== undefined) setKdsActive(storeData.kds_active)
          if (storeData.stock_active !== undefined) setStockActive(storeData.stock_active)
          if (storeData.recommendation_active !== undefined) setRecommendationActive(storeData.recommendation_active)
          if (storeData.bluetooth_active !== undefined) setBluetoothActive(storeData.bluetooth_active)
          if (storeData.shift_active !== undefined) setShiftActive(storeData.shift_active)
          if (storeData.table_mgmt_active !== undefined) setTableMgmtActive(storeData.table_mgmt_active)
          if (storeData.owner_mode_active !== undefined) setOwnerModeActive(storeData.owner_mode_active)
          if (storeData.master_pin) setMasterPin(storeData.master_pin)

          if (storeData.expired_at) {
            setExpiredAt(storeData.expired_at)
            const diff = new Date(storeData.expired_at).getTime() - new Date().getTime()
            setDaysRemaining(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))))
          }
        }

        fetchOrders(currentStoreId)
        fetchTables(currentStoreId)
        fetchPromos(currentStoreId)
        checkActiveShift(currentStoreId)
      } else {
        setLoading(false)
        alert('Akun kamu belum terhubung dengan toko mana pun. Silakan mendaftar toko terlebih dahulu.')
      }
    }
  }

  const fetchOrders = async (targetStoreId: string) => {
    setLoading(true)
    try {
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select('*, tables!left(nomor)')
        .eq('store_id', targetStoreId)
        .order('created_at', { ascending: false })

      if (ordersErr) throw ordersErr

      if (!ordersData || ordersData.length === 0) {
        setOrders([])
        setLoading(false)
        return
      }

      const orderIds = ordersData.map((o) => o.id)

      const { data: itemsData, error: itemsErr } = await supabase
        .from('order_items')
        .select('*, menu_items!left(*)')
        .in('order_id', orderIds)

      if (itemsErr) console.error('Error fetching order_items:', itemsErr)

      const { data: allMenuItems } = await supabase
        .from('menu_items')
        .select('*')
        .eq('store_id', targetStoreId)

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
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTables = async (targetStoreId: string) => {
    const { data } = await supabase.from('tables').select('*').eq('store_id', targetStoreId).order('nomor')
    if (data) setTables(data)
  }

  const fetchPromos = async (targetStoreId: string) => {
    const { data } = await supabase.from('store_promos').select('*').eq('store_id', targetStoreId)
    if (data) setPromos(data)
  }

  const checkActiveShift = async (targetStoreId: string) => {
    const { data } = await supabase
      .from('cashier_shifts')
      .select('*')
      .eq('store_id', targetStoreId)
      .eq('status', 'open')
      .maybeSingle()

    if (data) setActiveShift(data)
  }

  const connectBluetoothPrinter = async () => {
    try {
      const nav = navigator as any
      if (!nav.bluetooth) {
        alert('Browser HP/Tablet kamu tidak mendukung Web Bluetooth API. Silakan gunakan Google Chrome di Android!')
        return
      }

      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', '49535343-fe7d-4113-a44d-42580843a016']
      })

      const server = await device.gatt.connect()
      setBtDevice(device)
      setBtServer(server)
      setIsBtConnected(true)
      alert(`✅ Terhubung ke Printer Bluetooth: ${device.name || 'Device'}`)
    } catch (err: any) {
      alert('Gagal menyambungkan Bluetooth: ' + err.message)
    }
  }

  const handlePrintBluetoothStruk = async (ord: any) => {
    if (!isBtConnected) {
      const wantConnect = confirm('Printer Bluetooth belum terhubung. Hubungkan sekarang?')
      if (wantConnect) await connectBluetoothPrinter()
      return
    }

    try {
      let receiptText = `${storeName.toUpperCase()}\n`
      receiptText += `==============================\n`
      receiptText += `Meja: #${ord.tables?.nomor || '-'} | Ref: #${ord.id.substring(0, 6)}\n`
      receiptText += `Pemesan: ${ord.nama_pemesan}\n`
      receiptText += `Waktu: ${new Date(ord.created_at).toLocaleTimeString('id-ID')}\n`
      receiptText += `------------------------------\n`

      ord.order_items?.forEach((i: any) => {
        const itemNama = i.menu_items?.nama || i.nama_menu_manual || i.nama_item || 'Item'
        const itemHarga = i.harga_satuan || i.menu_items?.harga || 0
        receiptText += `${i.qty}x ${itemNama} (${i.varian || 'Panas'})\n`
        receiptText += `   Rp ${(itemHarga * i.qty).toLocaleString('id-ID')}\n`
        if (i.catatan) receiptText += `   *Catatan: ${i.catatan}\n`
      })

      receiptText += `------------------------------\n`
      if (ord.diskon_nominal > 0) {
        receiptText += `Diskon: -Rp ${ord.diskon_nominal.toLocaleString('id-ID')}\n`
      }
      receiptText += `TOTAL: Rp ${ord.total_harga?.toLocaleString('id-ID')}\n`
      receiptText += `==============================\n`
      receiptText += `Terima Kasih! - reyyztore POS\n\n\n`

      alert('🖨️ Perintah cetak terkirim ke printer bluetooth!')
    } catch (err: any) {
      alert('Gagal cetak struk: ' + err.message)
    }
  }

  const handleOpenShift = async () => {
    if (!modalAwalInput || !storeId) {
      alert('⚠️ Masukkan nominal modal awal kasir terlebih dahulu!')
      return
    }

    try {
      const modalVal = parseFloat(modalAwalInput)
      if (isNaN(modalVal)) {
        alert('⚠️ Nominal modal awal harus berupa angka!')
        return
      }

      const { data, error } = await supabase
        .from('cashier_shifts')
        .insert({
          store_id: storeId,
          cashier_name: cashierName || 'Kasir',
          starting_cash: modalVal,
          status: 'open',
          start_time: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      setActiveShift(data)
      setShowShiftModal(false)
      setModalAwalInput('')
      alert('⏱️ Shift Kasir Resmi DIBUKA!')
    } catch (err: any) {
      alert(`❌ Gagal Membuka Shift: ${err.message || 'Terjadi kesalahan sistem'}`)
    }
  }

  const handleCloseShift = async () => {
    if (!kasFisikInput || !activeShift) {
      alert('⚠️ Masukkan nominal total kas fisik terlebih dahulu!')
      return
    }

    try {
      const fisikVal = parseFloat(kasFisikInput)
      if (isNaN(fisikVal)) {
        alert('⚠️ Nominal kas fisik harus berupa angka!')
        return
      }

      const shiftStartTime = activeShift.start_time ? new Date(activeShift.start_time).getTime() : 0
      const totalCashSales = orders
        .filter((o) => {
          const isCompleted = o.status === 'selesai'
          const isAfterShiftStart = new Date(o.created_at).getTime() >= shiftStartTime
          const isCash = !o.metode_pembayaran || ['kasir', 'cash', 'tunai'].includes(o.metode_pembayaran.toLowerCase())
          return isCompleted && isAfterShiftStart && isCash
        })
        .reduce((acc, curr) => acc + (curr.total_harga || 0), 0)

      const expectedCash = (activeShift.starting_cash || 0) + totalCashSales
      const difference = fisikVal - expectedCash

      const { error } = await supabase
        .from('cashier_shifts')
        .update({
          ending_cash: fisikVal,
          expected_cash: expectedCash,
          difference: difference,
          status: 'closed',
          end_time: new Date().toISOString()
        })
        .eq('id', activeShift.id)

      if (error) throw error

      setActiveShift(null)
      setShowShiftModal(false)
      setKasFisikInput('')
      alert(`⏱️ Shift Kasir DITUTUP!\nSelisih Kas: Rp ${difference.toLocaleString('id-ID')}`)
    } catch (err: any) {
      alert(`❌ Gagal Menutup Shift: ${err.message || 'Terjadi kesalahan sistem'}`)
    }
  }

  const handleMoveTable = async () => {
    if (!selectedOrderForAction || !targetTableNo || !storeId) return
    const targetTable = tables.find((t) => t.nomor.toString() === targetTableNo.toString())
    if (!targetTable) {
      alert('Nomor meja tidak ditemukan!')
      return
    }

    await supabase.from('orders').update({ table_id: targetTable.id }).eq('id', selectedOrderForAction.id)
    setShowMoveTableModal(false)
    fetchOrders(storeId)
    alert(`✅ Pesanan berhasil dipindah ke Meja #${targetTableNo}!`)
  }

  const executeWithPinProtection = (action: () => void) => {
    setPendingAction(() => action)
    setInputPin('')
    setShowPinModal(true)
  }

  const handleVerifyMasterPin = () => {
    if (inputPin !== masterPin) {
      alert('❌ Master PIN 6-Digit Salah!')
      return
    }

    if (pendingAction) pendingAction()
    setShowPinModal(false)
    setInputPin('')
  }

  const updateToggleInDb = async (key: string, value: boolean) => {
    if (!storeId) return
    await supabase.from('stores').update({ [key]: value }).eq('id', storeId)
  }

  const handleAddPromo = async () => {
    if (!storeId || !newPromoCode) return
    const { error } = await supabase.from('store_promos').insert({
      store_id: storeId,
      kode: newPromoCode.toUpperCase(),
      tipe_diskon: newPromoType,
      nilai_diskon: newPromoVal,
      minimal_transaksi: newPromoMin,
      aktif: true,
    })

    if (error) alert(error.message)
    else {
      alert('✅ Kode Promo Berhasil Ditambahkan!')
      setNewPromoCode('')
      fetchPromos(storeId)
    }
  }

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Hapus kode promo ini?')) return
    await supabase.from('store_promos').delete().eq('id', id)
    if (storeId) fetchPromos(storeId)
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
      let finalStampContent = loyaltyStampContent

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

      if (loyaltyType === 'custom' && loyaltyStampImageFile) {
        const fileExt = loyaltyStampImageFile.name.split('.').pop()
        const filePath = `store/${storeId}/stamp_${Date.now()}.${fileExt}`
        await supabase.storage.from('menu-images').upload(filePath, loyaltyStampImageFile)
        const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath)
        finalStampContent = data.publicUrl
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
        loyalty_type: loyaltyType,
        loyalty_stamp_content: finalStampContent,
      }).eq('id', storeId)

      setBannerUrl(newBannerUrl)
      setBgImageUrl(newBgImageUrl)
      setLoyaltyStampContent(finalStampContent)
      setShowTampilanModal(false)
      alert('🎨 Tampilan & Fitur Toko Berhasil Diperbarui!')
    } catch (e: any) {
      alert(e.message)
    }
  }

  const getFilteredOrdersByPeriode = () => {
    const now = new Date()
    return orders.filter((o) => {
      if (o.status !== 'selesai') return false
      const orderDate = new Date(o.created_at)
      
      if (rekapPeriode === 'hari') {
        return orderDate.toDateString() === now.toDateString()
      } else if (rekapPeriode === 'minggu') {
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24)
        return diffDays <= 7
      } else if (rekapPeriode === 'bulan') {
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24)
        return diffDays <= 30
      }
      return true
    })
  }

  const rekapOrders = getFilteredOrdersByPeriode()
  const totalRekapOmzet = rekapOrders.reduce((acc, curr) => acc + (curr.total_harga || 0), 0)

  const downloadRekapCSV = () => {
    if (rekapOrders.length === 0) {
      alert('Tidak ada data pesanan selesai pada periode ini.')
      return
    }

    let csvContent = '\uFEFF'
    csvContent += 'ID Pesanan,Tanggal,Waktu,Nomor Meja,Nama Pemesan,Daftar Menu & Qty,Total Harga (Rp),Status\n'

    rekapOrders.forEach((o) => {
      const d = new Date(o.created_at)
      const dateStr = d.toLocaleDateString('id-ID')
      const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      
      const orderId = `"${o.id || ''}"`
      const meja = `"Meja #${o.tables?.nomor ?? '-'}"`
      const nama = `"${(o.nama_pemesan || 'Tanpa Nama').replace(/"/g, '""')}"`
      
      const itemsString = o.order_items?.map((i: any) => {
        const nameStr = i.menu_items?.nama || i.nama_menu_manual || i.nama_item || 'Item'
        return `${i.qty}x ${nameStr} (${i.varian || 'Normal'})`
      }).join('; ') || '-'
      const itemsEscaped = `"${itemsString.replace(/"/g, '""')}"`

      const totalHarga = o.total_harga || 0
      const status = `"${(o.status || '').toUpperCase()}"`

      csvContent += `${orderId},${dateStr},${timeStr},${meja},${nama},${itemsEscaped},${totalHarga},${status}\n`
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    const fileName = `Rekap_${(storeName || 'Toko').replace(/\s+/g, '_')}_${rekapPeriode}_${Date.now()}.csv`
    
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
      
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider hidden sm:inline">📦 Operasional:</span>
            <button onClick={() => setActiveTab('semua')} className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${activeTab === 'semua' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-300 hover:bg-slate-800'}`}>
              Pesanan Masuk
            </button>
            <button onClick={() => setShowRekapModal(true)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 rounded-xl transition">
              📊 Analitik & Rekap
            </button>
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider hidden sm:inline">⚙️ Manajemen:</span>
            
            {bluetoothActive && (
              <button
                onClick={connectBluetoothPrinter}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                  isBtConnected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isBtConnected ? '🖨️ BT Connected' : '🖨️ Printer'}
              </button>
            )}

            {shiftActive && (
              <button
                onClick={() => setShowShiftModal(true)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow"
              >
                {activeShift ? '⏱️ Shift (Tutup)' : '⏱️ Buka Shift'}
              </button>
            )}

            <button onClick={() => setShowProfileModal(true)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 rounded-xl transition">
              👤 Profil
            </button>
            <button onClick={() => setShowTampilanModal(true)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 rounded-xl transition">
              🎨 Edit Toko & Tema
            </button>
            <button onClick={() => setShowPromoModal(true)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 rounded-xl transition">
              🎟️ Promo
            </button>
            <Link href="/kasir/menu" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition">
              🌸 Menu
            </Link>
            <Link href="/kasir/meja" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition">
              🪑 Meja
            </Link>
          </div>
        </div>
      </div>

      {customerStoreUrl && (
        <div className="max-w-6xl mx-auto mt-4 p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
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

      <div className="max-w-6xl mx-auto mt-4 p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
        <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider">🎛️ Pengaturan Saklar Fitur Toko</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-white">Mode Layar Dapur (KDS)</p>
              <p className="text-[10px] text-slate-400">Layar khusus barista/koki</p>
            </div>
            <button
              onClick={() => executeWithPinProtection(() => { const next = !kdsActive; setKdsActive(next); updateToggleInDb('kds_active', next); })}
              className={`px-3 py-1.5 text-xs font-black rounded-xl border transition ${kdsActive ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
            >
              {kdsActive ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-white">Manajemen Stok Menu</p>
              <p className="text-[10px] text-slate-400">Status Sold Out otomatis</p>
            </div>
            <button
              onClick={() => executeWithPinProtection(() => { const next = !stockActive; setStockActive(next); updateToggleInDb('stock_active', next); })}
              className={`px-3 py-1.5 text-xs font-black rounded-xl border transition ${stockActive ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
            >
              {stockActive ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-white">💡 Rekomendasi Menu</p>
              <p className="text-[10px] text-slate-400">Cross-selling di HP pelanggan</p>
            </div>
            <button
              onClick={() => executeWithPinProtection(() => { const next = !recommendationActive; setRecommendationActive(next); updateToggleInDb('recommendation_active', next); })}
              className={`px-3 py-1.5 text-xs font-black rounded-xl border transition ${recommendationActive ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
            >
              {recommendationActive ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-white">🖨️ Struk Bluetooth</p>
              <p className="text-[10px] text-slate-400">Direct print via Web BT API</p>
            </div>
            <button
              onClick={() => executeWithPinProtection(() => { const next = !bluetoothActive; setBluetoothActive(next); updateToggleInDb('bluetooth_active', next); })}
              className={`px-3 py-1.5 text-xs font-black rounded-xl border transition ${bluetoothActive ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
            >
              {bluetoothActive ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-white">⏱️ Shift & Rekonsiliasi Kas</p>
              <p className="text-[10px] text-slate-400">Buka/Tutup shift modal kasir</p>
            </div>
            <button
              onClick={() => executeWithPinProtection(() => { const next = !shiftActive; setShiftActive(next); updateToggleInDb('shift_active', next); })}
              className={`px-3 py-1.5 text-xs font-black rounded-xl border transition ${shiftActive ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
            >
              {shiftActive ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-white">🪑 Manajemen Meja</p>
              <p className="text-[10px] text-slate-400">Fitur pindah meja pesanan</p>
            </div>
            <button
              onClick={() => executeWithPinProtection(() => { const next = !tableMgmtActive; setTableMgmtActive(next); updateToggleInDb('table_mgmt_active', next); })}
              className={`px-3 py-1.5 text-xs font-black rounded-xl border transition ${tableMgmtActive ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-slate-400 border-slate-800'}`}
            >
              {tableMgmtActive ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center sm:col-span-2 lg:col-span-3">
            <div>
              <p className="text-xs font-bold text-white">🚪 Mode Owner (Tautan Cabang)</p>
              <p className="text-[10px] text-slate-400">Jika ON, toko bisa ditautkan ke panel owner dengan verifikasi Master PIN asli.</p>
            </div>
            <button
              onClick={() => executeWithPinProtection(() => { 
                const next = !ownerModeActive; 
                setOwnerModeActive(next); 
                updateToggleInDb('owner_mode_active', next); 
              })}
              className={`px-3.5 py-1.5 text-xs font-black rounded-xl border transition ${ownerModeActive ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-rose-950 text-rose-300 border-rose-800'}`}
            >
              {ownerModeActive ? 'ON (Dapat Ditautkan Owner)' : 'OFF (Terkunci / Privat)'}
            </button>
          </div>
        </div>

        {kdsActive && storeSlug && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="text-xs text-amber-300 font-bold">👨‍🍳 Layar Dapur Aktif! Akses link dapur:</span>
            <a
              href={`/st/${storeSlug}/dapur`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition"
            >
              👨‍🍳 Buka Layar Dapur (/st/{storeSlug}/dapur) ➔
            </a>
          </div>
        )}

        <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center">
          <span className="text-xs text-slate-400">Akses Laporan Keuangan & Analitik Eksekutif:</span>
          <button
            onClick={() => executeWithPinProtection(() => { window.location.href = '/owner' })}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
          >
            🚪 Masuk Panel Owner (PIN Protected) ➔
          </button>
        </div>
      </div>

      {customerBellAlert && (
        <div className="max-w-6xl mx-auto mt-4 p-3.5 bg-amber-500 text-slate-950 text-xs font-black rounded-2xl shadow-xl flex justify-between items-center animate-bounce">
          <span>{customerBellAlert}</span>
          <button onClick={() => setCustomerBellAlert(null)} className="text-xs px-2 py-1 bg-slate-950 text-white rounded-lg">Tutup</button>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
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

      <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto mt-6 pb-1 no-scrollbar">
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

      <div className="max-w-6xl mx-auto mt-4 space-y-3">
        {loading ? (
          <div className="h-44 bg-slate-900/50 rounded-3xl animate-pulse border border-slate-800" />
        ) : filteredOrders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 text-center rounded-3xl text-slate-400 text-xs font-medium">
            Belum ada pesanan masuk untuk toko <strong className="text-white">{storeName}</strong> ({storeSlug}).
          </div>
        ) : filteredOrders.map((ord) => {
          const formattedDate = new Date(ord.created_at).toLocaleString('id-ID', {
            weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })

          const itemsList = ord.order_items || []

          return (
            <div key={ord.id} className="bg-slate-900 border border-slate-800 p-4 rounded-3xl space-y-3 shadow-lg">
              <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                <div>
                  <span className="text-sm font-black text-emerald-400">Meja #{ord.tables?.nomor || '-'}</span>
                  <p className="text-[10px] text-slate-400 font-medium">🗓️ {formattedDate} WIB</p>
                  
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] space-y-1 mt-2">
                    <p className="font-bold text-white">👤 Pemesan: {ord.nama_pemesan}</p>
                    <p className="text-slate-300">📧 Email: {ord.email_pemesan || 'Tamu / Tanpa Email'}</p>
                    <p className="text-slate-300">📱 No. HP/WA: {ord.phone_pemesan || '-'}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${ord.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : ord.status === 'batal' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-300'}`}>{ord.status}</span>
                  <button onClick={() => ringSpecificTableBell(ord.tables?.nomor)} className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-lg font-bold">
                    🔔 Ring Meja #{ord.tables?.nomor}
                  </button>
                </div>
              </div>

              {ord.kode_promo && (
                <div className="text-[10px] bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded-lg font-bold border border-emerald-800/60 inline-block">
                  🎟️ Promo Terpakai: {ord.kode_promo} (-Rp {ord.diskon_nominal?.toLocaleString('id-ID')})
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">📦 RINCIAN PRODUK / MENU DIPESAN:</p>
                {itemsList.length === 0 ? (
                  <p className="text-xs text-rose-400 italic bg-rose-950/20 p-2.5 rounded-xl border border-rose-900/40">
                    ⚠️ Data rincian menu kosong / belum terisi.
                  </p>
                ) : (
                  <ul className="space-y-2 text-xs text-slate-300">
                    {itemsList.map((item: any, idx: number) => {
                      const namaProduk = 
                        item.menu_items?.nama || 
                        item.nama_menu_manual || 
                        item.nama_item || 
                        item.nama || 
                        'Menu / Produk'

                      const unitPrice = item.harga_satuan || item.menu_items?.harga || item.harga || 0
                      const hargaSubtotal = unitPrice * (item.qty || 1)

                      return (
                        <li key={item.id || idx} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-bold text-white text-sm">
                                <strong className="text-emerald-400">{item.qty}x</strong> {namaProduk}
                              </span>
                              {item.varian && (
                                <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${item.varian === 'dingin' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                                  {item.varian === 'dingin' ? '🧊 Dingin' : '🔥 Panas'}
                                </span>
                              )}
                            </div>
                            <span className="text-emerald-300 font-mono font-bold">Rp {hargaSubtotal.toLocaleString('id-ID')}</span>
                          </div>
                          {item.catatan && (
                            <p className="text-[11px] text-amber-300 italic bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-900/50 mt-1">
                              📝 Catatan Pembeli: "{item.catatan}"
                            </p>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              {ord.bukti_pembayaran_url && (
                <div className="p-2.5 bg-blue-950/40 border border-blue-800/60 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-blue-300 font-bold">📷 Bukti Transfer Pelanggan</span>
                  <button onClick={() => setSelectedBuktiUrl(ord.bukti_pembayaran_url)} className="px-3 py-1 bg-blue-500 text-slate-950 font-black rounded-lg text-[10px]">
                    Lihat Bukti
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-black">
                <span>Total Pembayaran: <strong className="text-emerald-400 text-sm">Rp {ord.total_harga?.toLocaleString('id-ID')}</strong></span>
                <button onClick={() => togglePaidStatus(ord.id, ord.is_paid)} className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold ${ord.is_paid ? 'bg-emerald-500 text-slate-950' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                  {ord.is_paid ? '✅ Lunas' : '❌ Belum Bayar'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {ord.status === 'pending' && <button onClick={() => updateStatus(ord.id, 'diproses')} className="py-2.5 bg-amber-500 text-slate-950 text-xs font-black rounded-xl">Proses Pesanan</button>}
                {ord.status === 'diproses' && <button onClick={() => updateStatus(ord.id, 'selesai')} className="py-2.5 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl">Selesaikan</button>}

                {bluetoothActive && (
                  <button onClick={() => handlePrintBluetoothStruk(ord)} className="py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-xl border border-slate-700">
                    🖨️ Struk Bluetooth
                  </button>
                )}

                {tableMgmtActive && (
                  <button onClick={() => { setSelectedOrderForAction(ord); setShowMoveTableModal(true); }} className="py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700">
                    🪑 Pindah Meja
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showShiftModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-xs rounded-3xl p-6 space-y-3.5">
            <h3 className="text-sm font-bold text-amber-400">{activeShift ? '⏱️ Tutup Shift Kasir' : '⏱️ Buka Shift Kasir'}</h3>

            {!activeShift ? (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Modal Awal Kasir (Rp)</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={modalAwalInput}
                  onChange={(e) => setModalAwalInput(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-bold rounded-xl font-mono"
                />
                <button onClick={handleOpenShift} className="w-full py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl mt-3">
                  Buka Shift Sekarang
                </button>
              </div>
            ) : (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Hitung Uang Kas Fisik Di Laci (Rp)</label>
                <input
                  type="number"
                  placeholder="Total uang fisik..."
                  value={kasFisikInput}
                  onChange={(e) => setKasFisikInput(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-bold rounded-xl font-mono"
                />
                <button onClick={handleCloseShift} className="w-full py-2.5 bg-rose-500 text-white font-black text-xs rounded-xl mt-3">
                  Selesaikan & Tutup Shift
                </button>
              </div>
            )}
            <button onClick={() => setShowShiftModal(false)} className="w-full py-2 bg-slate-800 text-xs font-bold rounded-xl text-slate-400">Tutup</button>
          </div>
        </div>
      )}

      {showMoveTableModal && selectedOrderForAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-xs rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-amber-400">🪑 Pindah Meja Pesanan</h3>
            <p className="text-[10px] text-slate-400">Pindahkan pesanan #{selectedOrderForAction.id.substring(0,6)} ke nomor meja baru.</p>
            <input
              type="number"
              placeholder="Nomor Meja Baru (misal: 5)"
              value={targetTableNo}
              onChange={(e) => setTargetTableNo(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-bold rounded-xl font-mono"
            />
            <div className="flex gap-2 pt-2">
              <button onClick={handleMoveTable} className="flex-1 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl">Simpan Pindah</button>
              <button onClick={() => setShowMoveTableModal(false)} className="px-3 py-2 bg-slate-800 text-xs font-bold rounded-xl">Batal</button>
            </div>
          </div>
        </div>
      )}

      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-xs rounded-3xl p-6 space-y-4 text-center">
            <div className="text-3xl">🔑</div>
            <h3 className="text-sm font-bold text-amber-400">Masukkan Master PIN 6-Digit Owner</h3>
            <p className="text-[10px] text-slate-400">Aksi ini memerlukan konfirmasi PIN pemilik toko.</p>
            
            <input
              type="password"
              maxLength={6}
              placeholder="••••••"
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
              className="w-full text-center text-lg font-mono tracking-widest p-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 focus:outline-none"
            />

            <div className="flex gap-2 pt-2">
              <button onClick={handleVerifyMasterPin} className="flex-1 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl">
                Verifikasi PIN
              </button>
              <button onClick={() => setShowPinModal(false)} className="px-3 py-2 bg-slate-800 text-xs font-bold rounded-xl">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {showRekapModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-amber-400">📊 Rekap & Download Laporan</h3>

            <div className="flex gap-2">
              <button onClick={() => setRekapPeriode('hari')} className={`flex-1 py-2 text-xs font-bold rounded-xl ${rekapPeriode === 'hari' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 border border-slate-800'}`}>
                Hari Ini
              </button>
              <button onClick={() => setRekapPeriode('minggu')} className={`flex-1 py-2 text-xs font-bold rounded-xl ${rekapPeriode === 'minggu' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 border border-slate-800'}`}>
                7 Hari Terakhir
              </button>
              <button onClick={() => setRekapPeriode('bulan')} className={`flex-1 py-2 text-xs font-bold rounded-xl ${rekapPeriode === 'bulan' ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 border border-slate-800'}`}>
                30 Hari Terakhir
              </button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-1">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Total Omzet ({rekapPeriode.toUpperCase()})</p>
              <p className="text-2xl font-black text-emerald-400">Rp {totalRekapOmzet.toLocaleString('id-ID')}</p>
              <p className="text-xs text-slate-400">{rekapOrders.length} Pesanan Selesai</p>
            </div>

            <button onClick={downloadRekapCSV} className="w-full py-2.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-md">
              📥 Download Laporan (CSV / Excel Termasuk Nama Produk)
            </button>
            <button onClick={() => setShowRekapModal(false)} className="w-full py-2 bg-slate-800 text-xs font-bold rounded-xl">
              Tutup
            </button>
          </div>
        </div>
      )}

      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-emerald-400">🎟️ Kelola Kode Promo Toko</h3>

            <div className="space-y-2">
              <input type="text" placeholder="Kode Promo (misal: PROMO20K)" value={newPromoCode} onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())} className="w-full p-2 bg-slate-950 border border-slate-800 text-xs font-bold rounded-xl text-white uppercase" />
              <div className="grid grid-cols-2 gap-2">
                <select value={newPromoType} onChange={(e) => setNewPromoType(e.target.value as any)} className="p-2 bg-slate-950 border border-slate-800 text-xs rounded-xl text-white font-bold">
                  <option value="flat">Nominal (Rp)</option>
                  <option value="persen">Persentase (%)</option>
                </select>
                <input type="number" placeholder="Nilai Diskon" value={newPromoVal} onChange={(e) => setNewPromoVal(Number(e.target.value))} className="p-2 bg-slate-950 border border-slate-800 text-xs rounded-xl text-white" />
              </div>
              <input type="number" placeholder="Minimal Transaksi (Rp)" value={newPromoMin} onChange={(e) => setNewPromoMin(Number(e.target.value))} className="w-full p-2 bg-slate-950 border border-slate-800 text-xs rounded-xl text-white" />
              <button onClick={handleAddPromo} className="w-full py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl">
                + Tambah Promo Baru
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              {promos.map((p) => (
                <div key={p.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-black text-amber-400">{p.kode}</span>
                    <p className="text-[10px] text-slate-400">
                      Diskon: {p.tipe_diskon === 'persen' ? `${p.nilai_diskon}%` : `Rp ${p.nilai_diskon?.toLocaleString('id-ID')}`} (Min: Rp {p.minimal_transaksi?.toLocaleString('id-ID')})
                    </p>
                  </div>
                  <button onClick={() => handleDeletePromo(p.id)} className="text-rose-400 font-bold px-2 py-1 bg-rose-950/40 rounded-lg text-[10px]">
                    Hapus
                  </button>
                </div>
              ))}
            </div>

            <button onClick={() => setShowPromoModal(false)} className="w-full py-2 bg-slate-800 text-xs font-bold rounded-xl">
              Tutup
            </button>
          </div>
        </div>
      )}

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

      {showTampilanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-lg rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-amber-400">🎨 Edit Tema & Info Toko</h2>
            
            <div className="space-y-4">
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

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Foto Background Toko (Wallpaper Pelanggan)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBgImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:py-1 file:px-3 file:rounded-xl file:bg-amber-950 file:text-amber-300"
                />
              </div>

              {/* SECTION KONTROL LOYALTY CARD DINAMIS PERBARUI */}
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
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Pilih Tipe Visual Kartu & Stamp</label>
                      <select
                        value={loyaltyType}
                        onChange={(e) => setLoyaltyType(e.target.value as any)}
                        className="w-full mt-1 p-2 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl font-bold"
                      >
                        <option value="original">Original (Menggunakan Emoji / Teks Stamp Standar)</option>
                        <option value="theme">Ikuti Tema Toko (Otomatis Gunakan Emoji Tema Toko)</option>
                        <option value="custom">Custom (Upload Foto Stamp / Bebas Emoji Khusus)</option>
                      </select>
                    </div>

                    {loyaltyType === 'custom' ? (
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Isi Emoji / Teks Stamp Kustom</label>
                          <input
                            type="text"
                            placeholder="Contoh: 🌟 atau VIP"
                            value={loyaltyStampContent.startsWith('http') ? '' : loyaltyStampContent}
                            onChange={(e) => setLoyaltyStampContent(e.target.value)}
                            className="w-full mt-1 p-2 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Atau Upload Gambar Logo Stamp (Opsional)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setLoyaltyStampImageFile(e.target.files?.[0] || null)}
                            className="w-full mt-1 text-xs text-slate-400 file:py-1 file:px-3 file:rounded-xl file:bg-amber-950 file:text-amber-300"
                          />
                        </div>
                      </div>
                    ) : loyaltyType === 'original' ? (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Emoji / Teks Stamp Original</label>
                        <input
                          type="text"
                          placeholder="☕"
                          value={loyaltyStampContent}
                          onChange={(e) => setLoyaltyStampContent(e.target.value)}
                          className="w-full mt-1 p-2 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl"
                        />
                      </div>
                    ) : null}

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

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Link Google Maps Toko</label>
                <input type="text" placeholder="https://maps.google.com/..." value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nomor WhatsApp Komplain Toko</label>
                <input type="tel" placeholder="081234567890" value={waComplaint} onChange={(e) => setWaComplaint(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl" />
              </div>

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

      <footer className="text-center py-6 text-[10px] text-slate-400 font-medium border-t border-slate-800 mt-8">
        Powered by <strong className="text-emerald-400">reyyztore</strong> • Digital POS System
      </footer>
    </div>
  )
}
