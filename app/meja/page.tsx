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

  // Tab Active
  const [activeNav, setActiveNav] = useState<'menu' | 'status' | 'game' | 'profile'>('menu')
  const [selectedGame, setSelectedGame] = useState<number>(1)

  // Data State
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [cart, setCart] = useState<{ [key: string]: number }>({})
  const [selectedTable, setSelectedTable] = useState(mejaParam || '')
  const [tables, setTables] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Status & Profile Data
  const [myOrders, setMyOrders] = useState<any[]>([])
  const [userData, setUserData] = useState<{ name: string; phone: string; email: string; avatarUrl: string }>({
    name: 'Tamu',
    phone: '',
    email: '',
    avatarUrl: '',
  })
  const [editingName, setEditingName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Sound Options State (1: Bel Biasa, 2: Bel 10s Loop, 3: Voice Selesai, 4: Voice Selesai Loop)
  const [soundOption, setSoundOption] = useState<number>(1)

  // Games State
  // Game 1: Tic Tac Toe
  const [tttBoard, setTttBoard] = useState(Array(9).fill(null))
  const [tttIsX, setTttIsX] = useState(true)

  // Game 2: Tebak Angka
  const [guessTarget, setGuessTarget] = useState(Math.floor(Math.random() * 20) + 1)
  const [guessInput, setGuessInput] = useState('')
  const [guessMsg, setGuessMsg] = useState('Tebak angka 1 - 20!')

  // Game 3: RPS
  const [rpsResult, setRpsResult] = useState('Pilih salah satu!')

  // Game 4: Memory Cards
  const initialCards = ['☕', '☕', '🥐', '🥐', '🍰', '🍰', '🧃', '🧃'].sort(() => Math.random() - 0.5)
  const [cards, setCards] = useState(initialCards)
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])

  // Game 5: Clicker Speed Test
  const [clicks, setClicks] = useState(0)

  // --- TTS & AUDIO HELPER ---
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
        const interval = setInterval(playTone, 10000)
        setTimeout(() => clearInterval(interval), 30000)
      }
    } catch (e) {
      console.log(e)
    }
  }

  const triggerSoundByOption = (opt: number, forceProcess: boolean = false) => {
    if (forceProcess) {
      playBellSound(false)
      return
    }
    if (opt === 1) playBellSound(false)
    if (opt === 2) playBellSound(true)
    if (opt === 3) speakText('Pesanan anda sudah selesai', false)
    if (opt === 4) speakText('Pesanan anda sudah selesai', true)
  }

  useEffect(() => {
    initData()
    loadUserProfile()

    // Realtime Listener
    const channel = supabase
      .channel('my-orders-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload: any) => {
          if (payload.new && payload.new.nama_pemesan === userData.name) {
            if (payload.new.status === 'diproses') {
              triggerSoundByOption(soundOption, true)
            } else if (payload.new.status === 'selesai') {
              triggerSoundByOption(soundOption, false)
            }
            fetchMyOrders()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userData.name, soundOption])

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

      alert('🚀 Pesanan berhasil dikirim ke kasir!')
      setCart({})
      setActiveNav('status')
      fetchMyOrders()
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim pesanan.')
    } finally {
      setSubmitting(false)
    }
  }

  // Panggil Kasir Manual
  const handleNudgeKasir = async () => {
    playBellSound(false)
    alert('🔔 Memanggil kasir! Notifikasi bel panggil dikirim ke kasir.')
  }

  // Update Profil
  const handleSaveProfile = async () => {
    try {
      let avatarUrl = userData.avatarUrl

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `avatars/${fileName}`
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
      {/* Top Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">Warkop Digital</span>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">☕ Warung Kopi Kita</h1>
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

      {/* Main Container Content */}
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

        {/* TAB 2: STATUS PESANAN & NOTIFIKASI SUARA */}
        {activeNav === 'status' && (
          <div className="space-y-4">
            {/* Setting Nada Dering */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span>🔊</span> Pilih Nada Dering Selesai:
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

            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-white flex items-center gap-2"><span>📡</span> Status Pesanan Kamu</h2>
              <button
                onClick={handleNudgeKasir}
                className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-xl active:scale-95"
              >
                🔔 Panggil Kasir
              </button>
            </div>

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
                      ord.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      ord.status === 'diproses' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      ord.status === 'selesai' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {ord.status === 'pending' ? '⏳ Menunggu Kasir' : ord.status === 'diproses' ? '🍳 Sedang Dibuat' : ord.status === 'selesai' ? '✅ Pesanan Selesai' : '❌ Dibatalkan'}
                    </span>
                  </div>

                  <ul className="divide-y divide-slate-800/60 text-xs text-slate-300 pt-1">
                    {ord.order_items?.map((it: any) => (
                      <li key={it.id} className="py-1.5 flex justify-between">
                        <span><strong className="text-emerald-400">{it.qty}x</strong> {it.menu_items?.nama}</span>
                        <span className="text-slate-500">Rp {(it.harga_satuan * it.qty).toLocaleString('id-ID')}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-slate-800 flex justify-between text-xs font-bold">
                    <span>Total Pembayaran</span>
                    <span className="text-emerald-400">Rp {ord.total_harga?.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: 5 GAME ANTI-BOSAN */}
        {activeNav === 'game' && (
          <div className="space-y-4 text-center">
            <h2 className="text-base font-bold text-white">🎮 Arena Game Anti-Bosan</h2>
            
            {/* Game Selector Tab */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {[
                { id: 1, name: '❌⭕ TicTacToe' },
                { id: 2, name: '🔢 Tebak Angka' },
                { id: 3, name: '✂️ Su-Wit' },
                { id: 4, name: '🃏 Memory Card' },
                { id: 5, name: '⚡ Clicker Speed' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGame(g.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap ${selectedGame === g.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400'}`}
                >
                  {g.name}
                </button>
              ))}
            </div>

            {/* Game 1: Tic Tac Toe */}
            {selectedGame === 1 && (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl inline-block max-w-xs w-full">
                <div className="grid grid-cols-3 gap-2">
                  {tttBoard.map((cell, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (cell || calculateWinner(tttBoard)) return
                        const next = [...tttBoard]
                        next[idx] = tttIsX ? '❌' : '⭕'
                        setTttBoard(next)
                        setTttIsX(!tttIsX)
                      }}
                      className="h-20 bg-slate-950 border border-slate-800 text-2xl font-black rounded-xl hover:bg-slate-800 flex items-center justify-center"
                    >
                      {cell}
                    </button>
                  ))}
                </div>
                <button onClick={() => { setTttBoard(Array(9).fill(null)); setTttIsX(true); }} className="mt-4 px-4 py-2 bg-slate-800 text-xs font-bold text-white rounded-xl">Reset Game</button>
              </div>
            )}

            {/* Game 2: Tebak Angka */}
            {selectedGame === 2 && (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
                <p className="text-xs font-bold text-emerald-400">{guessMsg}</p>
                <input
                  type="number"
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                  placeholder="Masukkan angka (1-20)"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 text-center text-xs font-bold rounded-xl"
                />
                <button
                  onClick={() => {
                    const num = parseInt(guessInput)
                    if (num === guessTarget) setGuessMsg('🎉 BENAR KAN! Kamu menang!')
                    else if (num < guessTarget) setGuessMsg('Too low! Angka lebih besar.')
                    else setGuessMsg('Too high! Angka lebih kecil.')
                  }}
                  className="w-full py-2 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl"
                >
                  Tebak!
                </button>
              </div>
            )}

            {/* Game 3: Su-wit (RPS) */}
            {selectedGame === 3 && (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
                <p className="text-xs font-bold text-emerald-400">{rpsResult}</p>
                <div className="flex justify-center gap-3">
                  {['✊ Batu', '✋ Kertas', '✌️ Gunting'].map((choice, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const bot = ['✊ Batu', '✋ Kertas', '✌️ Gunting'][Math.floor(Math.random() * 3)]
                        if (choice === bot) setRpsResult(`Seri! Bot pilih ${bot}`)
                        else setRpsResult(`Kamu: ${choice} vs Bot: ${bot}`)
                      }}
                      className="px-3 py-2 bg-slate-950 border border-slate-800 text-xs font-bold rounded-xl"
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Game 4: Memory Cards */}
            {selectedGame === 4 && (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {cards.map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (flipped.length < 2 && !flipped.includes(idx)) {
                          const nextFlipped = [...flipped, idx]
                          setFlipped(nextFlipped)
                          if (nextFlipped.length === 2) {
                            if (cards[nextFlipped[0]] === cards[nextFlipped[1]]) {
                              setMatched((m) => [...m, nextFlipped[0], nextFlipped[1]])
                            }
                            setTimeout(() => setFlipped([]), 800)
                          }
                        }
                      }}
                      className="h-16 bg-slate-950 border border-slate-800 text-xl font-bold rounded-xl"
                    >
                      {flipped.includes(idx) || matched.includes(idx) ? card : '❓'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Game 5: Clicker Speed */}
            {selectedGame === 5 && (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
                <p className="text-xs font-bold text-emerald-400">Total Klik Kamu: {clicks}</p>
                <button
                  onClick={() => setClicks(clicks + 1)}
                  className="w-full py-8 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xl rounded-2xl active:scale-95 transition"
                >
                  ⚡ KLIK SECEPAT MUNGKIN!
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROFIL PELANGGAN (EDIT NAMA & FOTO) */}
        {activeNav === 'profile' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 text-center">
              {/* Foto Profil */}
              <div className="relative w-24 h-24 mx-auto">
                <div className="w-full h-full rounded-full overflow-hidden bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-3xl">
                  {userData.avatarUrl ? (
                    <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    '👤'
                  )}
                </div>
              </div>

              {/* Form Upload Foto & Edit Nama */}
              <div className="space-y-3 text-left">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Ubah Foto Profil</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-emerald-950 file:text-emerald-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Ganti Nama Pelanggan</label>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 text-xs font-bold text-white rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="w-full py-2.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl active:scale-95 transition"
                >
                  💾 Simpan Perubahan Profil
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 mt-2 bg-red-950/80 hover:bg-red-900 text-red-400 border border-red-800/80 text-xs font-bold rounded-xl transition active:scale-95"
              >
                🚪 Keluar (Logout)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {activeNav === 'menu' && Object.keys(cart).length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-30">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/40 p-3.5 rounded-2xl shadow-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{getTotalItem()} Menu Dipilih</p>
              <p className="text-base font-black text-emerald-400">Rp {getTotalHarga().toLocaleString('id-ID')}</p>
            </div>
            <button onClick={handleCheckout} disabled={submitting} className="px-5 py-2.5 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl">
              {submitting ? 'Mengirim...' : 'Pesan Sekarang →'}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 p-2 z-40">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 text-center">
          <button onClick={() => setActiveNav('menu')} className={`py-1.5 text-xs font-bold rounded-xl transition ${activeNav === 'menu' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'}`}>
            ☕ Menu
          </button>
          <button onClick={() => setActiveNav('status')} className={`py-1.5 text-xs font-bold rounded-xl transition ${activeNav === 'status' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'}`}>
            📡 Status
          </button>
          <button onClick={() => setActiveNav('game')} className={`py-1.5 text-xs font-bold rounded-xl transition ${activeNav === 'game' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'}`}>
            🎮 Game
          </button>
          <button onClick={() => setActiveNav('profile')} className={`py-1.5 text-xs font-bold rounded-xl transition ${activeNav === 'profile' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'}`}>
            👤 Profil
          </button>
        </div>
      </div>
    </div>
  )
}

function calculateWinner(squares: any[]) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
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
