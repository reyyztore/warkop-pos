'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function KelolaMejaPage() {
  const [tables, setTables] = useState<any[]>([])
  const [nomorMeja, setNomorMeja] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    setLoading(true)
    const { data } = await supabase.from('tables').select('*').order('nomor')
    if (data) setTables(data)
    setLoading(false)
  }

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nomorMeja) return

    const { error } = await supabase.from('tables').insert({
      nomor: parseInt(nomorMeja),
      aktif: true,
    })

    if (error) alert(error.message)
    else {
      setNomorMeja('')
      fetchTables()
    }
  }

  const toggleStatus = async (id: string, aktif: boolean) => {
    await supabase.from('tables').update({ aktif: !aktif }).eq('id', id)
    fetchTables()
  }

  const deleteTable = async (id: string) => {
    if (confirm('Yakin hapus meja ini?')) {
      await supabase.from('tables').delete().eq('id', id)
      fetchTables()
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans pb-16">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-purple-900/30">
          <h1 className="text-xl font-bold text-purple-300">🪑 Kelola & Tambah No. Meja Kasir</h1>
          <Link href="/kasir" className="text-xs bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-slate-300">
            ← Kembali ke Dashboard
          </Link>
        </div>

        <div className="bg-slate-900/80 border border-purple-900/30 p-5 rounded-3xl">
          <form onSubmit={handleAddTable} className="flex gap-2">
            <input
              type="number"
              value={nomorMeja}
              onChange={(e) => setNomorMeja(e.target.value)}
              placeholder="Nomor Meja Baru (Contoh: 1, 2, 3)"
              required
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
            <button type="submit" className="px-5 py-2.5 bg-purple-500 text-slate-950 font-black text-xs rounded-xl">
              + Tambah Meja
            </button>
          </form>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-3">
          <h2 className="text-sm font-bold text-slate-300">Daftar Meja Warkop</h2>
          {loading ? (
            <p className="text-xs text-slate-500">Memuat meja...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tables.map((t) => (
                <div key={t.id} className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex flex-col justify-between space-y-2">
                  <span className="text-sm font-black text-purple-300">Meja #{t.nomor}</span>
                  <div className="flex gap-1">
                    <button onClick={() => toggleStatus(t.id, t.aktif)} className={`flex-1 py-1 rounded-lg text-[10px] font-bold ${t.aktif ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'}`}>
                      {t.aktif ? 'Aktif' : 'Non-Aktif'}
                    </button>
                    <button onClick={() => deleteTable(t.id)} className="px-2 py-1 bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg text-xs">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
