'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function OrderContent() {
  const searchParams = useSearchParams()
  const mejaParam = searchParams.get('meja')
  const supabase = createClient()

  const [menuItems, setMenuItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [cart, setCart] = useState<{ [key: string]: number }>({})
  const [selectedTable, setSelectedTable] = useState(mejaParam || '')
  const [tables, setTables] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    initData()
  }, [])

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

  const getTotalItem = () => {
    return Object.values(cart).reduce((a, b) => a + b, 0)
  }

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
      const namaPemesan = localStorage.getItem('customer_name') || 'Tamu'
      const phonePemesan = localStorage.getItem('customer_phone') || ''
      const targetTable = tables.find((t) => t.nomor.toString() === selectedTable.toString())

      if (!targetTable) throw new Error('Meja tidak valid.')

      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert({
          table_id: targetTable.id,
          nama_pemesan: namaPemesan,
          phone_pemesan: phonePemesan,
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
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim pesanan.')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredMenuItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(m => m.category_id === activeCategory)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28 font-sans">
      {/* Header Banner */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 p-4 transition-all">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">Warkop Digital</span>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>☕</span> Warung Kopi Kita
            </h1>
          </div>
          
          {/* Selector Meja */}
          <div className="relative">
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="appearance-none bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs px-3 py-2 pr-7 rounded-xl focus:outline-none active:scale-95 transition-all"
            >
              <option value="" className="bg-slate-900 text-slate-300">Pilih Meja</option>
              {tables.map((t) => (
                <option key={t.id} value={t.nomor} className="bg-slate-900 text-white">
                  Meja #{t.nomor}
                </option>
              ))}
            </select>
            <span className="absolute right-2.5 top-2.5 text-[10px] text-emerald-400 pointer-events-none">▼</span>
          </div>
        </div>

        {/* Tab Kategori Filter */}
        <div className="max-w-md mx-auto flex gap-2 overflow-x-auto mt-4 pb-1 no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
              activeCategory === 'all'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Semua Menu
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                activeCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat.nama}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-3">
        {loading ? (
          <div className="space-y-3 mt-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800/50" />
            ))}
          </div>
        ) : filteredMenuItems.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800/60 rounded-3xl mt-6">
            <span className="text-4xl block mb-2">🍽️</span>
            <p className="text-xs text-slate-400 font-medium">Belum ada menu di kategori ini.</p>
          </div>
        ) : (
          filteredMenuItems.map((item) => {
            const qty = cart[item.id] || 0
            return (
              <div
                key={item.id}
                className="group relative bg-slate-900/80 backdrop-blur-md border border-slate-800/80 hover:border-emerald-500/40 p-3 rounded-2xl transition-all duration-300 flex items-center gap-3.5 shadow-sm"
              >
                {/* Foto / Placeholder */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                  {item.foto_url ? (
                    <img
                      src={item.foto_url}
                      alt={item.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl bg-slate-800/80">
                      ☕
                    </div>
                  )}
                </div>

                {/* Deskripsi Menu */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm line-clamp-1">{item.nama}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {item.deskripsi || 'Nikmati kelezatan racikan warkop kami.'}
                  </p>
                  <p className="text-xs font-black text-emerald-400 mt-1.5">
                    Rp {item.harga?.toLocaleString('id-ID')}
                  </p>
                </div>

                {/* Tombol Counter */}
                <div className="flex flex-col items-center justify-center gap-1">
                  {qty > 0 ? (
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 shadow-inner">
                      <button
                        onClick={() => updateCart(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold active:scale-90 transition-transform"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-black text-emerald-400">{qty}</span>
                      <button
                        onClick={() => updateCart(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold active:scale-90 transition-transform"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => updateCart(item.id, 1)}
                      className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 text-xs font-bold rounded-xl active:scale-90 transition-all shadow-sm"
                    >
                      + Tambah
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-30 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/40 p-3.5 rounded-2xl shadow-2xl shadow-emerald-950/50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{getTotalItem()} Menu Dipilih</span>
              </div>
              <p className="text-base font-black text-emerald-400 mt-0.5">
                Rp {getTotalHarga().toLocaleString('id-ID')}
              </p>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? 'Mengirim...' : 'Pesan Sekarang →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MejaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500 text-center bg-slate-950 min-h-screen">Memuat menu...</div>}>
      <OrderContent />
    </Suspense>
  )
}
