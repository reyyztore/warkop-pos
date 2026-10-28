'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function DynamicStoreContent() {
  const params = useParams()
  const slug = params?.slug as string
  const supabase = createClient()

  const [storeData, setStoreData] = useState<any>(null)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) fetchStoreDetails()
  }, [slug])

  const fetchStoreDetails = async () => {
    setLoading(true)

    // 1. Ambil Data Toko Berdasarkan Slug URL
    const { data: store } = await supabase.from('stores').select('*').eq('slug', slug).single()

    if (store) {
      setStoreData(store)

      // 2. Ambil Menu, Kategori & Meja Milik Toko Ini
      const { data: menu } = await supabase.from('menu_items').select('*').eq('store_id', store.id).eq('tersedia', true)
      const { data: cat } = await supabase.from('categories').select('*').eq('store_id', store.id).order('urutan')
      const { data: tbl } = await supabase.from('tables').select('*').eq('store_id', store.id).eq('aktif', true)

      if (menu) setMenuItems(menu)
      if (cat) setCategories(cat)
      if (tbl) setTables(tbl)
    }

    setLoading(false)
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-xs">Memuat toko {slug}...</div>
  }

  if (!storeData) {
    return <div className="min-h-screen bg-slate-950 text-rose-400 flex items-center justify-center text-xs">Toko tidak ditemukan.</div>
  }

  return (
    <div className="min-h-screen text-slate-100 p-4 font-sans" style={{ backgroundColor: storeData.bg_color || '#0f172a' }}>
      <div className="max-w-md mx-auto space-y-4">
        {/* Header Toko */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 overflow-hidden flex items-center justify-center text-xl shrink-0">
            {storeData.avatar_url ? <img src={storeData.avatar_url} alt="Logo" className="w-full h-full object-cover" /> : '☕'}
          </div>
          <div>
            <h1 className="text-base font-black text-white">{storeData.store_name}</h1>
            <p className="text-[10px] text-emerald-400 font-bold">{storeData.is_open ? '● Toko Sedang Buka' : '🚫 Toko Tutup'}</p>
          </div>
        </div>

        {storeData.announcement && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-2xl text-center">
            📢 {storeData.announcement}
          </div>
        )}

        {/* Daftar Menu Multi-Tenant */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase">Daftar Menu</h2>
          {menuItems.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6 bg-slate-900/40 rounded-2xl">Belum ada menu di toko ini.</p>
          ) : (
            menuItems.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">{item.nama}</h3>
                  <p className="text-xs font-black text-emerald-400 mt-1">Rp {item.harga?.toLocaleString('id-ID')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function StoreSlugPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500 text-center bg-slate-950 min-h-screen">Memuat...</div>}>
      <DynamicStoreContent />
    </Suspense>
  )
}
