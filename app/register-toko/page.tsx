'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterTokoPage() {
  const router = useRouter()
  const supabase = createClient()

  const [storeName, setStoreName] = useState('')
  const [slug, setSlug] = useState('')
  const [cashierName, setCashierName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Format slug otomatis (misal: "Warkop Raihan" -> "warkop-raihan")
  const handleStoreNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setStoreName(val)
    setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'))
  }

  const handleRegisterStore = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      if (!storeName.trim() || !slug.trim() || !email || !password) {
        throw new Error('Semua kolom wajib diisi!')
      }

      // 1. Buat Akun Auth untuk Pemilik / Kasir Toko
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: cashierName || storeName,
            role: 'cashier',
          },
        },
      })

      if (authErr) throw authErr
      if (!authData.user) throw new Error('Gagal mendaftarkan pengguna.')

      const userId = authData.user.id

      // 2. Buat Toko Baru di Tabel `stores`
      const { data: storeData, error: storeErr } = await supabase
        .from('stores')
        .insert({
          owner_id: userId,
          slug: slug.trim(),
          store_name: storeName.trim(),
        })
        .select()
        .single()

      if (storeErr) throw storeErr

      // 3. Hubungkan User Ke `store_id` Baru
      await supabase.from('profiles').upsert({
        id: userId,
        full_name: cashierName || storeName,
        role: 'cashier',
        store_id: storeData.id,
        store_name: storeName.trim(),
      })

      // 4. Otomatis Buatkan 5 Meja Standar untuk Toko Baru
      const defaultTables = [1, 2, 3, 4, 5].map((num) => ({
        nomor: num,
        store_id: storeData.id,
        aktif: true,
      }))
      await supabase.from('tables').insert(defaultTables)

      alert('🎉 Toko berhasil dibuat! Silakan masuk ke Dashboard Kasir Kamu.')
      router.push('/kasir/login')
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mendaftarkan toko.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
        <div className="text-center space-y-1">
          <span className="text-3xl">🚀</span>
          <h1 className="text-xl font-black text-white">Buka Sistem Warkop Kamu</h1>
          <p className="text-xs text-slate-400">Daftarkan toko dan mulai terima pesanan digital secara otomatis.</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegisterStore} className="space-y-3.5 text-left">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Warkop / Cafe</label>
            <input
              type="text"
              value={storeName}
              onChange={handleStoreNameChange}
              placeholder="Contoh: Warkop Kopi Kita"
              required
              className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:border-emerald-500 font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">URL Toko (Slug Unik)</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 mt-1 text-xs text-slate-500">
              <span>/st/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                required
                className="w-full p-2.5 bg-transparent text-emerald-400 font-bold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Pemilik / Kasir</label>
            <input
              type="text"
              value={cashierName}
              onChange={(e) => setCashierName(e.target.value)}
              placeholder="Contoh: Budi"
              required
              className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Email Akun Kasir</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="budi@warkop.com"
              required
              className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Kata Sandi Kasir</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            {loading ? 'Menyiapkan Toko Baru...' : 'Daftarkan Toko Sekarang ➔'}
          </button>
        </form>
      </div>
    </div>
  )
}
