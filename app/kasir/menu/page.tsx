'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function KelolaMenuPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [newCat, setNewCat] = useState('')
  const [nama, setNama] = useState('')
  const [harga, setHarga] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: catData } = await supabase.from('categories').select('*').order('urutan')
    const { data: menuData } = await supabase.from('menu_items').select('*, categories(nama)').order('created_at', { ascending: false })

    if (catData) {
      setCategories(catData)
      if (catData.length > 0 && !categoryId) setCategoryId(catData[0].id)
    }
    if (menuData) setMenuItems(menuData)
    setLoading(false)
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCat.trim()) return
    await supabase.from('categories').insert({ nama: newCat.trim(), urutan: categories.length + 1 })
    setNewCat('')
    fetchData()
  }

  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama.trim() || !harga || !categoryId) return

    setSubmitting(true)
    const { error } = await supabase.from('menu_items').insert({
      nama: nama.trim(),
      harga: parseInt(harga),
      category_id: categoryId,
      deskripsi: deskripsi.trim(),
      foto_url: fotoUrl.trim() || null,
      tersedia: true,
    })

    if (!error) {
      setNama('')
      setHarga('')
      setDeskripsi('')
      setFotoUrl('')
      fetchData()
    } else {
      alert(error.message)
    }
    setSubmitting(false)
  }

  const toggleStok = async (id: string, tersedia: boolean) => {
    await supabase.from('menu_items').update({ tersedia: !tersedia }).eq('id', id)
    fetchData()
  }

  const deleteMenu = async (id: string) => {
    if (confirm('Yakin ingin menghapus menu ini?')) {
      await supabase.from('menu_items').delete().eq('id', id)
      fetchData()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-white p-4">
      <h1 className="text-xl font-bold">☕ Kelola Menu & Kategori</h1>

      {/* Form Tambah Kategori */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <h2 className="text-sm font-semibold mb-2 text-slate-300">Tambah Kategori</h2>
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="Nama Kategori (misal: Kopi, Snack)"
            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          />
          <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-lg">
            + Kategori
          </button>
        </form>
      </div>

      {/* Form Tambah Menu */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
        <h2 className="text-sm font-semibold text-slate-300">Tambah Menu Baru</h2>
        <form onSubmit={handleAddMenu} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama Menu"
              required
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
            <input
              type="number"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              placeholder="Harga (Rp)"
              required
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama}
                </option>
              ))}
            </select>
            <input
              type="url"
              value={fotoUrl}
              onChange={(e) => setFotoUrl(e.target.value)}
              placeholder="URL Foto Produk (opsional)"
              className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Deskripsi singkat..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white h-20"
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs rounded-lg transition"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Menu Baru'}
          </button>
        </form>
      </div>

      {/* Daftar Menu */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <h2 className="text-sm font-semibold mb-3 text-slate-300">Daftar Menu Aktif</h2>
        {loading ? (
          <p className="text-xs text-slate-400">Memuat...</p>
        ) : menuItems.length === 0 ? (
          <p className="text-xs text-slate-500">Belum ada menu tersimpan.</p>
        ) : (
          <div className="divide-y divide-slate-700">
            {menuItems.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{item.nama}</p>
                  <p className="text-slate-400">
                    Rp {item.harga?.toLocaleString('id-ID')} • Kategori: {item.categories?.nama || '-'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStok(item.id, item.tersedia)}
                    className={`px-3 py-1 rounded-lg font-bold text-[10px] ${
                      item.tersedia ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'
                    }`}
                  >
                    {item.tersedia ? 'Tersedia' : 'Habis'}
                  </button>
                  <button
                    onClick={() => deleteMenu(item.id)}
                    className="p-1 bg-slate-700 hover:bg-red-900 text-slate-300 hover:text-red-200 rounded-lg"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
