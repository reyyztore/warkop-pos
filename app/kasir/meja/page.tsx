'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function KasirMejaPage() {
  const supabase = createClient()

  const [storeId, setStoreId] = useState<string | null>(null)
  const [storeSlug, setStoreSlug] = useState<string>('')
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [nomorMejaBaru, setNomorMejaBaru] = useState('')

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('store_id, stores(slug)')
      .eq('id', session.user.id)
      .single()

    if (profile?.store_id) {
      setStoreId(profile.store_id)
      const rawStore: any = profile.stores
      const slugVal = Array.isArray(rawStore) ? rawStore[0]?.slug : rawStore?.slug
      setStoreSlug(slugVal || '')
      fetchTables(profile.store_id)
    } else {
      setLoading(false)
    }
  }

  const fetchTables = async (targetStoreId: string) => {
    setLoading(true)
    const { data } = await supabase.from('tables').select('*').eq('store_id', targetStoreId).order('nomor')
    if (data) setTables(data)
    setLoading(false)
  }

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId || !nomorMejaBaru) return

    const num = parseInt(nomorMejaBaru)
    const exists = tables.some((t) => t.nomor === num)
    if (exists) {
      alert(`Meja #${num} sudah ada di toko kamu!`)
      return
    }

    await supabase.from('tables').insert({
      store_id: storeId,
      nomor: num,
      aktif: true,
    })

    setNomorMejaBaru('')
    fetchTables(storeId)
    alert(`✅ Meja #${num} berhasil ditambahkan!`)
  }

  const toggleTableActive = async (id: string, currentStatus: boolean) => {
    if (!storeId) return
    await supabase.from('tables').update({ aktif: !currentStatus }).eq('id', id)
    fetchTables(storeId)
  }

  const handleDeleteTable = async (id: string, nomor: number) => {
    if (!storeId || !confirm(`Yakin hapus Meja #${nomor}?`)) return
    await supabase.from('tables').delete().eq('id', id)
    fetchTables(storeId)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans pb-16">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <Link href="/kasir" className="text-xs text-emerald-400 font-bold hover:underline">← Kembali ke Dasbor</Link>
            <h1 className="text-xl font-black text-white mt-1">🪑 Kelola Meja & QR Pemesanan Toko</h1>
          </div>
        </div>

        <form onSubmit={handleAddTable} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex gap-2 items-center">
          <input
            type="number"
            value={nomorMejaBaru}
            onChange={(e) => setNomorMejaBaru(e.target.value)}
            placeholder="Masukkan Nomor Meja Baru (misal: 1, 2, 3)"
            required
            className="flex-1 p-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl font-bold focus:outline-none"
          />
          <button type="submit" className="px-4 py-2.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl">
            + Tambah Meja
          </button>
        </form>

        {loading ? (
          <div className="p-8 text-xs text-slate-500 text-center">Memuat meja toko kamu...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {tables.map((t) => {
              const tableLink = typeof window !== 'undefined' ? `${window.location.origin}/st/${storeSlug}?meja=${t.nomor}` : ''
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(tableLink)}`

              return (
                <div key={t.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-center space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black text-emerald-400">Meja #{t.nomor}</span>
                    <button
                      onClick={() => toggleTableActive(t.id, t.aktif)}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${t.aktif ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}
                    >
                      {t.aktif ? 'Aktif' : 'Non-aktif'}
                    </button>
                  </div>

                  <div className="w-28 h-28 mx-auto bg-white p-1.5 rounded-2xl overflow-hidden border">
                    <img src={qrUrl} alt={`QR Meja ${t.nomor}`} className="w-full h-full object-contain" />
                  </div>

                  <a href={qrUrl} target="_blank" download={`QR_Toko_${storeSlug}_Meja_${t.nomor}.png`} className="block text-[10px] font-bold text-blue-400 hover:underline">
                    📥 Cetak 1 Barcode Meja #{t.nomor}
                  </a>

                  <button onClick={() => handleDeleteTable(t.id, t.nomor)} className="w-full py-1.5 bg-rose-950/60 text-rose-400 text-[10px] font-bold rounded-lg">
                    Hapus Meja
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
