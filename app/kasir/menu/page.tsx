'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function KasirMenuPage() {
  const supabase = createClient()

  const [storeId, setStoreId] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form Modal Menu State
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<any | null>(null)
  const [namaMenu, setNamaMenu] = useState('')
  const [deskripsiMenu, setDeskripsiMenu] = useState('')
  const [hargaMenu, setHargaMenu] = useState('')
  const [hargaDinginMenu, setHargaDinginMenu] = useState('')
  const [selectedCatId, setSelectedCatId] = useState('')
  const [labelMenu, setLabelMenu] = useState('') // 🌟 State baru untuk Label Badge Menu
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form Category State
  const [showCatModal, setShowCatModal] = useState(false)
  const [namaCategory, setNamaCategory] = useState('')

  useEffect(() => {
    initKasirStore()
  }, [])

  const initKasirStore = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      window.location.href = '/kasir/login'
      return
    }

    const { data: profile } = await supabase.from('profiles').select('store_id').eq('id', session.user.id).single()
    if (profile?.store_id) {
      setStoreId(profile.store_id)
      fetchData(profile.store_id)
    } else {
      setLoading(false)
      alert('Toko tidak ditemukan. Silakan daftar toko terlebih dahulu.')
    }
  }

  const fetchData = async (targetStoreId: string) => {
    setLoading(true)
    const { data: catData } = await supabase.from('categories').select('*').eq('store_id', targetStoreId).order('urutan')
    const { data: menuData } = await supabase.from('menu_items').select('*, categories(nama)').eq('store_id', targetStoreId).order('created_at', { ascending: false })

    if (catData) setCategories(catData)
    if (menuData) setMenuItems(menuData)
    setLoading(false)
  }

  // TAMBAH / EDIT MENU (DENGAN LABEL BADGE DAN HARGA PANAS/DINGIN)
  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId) return
    if (!namaMenu.trim() || !hargaMenu || !selectedCatId) {
      alert('Nama, harga utama/panas, dan kategori wajib diisi!')
      return
    }

    setSubmitting(true)
    try {
      let fotoUrl = editingMenuItem?.foto_url || ''

      if (fotoFile) {
        const fileExt = fotoFile.name.split('.').pop()
        const filePath = `store/${storeId}/menu_${Date.now()}.${fileExt}`
        await supabase.storage.from('menu-images').upload(filePath, fotoFile)
        const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath)
        fotoUrl = data.publicUrl
      }

      const mainHarga = parseInt(hargaMenu)
      const dinginHarga = hargaDinginMenu ? parseInt(hargaDinginMenu) : null

      const menuDataPayload = {
        store_id: storeId,
        category_id: selectedCatId,
        nama: namaMenu.trim(),
        deskripsi: deskripsiMenu.trim(),
        harga: mainHarga,
        harga_panas: mainHarga,
        harga_dingin: dinginHarga,
        label: labelMenu.trim() || null, // 🌟 Simpan label badge menu
        foto_url: fotoUrl,
        tersedia: editingMenuItem ? editingMenuItem.tersedia : true,
      }

      if (editingMenuItem) {
        await supabase.from('menu_items').update(menuDataPayload).eq('id', editingMenuItem.id)
      } else {
        await supabase.from('menu_items').insert(menuDataPayload)
      }

      setShowMenuModal(false)
      resetMenuForm()
      fetchData(storeId)
      alert('✅ Menu berhasil disimpan!')
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  // TOGGLE STOK TERSEDIA / HABIS
  const toggleAvailable = async (id: string, currentStatus: boolean) => {
    if (!storeId) return
    await supabase.from('menu_items').update({ tersedia: !currentStatus }).eq('id', id)
    fetchData(storeId)
  }

  // HAPUS MENU
  const handleDeleteMenu = async (id: string) => {
    if (!storeId || !confirm('Yakin ingin menghapus menu ini?')) return
    await supabase.from('menu_items').delete().eq('id', id)
    fetchData(storeId)
  }

  // TAMBAH KATEGORI BARU
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId || !namaCategory.trim()) return

    await supabase.from('categories').insert({
      store_id: storeId,
      nama: namaCategory.trim(),
      urutan: categories.length + 1,
    })

    setNamaCategory('')
    setShowCatModal(false)
    fetchData(storeId)
    alert('✅ Kategori berhasil ditambahkan!')
  }

  const resetMenuForm = () => {
    setEditingMenuItem(null)
    setNamaMenu('')
    setDeskripsiMenu('')
    setHargaMenu('')
    setHargaDinginMenu('')
    setSelectedCatId('')
    setLabelMenu('')
    setFotoFile(null)
  }

  const openEditModal = (item: any) => {
    setEditingMenuItem(item)
    setNamaMenu(item.nama)
    setDeskripsiMenu(item.deskripsi || '')
    setHargaMenu((item.harga_panas || item.harga).toString())
    setHargaDinginMenu(item.harga_dingin ? item.harga_dingin.toString() : '')
    setSelectedCatId(item.category_id)
    setLabelMenu(item.label || '')
    setShowMenuModal(true)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans pb-16">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <Link href="/kasir" className="text-xs text-emerald-400 font-bold hover:underline">← Kembali ke Dasbor</Link>
            <h1 className="text-xl font-black text-white mt-1">🌸 Kelola Menu & Label Promosi</h1>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setShowCatModal(true)} className="px-3 py-2 bg-slate-900 border border-slate-800 text-xs font-bold text-amber-300 rounded-xl">
              + Kategori
            </button>
            <button onClick={() => { resetMenuForm(); setShowMenuModal(true); }} className="px-3.5 py-2 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl">
              + Menu Baru
            </button>
          </div>
        </div>

        {/* List Menu */}
        {loading ? (
          <div className="p-8 text-xs text-slate-500 text-center">Memuat daftar menu...</div>
        ) : menuItems.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-400">
            Belum ada menu. Klik "+ Menu Baru" untuk menambahkan racikan warkop kamu!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {menuItems.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center text-xl shrink-0">
                    {item.foto_url ? <img src={item.foto_url} alt={item.nama} className="w-full h-full object-cover" /> : '☕'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase">{item.categories?.nama || 'Tanpa Kategori'}</span>
                      {item.label && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                          {item.label}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-white line-clamp-1">{item.nama}</h3>
                    
                    {/* Display Harga Panas & Dingin */}
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs font-black text-amber-400">
                        🔥 Rp {(item.harga_panas || item.harga)?.toLocaleString('id-ID')}
                      </p>
                      {item.harga_dingin && (
                        <p className="text-xs font-black text-cyan-400">
                          🧊 Rp {item.harga_dingin?.toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <button
                    onClick={() => toggleAvailable(item.id, item.tersedia)}
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${item.tersedia ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}
                  >
                    {item.tersedia ? 'Tersedia' : 'Habis'}
                  </button>

                  <div className="flex gap-1.5 text-xs">
                    <button onClick={() => openEditModal(item)} className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg">✏️ Edit</button>
                    <button onClick={() => handleDeleteMenu(item.id)} className="px-2 py-1 bg-rose-950 text-rose-400 rounded-lg">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal Tambah/Edit Menu (Dengan Input Label Badge & Harga) */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveMenu} className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-3xl p-6 space-y-3.5 max-h-[90vh] overflow-y-auto">
            <h2 className="text-sm font-bold text-emerald-400">{editingMenuItem ? '✏️ Edit Menu Warkop' : '➕ Tambah Menu Baru'}</h2>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Menu</label>
              <input type="text" value={namaMenu} onChange={(e) => setNamaMenu(e.target.value)} required placeholder="Contoh: Es Kopi Susu Gula Aren" className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs rounded-xl text-white font-bold" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Kategori</label>
                <select value={selectedCatId} onChange={(e) => setSelectedCatId(e.target.value)} required className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs rounded-xl text-white">
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nama}</option>
                  ))}
                </select>
              </div>

              {/* Input Label Badge Menu */}
              <div>
                <label className="text-[10px] font-bold text-amber-400 uppercase">Label Badge Menu</label>
                <input
                  type="text"
                  placeholder="misal: Best Seller / Terbatas"
                  value={labelMenu}
                  onChange={(e) => setLabelMenu(e.target.value)}
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs rounded-xl text-amber-300 font-bold"
                />
              </div>
            </div>

            {/* Input 2 Harga (Panas & Dingin) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-amber-400 uppercase">🔥 Harga / Harga Panas (Rp) *</label>
                <input type="number" value={hargaMenu} onChange={(e) => setHargaMenu(e.target.value)} required placeholder="15000" className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs rounded-xl text-white font-bold" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-cyan-400 uppercase">🧊 Harga Dingin (Opsional)</label>
                <input type="number" value={hargaDinginMenu} onChange={(e) => setHargaDinginMenu(e.target.value)} placeholder="17000" className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs rounded-xl text-white font-bold" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Deskripsi Ringkas</label>
              <textarea value={deskripsiMenu} onChange={(e) => setDeskripsiMenu(e.target.value)} rows={2} placeholder="Espresso + susu segar + gula aren asli" className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs rounded-xl text-white" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Foto Menu</label>
              <input type="file" accept="image/*" onChange={(e) => setFotoFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-400 file:py-1 file:px-3 file:rounded-xl file:bg-emerald-950 file:text-emerald-300" />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl">
                {submitting ? 'Simpan...' : 'Simpan Menu'}
              </button>
              <button type="button" onClick={() => setShowMenuModal(false)} className="px-4 py-2.5 bg-slate-800 text-xs font-bold rounded-xl">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Tambah Kategori */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveCategory} className="bg-slate-900 border border-slate-800 text-white w-full max-w-sm rounded-3xl p-6 space-y-3.5">
            <h2 className="text-sm font-bold text-amber-400">➕ Tambah Kategori Baru</h2>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Kategori</label>
              <input type="text" value={namaCategory} onChange={(e) => setNamaCategory(e.target.value)} required placeholder="Contoh: Kopi / Non-Kopi / Makanan" className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs rounded-xl text-white font-bold" />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl">Tambah Kategori</button>
              <button type="button" onClick={() => setShowCatModal(false)} className="px-4 py-2.5 bg-slate-800 text-xs font-bold rounded-xl">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* FOOTER BRANDING REYYZTORE */}
      <footer className="text-center py-6 text-[10px] text-slate-400 font-medium border-t border-slate-800 mt-8">
        Powered by <strong className="text-emerald-400">Reyyztore</strong> • Digital POS System
      </footer>
    </div>
  )
}
