'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function KelolaMejaPage() {
  const [tables, setTables] = useState<any[]>([])
  const [nomor, setNomor] = useState('')
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
    if (!nomor) return
    const { error } = await supabase.from('tables').insert({ nomor: parseInt(nomor), aktif: true })

    if (error) {
      alert(error.message)
    } else {
      setNomor('')
      fetchTables()
    }
  }

  const toggleMeja = async (id: string, aktif: boolean) => {
    await supabase.from('tables').update({ aktif: !aktif }).eq('id', id)
    fetchTables()
  }

  const deleteMeja = async (id: string) => {
    if (confirm('Hapus meja ini?')) {
      await supabase.from('tables').delete().eq('id', id)
      fetchTables()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-white p-4">
      <h1 className="text-xl font-bold">🪑 Kelola Nomor Meja</h1>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <form onSubmit={handleAddTable} className="flex gap-2">
          <input
            type="number"
            value={nomor}
            onChange={(e) => setNomor(e.target.value)}
            placeholder="Nomor Meja Baru (misal: 4)"
            required
            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
          />
          <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-lg">
            + Tambah Meja
          </button>
        </form>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
        <h2 className="text-sm font-semibold mb-3 text-slate-300">Daftar Meja Warkop</h2>
        {loading ? (
          <p className="text-xs text-slate-400">Memuat...</p>
        ) : tables.length === 0 ? (
          <p className="text-xs text-slate-500">Belum ada data meja.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {tables.map((tbl) => (
              <div
                key={tbl.id}
                className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex flex-col justify-between space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-emerald-400">Meja #{tbl.nomor}</span>
                  <button onClick={() => deleteMeja(tbl.id)} className="text-xs text-slate-500 hover:text-red-400">
                    ✕
                  </button>
                </div>
                <button
                  onClick={() => toggleMeja(tbl.id, tbl.aktif)}
                  className={`w-full py-1 rounded-lg text-[10px] font-bold ${
                    tbl.aktif ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {tbl.aktif ? '● Aktif' : '○ Nonaktif'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
