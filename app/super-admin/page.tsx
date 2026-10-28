'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
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
      const { data } = await supabase
        .from('super_admin_config')
        .select('pin')
        .eq('id', 1)
        .maybeSingle()

      const correctPin = data?.pin || '123456'

      if (inputPin === correctPin) {
        setIsAuthenticated(true)
        fetchAllStoresWithStats()
      } else {
        alert('PIN Super Admin Tidak Valid!')
        setInputPin('')
      }
    } catch (err: any) {
      alert('Gagal memverifikasi PIN.')
    } finally {
      setPinLoading(false)
    }
  }

  const fetchAllStoresWithStats = async () => {
    setLoading(true)

    const { data: storeList, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert('Gagal mengambil data toko: ' + error.message)
      setLoading(false)
      return
    }

    if (storeList) {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const enrichedStores = await Promise.all(
        storeList.map(async (st) => {
          const { data: todayOrders } = await supabase
            .from('orders')
            .select('total_harga, status')
            .eq('store_id', st.id)
            .gte('created_at', startOfDay.toISOString())

          const totalOmsetToday = todayOrders
            ? todayOrders.reduce((acc, curr) => acc + (curr.total_harga || 0), 0)
            : 0

          const totalOrdersCount = todayOrders ? todayOrders.length : 0

          // Perhitungan Sisa Hari Langganan Presisi
          let daysRemaining = 0
          if (st.expired_at) {
            const now = new Date()
            const expiry = new Date(st.expired_at)
            const diffTime = expiry.getTime() - now.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            daysRemaining = diffDays > 0 ? diffDays : 0
          }

          return {
            ...st,
            totalOmsetToday,
            totalOrdersCount,
            daysRemaining,
          }
        })
      )

      setStores(enrichedStores)
    }

    setLoading(false)
  }

  const toggleStoreStatus = async (storeId: string, currentStatus: boolean) => {
    await supabase.from('stores').update({ is_open: !currentStatus }).eq('id', storeId)
    fetchAllStoresWithStats()
  }

  // LOGIKA PENAMBAHAN MASA AKTIF AKUMULATIF PRESISI
  const updateSubscriptionDays = async (storeId: string, additionalDays: number) => {
    const target = stores.find((s) => s.id === storeId)
    const now = new Date()

    let baseDate = now
    if (target?.expired_at) {
      const currentExpiry = new Date(target.expired_at)
      if (currentExpiry > now) {
        baseDate = currentExpiry
      }
    }

    // Tambahkan hari dari tanggal kadaluarsa terakhir
    const newExpiry = new Date(baseDate.getTime() + additionalDays * 24 * 60 * 60 * 1000)

    const { error } = await supabase
      .from('stores')
      .update({
        expired_at: newExpiry.toISOString(),
      })
      .eq('id', storeId)

    if (error) {
      alert('Gagal memperbarui langganan: ' + error.message)
    } else {
      alert(`Masa langganan toko berhasil ditambah +${additionalDays} hari!`)
      await fetchAllStoresWithStats()
    }
  }

  // LOGIKA HAPUS TOKO PERMANEN
  const handleDeleteStore = async (storeId: string, storeName: string) => {
    const confirmDelete = confirm(`Apakah Anda yakin ingin MENGHAPUS PERMANEN toko "${storeName}"?\n\nSemua data pesanan, menu, dan kategori toko ini akan dihapus permanen!`)
    if (!confirmDelete) return

    setLoading(true)
    try {
      await supabase.from('order_items').delete().eq('order_id', storeId)
      await supabase.from('orders').delete().eq('store_id', storeId)
      await supabase.from('menu_items').delete().eq('store_id', storeId)
      await supabase.from('categories').delete().eq('store_id', storeId)
      await supabase.from('tables').delete().eq('store_id', storeId)

      const { error } = await supabase.from('stores').delete().eq('id', storeId)
      if (error) throw error

      alert(`Toko "${storeName}" beserta seluruh sistemnya berhasil dihapus permanen!`)
      fetchAllStoresWithStats()
    } catch (err: any) {
      alert('Gagal menghapus toko: ' + err.message)
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm bg-white/70 backdrop-blur-xl border border-sky-200/80 p-8 rounded-3xl text-center space-y-5 shadow-xl shadow-sky-100/50">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-100/80 border border-sky-300/50 flex items-center justify-center text-sky-600">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Super Admin <span className="text-red-600">REYYZTORE</span></h1>
            <p className="text-xs text-slate-500 mt-1">Masukkan PIN Rahasia Pengelola</p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <input
              type="password"
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
              required
              maxLength={10}
              placeholder="••••••"
              className="w-full p-3 bg-white/90 border border-sky-200 text-center text-lg tracking-widest font-black text-slate-900 rounded-2xl focus:border-sky-400 focus:outline-none shadow-inner"
            />

            <button
              type="submit"
              disabled={pinLoading}
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-2xl shadow-md shadow-sky-200/80 transition"
            >
              {pinLoading ? 'Memeriksa...' : 'Buka Dashboard'}
            </button>
          </form>

          <p className="text-[10px] text-slate-500">
            <Link href="/" className="hover:underline">Kembali ke Halaman Utama</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8 font-sans pb-20 selection:bg-sky-200">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="bg-white/70 backdrop-blur-xl border border-sky-200/80 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
          <div>
            <span className="text-[10px] font-black tracking-wider text-red-600 uppercase">REYYZTORE SUPER ADMIN</span>
            <h1 className="text-2xl font-black text-slate-900">Panel Informasi Semua Toko</h1>
            <p className="text-xs text-slate-500">Pengelola Utama: Raihan Aji Saputra (sraihanaji@gmail.com)</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchAllStoresWithStats} className="px-4 py-2 bg-white/80 border border-sky-200 text-xs font-bold rounded-xl text-sky-900 hover:bg-sky-50 transition">
              Refresh Data
            </button>
            <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition">
              Keluar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-bold">Memuat data toko & statistik realtime...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stores.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-xs text-slate-500 bg-white/70 rounded-3xl border border-sky-200">
                Belum ada toko terdaftar saat ini.
              </div>
            ) : (
              stores.map((st) => (
                <div key={st.id} className="bg-white/70 backdrop-blur-md border border-sky-200/80 p-6 rounded-3xl space-y-4 shadow-md shadow-sky-100/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">{st.store_name}</h3>
                      <p className="text-xs text-sky-600 font-bold">Link Toko: /st/{st.slug}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => toggleStoreStatus(st.id, st.is_open)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border ${st.is_open ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                      >
                        {st.is_open ? 'Toko Buka' : 'Toko Tutup'}
                      </button>
                      <button
                        onClick={() => handleDeleteStore(st.id, st.store_name)}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold rounded-full transition shadow-sm"
                      >
                        Hapus Toko
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-sky-50/70 border border-sky-100 p-3 rounded-2xl text-left">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Omset Hari Ini</p>
                      <p className="text-sm font-black text-sky-900 mt-0.5">
                        Rp {st.totalOmsetToday?.toLocaleString('id-ID') || '0'}
                      </p>
                    </div>
                    <div className="bg-sky-50/70 border border-sky-100 p-3 rounded-2xl text-left">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Pesanan Hari Ini</p>
                      <p className="text-sm font-black text-sky-900 mt-0.5">
                        {st.totalOrdersCount || 0} Pesanan
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-sky-100 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Sisa Waktu Langganan:</span>
                      <span className={`font-black px-2.5 py-0.5 rounded-full text-[11px] ${st.daysRemaining <= 5 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-sky-100 text-sky-800 border border-sky-200'}`}>
                        {st.daysRemaining > 0 ? `${st.daysRemaining} Hari Tersisa` : 'Expired / Belum Ditambah'}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Tanggal Expired:</span>
                      <span className="font-bold text-slate-700">
                        {st.expired_at ? new Date(st.expired_at).toLocaleDateString('id-ID') : 'Belum Ditentukan'}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => updateSubscriptionDays(st.id, 30)}
                        className="flex-1 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
                      >
                        +1 Bulan (30 Hari)
                      </button>
                      <button
                        onClick={() => updateSubscriptionDays(st.id, 365)}
                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95"
                      >
                        +1 Tahun (365 Hari)
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
