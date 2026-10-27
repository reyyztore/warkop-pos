'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function OrderContent() {
  const searchParams = useSearchParams()
  const mejaParam = searchParams.get('meja')
  const router = useRouter()
  const supabase = createClient()

  const [activeNav, setActiveNav] = useState<'menu' | 'status' | 'game' | 'profile'>('menu')
  const [selectedGame, setSelectedGame] = useState<number>(1)

  // Profile Warkop & QRIS dari Kasir
  const [storeName, setStoreName] = useState('Warung Kopi Kita')
  const [storeAvatar, setStoreAvatar] = useState('')
  const [qrisUrl, setQrisUrl] = useState('')

  // Data State
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [cart, setCart] = useState<{ [key: string]: number }>({})
  const [selectedTable, setSelectedTable] = useState(mejaParam || '')
  const [tables, setTables] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<'qris' | 'kasir'>('kasir')

  // Bukti Transfer & Modal State
  const [showQrisModal, setShowQrisModal] = useState(false)
  const [activeOrderForQris, setActiveOrderForQris] = useState<any>(null)
  const [uploadingBukti, setUploadingBukti] = useState(false)
  const [buktiFile, setBuktiFile] = useState<File | null>(null)

  // Status & Profile Data Pelanggan
  const [myOrders, setMyOrders] = useState<any[]>([])
  const [userData, setUserData] = useState<{ name: string; phone: string; email: string; avatarUrl: string }>({
    name: 'Tamu',
    phone: '',
    email: '',
    avatarUrl: '',
  })
  const [editingName, setEditingName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [soundOption, setSoundOption] = useState<number>(1)
  const [audioUnlocked, setAudioUnlocked] = useState(false)

  // 10 Games State
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

  // Audio Functions
  const unlockAudio = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      ctx.resume()
      setAudioUnlocked(true)
    } catch (e) {
      console.log(e)
    }
  }

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
        const interval = setInterval(playTone, 10000)
        setTimeout(() => clearInterval(interval), 30000)
      }
    } catch (e) {
      console.log(e)
    }
  }

  const triggerSoundByOption = (opt: number) => {
    unlockAudio()
    if (opt === 1) playBellSound(false)
    if (opt === 2) playBellSound(true)
    if (opt === 3) speakText('Pesanan anda sudah selesai', false)
    if (opt === 4) speakText('Pesanan anda sudah selesai', true)
  }

  useEffect(() => {
    initData()
    loadUserProfile()
    fetchStoreConfig()

    // Realtime Broadcast Bel Spesifik Meja
    const channel = supabase
      .channel('meja-customer-realtime')
      .on('broadcast', { event: 'ring-table-bell' }, (payload: any) => {
        if (payload.payload?.tableNo?.toString() === selectedTable?.toString()) {
          triggerSoundByOption(soundOption)
          alert(`🔔 Meja #${selectedTable}: Pesanan kamu dipanggil kasir!`)
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload: any) => {
        if (payload.new && payload.new.nama_pemesan === userData.name) {
          if (payload.new.status === 'selesai') {
            triggerSoundByOption(soundOption)
          }
          fetchMyOrders()
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedTable, soundOption, userData.name])

  const fetchStoreConfig = async () => {
    const { data } = await supabase.from('profiles').select('store_name, avatar_url, qris_url').eq('role', 'cashier').limit(1)
    if (data && data.length > 0) {
      if (data[0].store_name) setStoreName(data[0].store_name)
      if (data[0].avatar_url) setStoreAvatar(data[0].avatar_url)
      if (data[0].qris_url) setQrisUrl(data[0].qris_url)
    }
  }

  const loadUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const name = session.user.user_metadata?.full_name || localStorage.getItem('customer_name') || 'Pelanggan'
      const phone = session.user.user_metadata?.phone || localStorage.getItem('customer_phone') || '-'
      const email = session.user.email || ''
      const avatarUrl = session.user.user_metadata?.avatar_url || ''
      setUserData({ name, phone, email, avatarUrl })
      setEditingName(name)
      fetchMyOrders(name)
    } else {
      const name = localStorage.getItem('customer_name') || 'Tamu'
      const phone = localStorage.getItem('customer_phone') || '-'
      setUserData({ name, phone, email: '-', avatarUrl: '' })
      setEditingName(name)
      fetchMyOrders(name)
    }
  }

  const fetchMyOrders = async (nameFilter?: string) => {
    const targetName = nameFilter || userData.name
    if (!targetName || targetName === 'Tamu') return

    const { data } = await supabase
      .from('orders')
      .select('*, tables(nomor), order_items(*, menu_items(nama))')
      .eq('nama_pemesan', targetName)
      .order('created_at', { ascending: false })

    if (data) setMyOrders(data)
  }

  const initData = async () => {
    setLoading(true)
    const { data: catData } = await supabase.from('categories').select('*').order('urutan')
    const { data: menuData } = await supabase.from('menu_items').select('*').eq('tersedia', true)
    const { data: tblData } = await supabase.from('tables').select('*').eq('aktif', true).order('nomor')

    if (catData) setCategories(catData)
    if (menuData) setMenuItems(menuData)
    if (tblData) setTables(tblData)
    setLoading(false)
  }

  const updateCart = (id: string, delta: number) => {
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

  const getTotalHarga = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const item = menuItems.find((m) => m.id === id)
      return total + (item ? item.harga * qty : 0)
    }, 0)
  }

  const getTotalItem = () => Object.values(cart).reduce((a, b) => a + b, 0)

  const handleCheckout = async () => {
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
          table_id: targetTable.id,
          nama_pemesan: userData.name,
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

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
      if (itemsErr) throw itemsErr

      if (selectedPayment === 'qris') {
        setActiveOrderForQris(orderData)
        setShowQrisModal(true)
      } else {
        alert('🚀 Pesanan berhasil dikirim ke kasir!')
      }

      setCart({})
      setActiveNav('status')
      fetchMyOrders()
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim pesanan.')
    } finally {
      setSubmitting(false)
    }
  }

  // Panggil Kasir dari Pelanggan (Berbunyi di Kasir)
  const handleNudgeKasir = async () => {
    await supabase.channel('kasir-dashboard-realtime').send({
      type: 'broadcast',
      event: 'customer-ring-bell',
      payload: { tableNo: selectedTable || '??', customerName: userData.name },
    })
    alert(`🔔 Bel Meja #${selectedTable} telah dibunyikan di Kasir!`)
  }

  const handleUploadBukti = async (orderId: string) => {
    if (!buktiFile) {
      alert('Pilih file foto bukti transfer terlebih dahulu.')
      return
    }

    setUploadingBukti(true)
    try {
      const fileExt = buktiFile.name.split('.').pop()
      const filePath = `bukti/order_${orderId}_${Date.now()}.${fileExt}`

      await supabase.storage.from('menu-images').upload(filePath, buktiFile)
      const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath)

      await supabase.from('orders').update({
        bukti_pembayaran_url: data.publicUrl,
      }).eq('id', orderId)

      alert('✅ Bukti pembayaran berhasil terkirim ke kasir!')
      setBuktiFile(null)
      setShowQrisModal(false)
      fetchMyOrders()
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

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.auth.updateUser({
          data: { full_name: editingName, avatar_url: avatarUrl },
        })
      }

      localStorage.setItem('customer_name', editingName)
      setUserData((prev) => ({ ...prev, name: editingName, avatarUrl }))
      alert('Profil berhasil diperbarui!')
    } catch (e: any) {
      alert(e.message)
    }
  }

  const handleLogout = async () => {
    window.speechSynthesis.cancel()
    await supabase.auth.signOut()
    localStorage.clear()
    router.push('/')
  }

  const filteredMenuItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(m => m.category_id === activeCategory)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28 font-sans">
      {/* Top Bar Header dengan Logo & Nama Warkop Kasir */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg shrink-0">
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
              className="appearance-none bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs px-3 py-2 pr-7 rounded-xl focus:outline-none"
            >
              <option value="" className="bg-slate-900 text-slate-300">Pilih Meja</option>
              {tables.map((t) => (
                <option key={t.id} value={t.nomor} className="bg-slate-900 text-white">Meja #{t.nomor}</option>
              ))}
            </select>
            <span className="absolute right-2.5 top-2.5 text-[10px] text-emerald-400 pointer-events-none">▼</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* TAB 1: MENU KATALOG */}
        {activeNav === 'menu' && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                  activeCategory === 'all' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                Semua Menu
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                    activeCategory === cat.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {cat.nama}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-24 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800/50" />
                ))}
              </div>
            ) : filteredMenuItems.map((item) => {
              const qty = cart[item.id] || 0
              return (
                <div key={item.id} className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center gap-3.5">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                    {item.foto_url ? (
                      <img src={item.foto_url} alt={item.nama} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">☕</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm line-clamp-1">{item.nama}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{item.deskripsi || 'Racikan khas warkop kami.'}</p>
                    <p className="text-xs font-black text-emerald-400 mt-1.5">Rp {item.harga?.toLocaleString('id-ID')}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    {qty > 0 ? (
                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
                        <button onClick={() => updateCart(item.id, -1)} className="w-7 h-7 bg-slate-800 text-white rounded-lg text-xs font-bold">-</button>
                        <span className="w-6 text-center text-xs font-black text-emerald-400">{qty}</span>
                        <button onClick={() => updateCart(item.id, 1)} className="w-7 h-7 bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold">+</button>
                      </div>
                    ) : (
                      <button onClick={() => updateCart(item.id, 1)} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl">+ Tambah</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* TAB 2: STATUS PESANAN */}
        {activeNav === 'status' && (
          <div className="space-y-4">
            {/* Tombol Pembuka Izin Audio */}
            {!audioUnlocked && (
              <button
                onClick={unlockAudio}
                className="w-full py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-2xl animate-pulse"
              >
                🔊 Klik di sini 1x untuk mengaktifkan Suara Bel Pesanan
              </button>
            )}

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span>🔊</span> Pilih Nada Dering Selesai Pelanggan:
              </label>
              <select
                value={soundOption}
                onChange={(e) => setSoundOption(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white p-2.5 rounded-xl focus:outline-none"
              >
                <option value={1}>1. Bel Biasa</option>
                <option value={2}>2. Bel Berulang 10 Detik</option>
                <option value={3}>3. "Pesanan anda sudah selesai"</option>
                <option value={4}>4. "Pesanan anda sudah selesai" (Berulang)</option>
              </select>
            </div>

            <div className="bg-amber-950/30 border border-amber-500/30 p-3.5 rounded-2xl text-center space-y-1">
              <p className="text-xs font-bold text-amber-300">🔔 Jika pesanan belum diproses, pencetlah bel!</p>
              <button
                onClick={handleNudgeKasir}
                className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-black rounded-xl active:scale-95 transition mt-1 shadow-lg shadow-amber-500/20"
              >
                🔔 Pencet Bel Panggil Kasir
              </button>
            </div>

            <h2 className="text-base font-bold text-white flex items-center gap-2"><span>📡</span> Status Pesanan Kamu</h2>

            {myOrders.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-400">Belum ada pesanan aktif saat ini.</div>
            ) : (
              myOrders.map((ord) => (
                <div key={ord.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-emerald-400">Meja #{ord.tables?.nomor || '-'}</span>
                      <p className="text-[10px] text-slate-500">{new Date(ord.created_at).toLocaleString('id-ID')}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      ord.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      ord.status === 'diproses' ? 'bg-blue-500/20 text-blue-400' :
                      ord.status === 'selesai' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {ord.status}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-b border-slate-800/80 py-2">
                    <button
                      onClick={() => {
                        setActiveOrderForQris(ord)
                        setShowQrisModal(true)
                      }}
                      className="flex-1 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800/80 text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                    >
                      <span>📲</span> Lihat QRIS Toko
                    </button>
                    <button
                      onClick={() => {
                        setActiveOrderForQris(ord)
                        setShowQrisModal(true)
                      }}
                      className="flex-1 py-1.5 bg-blue-950 text-blue-300 border border-blue-800/80 text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                    >
                      <span>📤</span> {ord.bukti_pembayaran_url ? 'Bukti Terkirim ✅' : 'Kirim Bukti Bayar'}
                    </button>
                  </div>

                  <ul className="divide-y divide-slate-800/60 text-xs text-slate-300">
                    {ord.order_items?.map((it: any) => (
                      <li key={it.id} className="py-1 flex justify-between">
                        <span><strong className="text-emerald-400">{it.qty}x</strong> {it.menu_items?.nama}</span>
                        <span className="text-slate-500">Rp {(it.harga_satuan * it.qty).toLocaleString('id-ID')}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 flex justify-between text-xs font-bold">
                    <span>Total: <strong className="text-emerald-400">Rp {ord.total_harga?.toLocaleString('id-ID')}</strong></span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${ord.is_paid ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                      {ord.is_paid ? 'Lunas ✅' : 'Belum Lunas'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: 10 GAMES */}
        {activeNav === 'game' && (
          <div className="space-y-4 text-center">
            <h2 className="text-base font-bold text-white">🎮 Arena 10 Games Anti-Bosan</h2>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {[{ id: 1, name: '1. TicTacToe' }, { id: 2, name: '2. Tebak Angka' }, { id: 3, name: '3. Su-Wit' }, { id: 4, name: '4. Memory' }, { id: 5, name: '5. Clicker' }].map((g) => (
                <button key={g.id} onClick={() => setSelectedGame(g.id)} className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${selectedGame === g.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}>
                  {g.name}
                </button>
              ))}
            </div>

            {selectedGame === 1 && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl inline-block max-w-xs w-full">
                <div className="grid grid-cols-3 gap-2">
                  {tttBoard.map((cell, idx) => (
                    <button key={idx} onClick={() => {
                      if (cell || calculateWinner(tttBoard)) return
                      const next = [...tttBoard]
                      next[idx] = tttIsX ? '❌' : '⭕'
                      setTttBoard(next)
                      setTttIsX(!tttIsX)
                    }} className="h-16 bg-slate-950 border border-slate-800 text-xl font-black rounded-xl">
                      {cell}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setTttBoard(Array(9).fill(null)); setTttIsX(true); }} className="mt-4 px-4 py-2 bg-slate-800 text-xs font-bold rounded-xl text-white">🔄 Reset Permainan</button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROFIL PELANGGAN */}
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

                <button onClick={handleSaveProfile} className="w-full py-2.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl">💾 Simpan Perubahan Profil</button>
              </div>

              <button onClick={handleLogout} className="w-full py-2.5 bg-red-950/80 text-red-400 border border-red-800/80 text-xs font-bold rounded-xl">🚪 Keluar (Logout)</button>
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

            <button onClick={handleCheckout} disabled={submitting} className="w-full py-2.5 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl">
              {submitting ? 'Mengirim...' : 'Pesan Sekarang →'}
            </button>
          </div>
        </div>
      )}

      {/* Modal Popup QRIS Toko */}
      {showQrisModal && activeOrderForQris && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-sm rounded-3xl p-6 text-center space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-emerald-400">📲 Pembayaran QRIS Toko</h3>
            
            <div className="w-56 h-56 mx-auto bg-white p-2 rounded-2xl flex items-center justify-center">
              {qrisUrl ? <img src={qrisUrl} alt="QRIS" className="w-full h-full object-contain" /> : <p className="text-xs text-slate-500">QRIS belum diupload oleh kasir</p>}
            </div>

            {/* Form Upload Bukti Transfer */}
            <div className="pt-2 border-t border-slate-800 text-left space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Kirim Bukti Pembayaran (Transfer/Struk)</label>
              <input type="file" accept="image/*" onChange={(e) => setBuktiFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-400 file:py-1 file:px-3 file:rounded-xl file:bg-emerald-950 file:text-emerald-300" />
              
              <button
                onClick={() => handleUploadBukti(activeOrderForQris.id)}
                disabled={uploadingBukti}
                className="w-full py-2.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl"
              >
                {uploadingBukti ? 'Mengirim Bukti...' : '📤 Kirim Bukti Ke Kasir'}
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

export default function MejaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500 text-center bg-slate-950 min-h-screen">Memuat warkop...</div>}>
      <OrderContent />
    </Suspense>
  )
}
