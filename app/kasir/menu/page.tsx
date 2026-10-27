'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function KelolaMenuPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [nama, setNama] = useState('')
  const [harga, setHarga] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [existingFotoUrl, setExistingFotoUrl] = useState('')
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

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `menu/${fileName}`

    await supabase.storage.from('menu-images').upload(filePath, file)
    const { data } = supabase.storage.from('menu-images').getPublicUrl(filePath)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama.trim() || !harga || !categoryId) return

    setSubmitting(true)
    try {
      let finalFotoUrl = existingFotoUrl
      if (imageFile) {
        finalFotoUrl = await uploadImage(imageFile)
      }

      if (editingId) {
        const { error } = await supabase
          .from('menu_items')
          .update({
            nama: nama.trim(),
            harga: parseInt(harga),
            category_id: categoryId,
            deskripsi: deskripsi.trim(),
            foto_url: finalFotoUrl || null,
          })
          .eq('id', editingId)

        if (error) throw error
        alert('Menu berhasil diperbarui!')
      } else {
        const { error } = await supabase.from('menu_items').insert({
          nama: nama.trim(),
          harga: parseInt(harga),
          category_id: categoryId,
          deskripsi: deskripsi.trim(),
          foto_url: finalFotoUrl || null,
          tersedia: true,
        })

        if (error) throw error
        alert('Menu berhasil ditambahkan!')
      }

      resetForm()
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan menu.')
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (item: any) => {
    setEditingId(item.id)
    setNama(item.nama)
    setHarga(item.harga.toString())
    setCategoryId(item.category_id)
    setDeskripsi(item.deskripsi || '')
    setExistingFotoUrl(item.foto_url || '')
  }

  const resetForm = () => {
    setEditingId(null)
    setNama('')
    setHarga('')
    setDeskripsi('')
    setImageFile(null)
    setExistingFotoUrl('')
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans pb-16">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-rose-900/30">
          <h1 className="text-xl font-bold text-rose-300">🌸 Kelola & Edit Menu Kasir</h1>
          <Link href="/kasir" className="text-xs bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-slate-300">
            ← Kembali ke Dashboard
          </Link>
        </div>

        <div className="bg-slate-900/80 border border-rose-900/30 p-5 rounded-3xl space-y-4">
          <h2 className="text-sm font-bold text-rose-300">{editingId ? '✏️ Edit Menu' : '➕ Tambah Menu Baru'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama Menu" required className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
              <input type="number" value={harga} onChange={(e) => setHarga(e.target.value)} placeholder="Harga (Rp)" required className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white">
                {categories.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Upload Foto Produk</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:bg-rose-950 file:text-rose-300" />
              </div>
            </div>

            <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Deskripsi singkat..." className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white h-20" />

            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-slate-950 font-black text-xs rounded-xl">
                {submitting ? 'Memproses...' : editingId ? 'Simpan Perubahan' : 'Tambah Menu'}
              </button>
              {editingId && <button type="button" onClick={resetForm} className="px-4 py-2.5 bg-slate-800 text-xs font-bold rounded-xl">Batal</button>}
            </div>
          </form>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl">
          <h2 className="text-sm font-bold text-slate-300 mb-3">Daftar Menu Aktif</h2>
          {loading ? <p className="text-xs text-slate-500">Memuat menu...</p> : menuItems.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between border-b border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-950 overflow-hidden border border-slate-800 shrink-0">
                  {item.foto_url ? <img src={item.foto_url} alt={item.nama} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">☕</div>}
                </div>
                <div>
                  <p className="font-bold text-white">{item.nama}</p>
                  <p className="text-slate-400">Rp {item.harga?.toLocaleString('id-ID')} • {item.categories?.nama}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(item)} className="px-3 py-1 bg-purple-950 text-purple-300 border border-purple-800 rounded-xl font-bold text-[10px]">✏️ Edit</button>
                <button onClick={() => toggleStok(item.id, item.tersedia)} className={`px-3 py-1 rounded-xl font-bold text-[10px] ${item.tersedia ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
                  {item.tersedia ? 'Tersedia' : 'Habis'}
                </button>
                <button onClick={() => deleteMenu(item.id)} className="p-1.5 bg-slate-800 text-slate-400 hover:text-red-400 rounded-xl">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
