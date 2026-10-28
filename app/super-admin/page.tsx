'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SuperAdminDashboard() {
  const supabase = createClient()

  const [session, setSession] = useState<any>(null)
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    setLoading(true)
    const { data: { session: activeSession } } = await supabase.auth.getSession()
    if (!activeSession) {
      setAuthorized(false)
      setLoading(false)
      return
    }

    setSession(activeSession)

    // Khusus Email Raihan Aji Saputra (sraihanaji@gmail.com)
    if (activeSession.user.email?.toLowerCase() === 'sraihanaji@gmail.com') {
      setAuthorized(true)
      fetchAllStores()
    } else {
      setAuthorized(false)
    }
    setLoading(false)
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

    alert(`✅ Langganan toko berhasil diperpanjang ${additionalDays} hari!`)
    fetchAllStores()
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-xs font-bold">Memuat Super Admin Reyyztore...</div>
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm text-center space-y-3">
          <span className="text-3xl">🔒</span>
          <h1 className="text-base font-black text-rose-500">Akses Ditolak (Khusus Raihan)</h1>
          <p className="text-xs text-slate-400">Halaman Super Admin ini hanya dapat diakses oleh e-mail **sraihanaji@gmail.com**.</p>
          <Link href="/" className="inline-block px-4 py-2 bg-slate-800 text-xs font-bold rounded-xl text-slate-300">
            Kembali ke Landing Page
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans pb-20">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-black tracking-wider text-rose-500 uppercase">SUPER ADMIN REYYZTORE</span>
            <h1 className="text-2xl font-black text-white">Panel Pengelola Semua Toko</h1>
            <p className="text-xs text-slate-400">Owner: Raihan Aji Saputra ({session?.user?.email})</p>
          </div>
          <button onClick={fetchAllStores} className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl">
            🔄 Refresh Data Toko
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stores.length === 0 ? (
            <div className="col-span-2 p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
              Belum ada toko yang mendaftar.
            </div>
          ) : (
            stores.map((st) => (
              <div key={st.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-white text-base">{st.store_name}</h3>
                    <p className="text-xs text-rose-400 font-bold">Slug: /st/{st.slug}</p>
                    <p className="text-[10px] text-slate-500">Dibuat: {new Date(st.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                  <button
                    onClick={() => toggleStoreStatus(st.id, st.is_open)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold ${st.is_open ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}
                  >
                    {st.is_open ? '● Buka' : '○ Tutup'}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Status Langganan:</span>
                    <span className="font-bold text-amber-400">
                      {st.expired_at ? new Date(st.expired_at).toLocaleDateString('id-ID') : 'Aktif Selamanya'}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => updateSubscriptionDays(st.id, 30)}
                      className="flex-1 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800/80 text-[10px] font-bold rounded-xl"
                    >
                      +30 Hari
                    </button>
                    <button
                      onClick={() => updateSubscriptionDays(st.id, 365)}
                      className="flex-1 py-1.5 bg-blue-950 text-blue-300 border border-blue-800/80 text-[10px] font-bold rounded-xl"
                    >
                      +1 Tahun
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
