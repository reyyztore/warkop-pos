'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SuperAdminDashboard() {
  const supabase = createClient()

  const [inputPin, setInputPin] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)

  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault()
    setPinLoading(true)

    try {
      // Ambil PIN rahasia dari tabel super_admin_config
      const { data, error } = await supabase
        .from('super_admin_config')
        .select('pin')
        .eq('id', 1)
        .maybeSingle()

      const correctPin = data?.pin || '123456'

      if (inputPin === correctPin) {
        setIsAuthenticated(true)
        fetchAllStores()
      } else {
        alert('❌ PIN Super Admin Salah!')
        setInputPin('')
      }
    } catch (err: any) {
      alert('Gagal memverifikasi PIN.')
    } finally {
      setPinLoading(false)
    }
  }

  const fetchAllStores = async () => {
    setLoading(true)
    const { data } = await supabase.from('stores').select('*').order('created_at', { ascending: false })
    if (data) setStores(data)
    setLoading(false)
  }

  const toggleStoreStatus = async (storeId: string, currentStatus: boolean) => {
    await supabase.from('stores').update({ is_open: !currentStatus }).eq('id', storeId)
    fetchAllStores()
  }

  const updateSubscriptionDays = async (storeId: string, additionalDays: number) => {
    const target = stores.find((s) => s.id === storeId)
    const currentExpiry = target?.expired_at ? new Date(target.expired_at) : new Date()
    const newExpiry = new Date(currentExpiry.getTime() + additionalDays * 24 * 60 * 60 * 1000)

    await supabase.from('stores').update({
      expired_at: newExpiry.toISOString(),
    }).eq('id', storeId)

    alert(`✅ Masa langganan toko berhasil diperpanjang ${additionalDays} hari!`)
    fetchAllStores()
  }

  // TAMPILAN MASUKKAN PIN SUPER ADMIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-950/60 border border-rose-800 flex items-center justify-center text-2xl">
            🔒
          </div>
          <div>
            <h1 className="text-lg font-black text-rose-500">Super Admin Reyyztore</h1>
            <p className="text-xs text-slate-400 mt-1">Masukkan PIN Rahasia untuk mengakses dashboard pengelola</p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <input
              type="password"
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
              required
              maxLength={10}
              placeholder="Masukkan PIN Admin"
              className="w-full p-3 bg-slate-950 border border-slate-800 text-center text-lg tracking-widest font-black text-white rounded-xl focus:border-rose-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={pinLoading}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/20 active:scale-95 transition"
            >
              {pinLoading ? 'Memeriksa PIN...' : 'Buka Panel Super Admin ➔'}
            </button>
          </form>

          <p className="text-[10px] text-slate-500">
            <Link href="/" className="hover:underline">← Kembali ke Halaman Utama</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans pb-20">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-black tracking-wider text-rose-500 uppercase">REYYZTORE SUPER ADMIN</span>
            <h1 className="text-2xl font-black text-white">Kelola Semua Toko & Langganan</h1>
            <p className="text-xs text-slate-400">Founder: Raihan Aji Saputra (sraihanaji@gmail.com)</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchAllStores} className="px-4 py-2 bg-slate-800 text-xs font-bold rounded-xl text-white">
              🔄 Refresh Data
            </button>
            <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 bg-rose-950 text-rose-400 border border-rose-800 text-xs font-bold rounded-xl">
              🚪 Keluar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Memuat data toko...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                Belum ada toko yang terdaftar.
              </div>
            ) : (
              stores.map((st) => (
                <div key={st.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-white text-base">{st.store_name}</h3>
                      <p className="text-xs text-rose-400 font-bold">URL Toko: /st/{st.slug}</p>
                      <p className="text-[10px] text-slate-500">Terdaftar: {new Date(st.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                    <button
                      onClick={() => toggleStoreStatus(st.id, st.is_open)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold ${st.is_open ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}
                    >
                      {st.is_open ? '● Toko Buka' : '○ Toko Tutup'}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Expired Masa Aktif:</span>
                      <span className="font-bold text-amber-400">
                        {st.expired_at ? new Date(st.expired_at).toLocaleDateString('id-ID') : 'Aktif Selamanya'}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => updateSubscriptionDays(st.id, 30)}
                        className="flex-1 py-2 bg-emerald-950 text-emerald-300 border border-emerald-800/80 text-[10px] font-bold rounded-xl"
                      >
                        +30 Hari
                      </button>
                      <button
                        onClick={() => updateSubscriptionDays(st.id, 365)}
                        className="flex-1 py-2 bg-blue-950 text-blue-300 border border-blue-800/80 text-[10px] font-bold rounded-xl"
                      >
                        +1 Tahun
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
