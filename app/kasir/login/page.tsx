'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function KasirLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [isRegister, setIsRegister] = useState(false)

  // Form State Login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Form State Register Toko
  const [storeName, setStoreName] = useState('')
  const [storeSlug, setStoreSlug] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('mode') === 'register') {
      setIsRegister(true)
    }
  }, [searchParams])

  const handleStoreNameChange = (val: string) => {
    setStoreName(val)
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    setStoreSlug(generatedSlug)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })
      if (error) throw error

      alert('🎉 Login Kasir Berhasil!')
      router.push('/kasir')
    } catch (err: any) {
      alert(err.message || 'Gagal masuk. Periksa email dan kata sandi Anda.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!storeName || !storeSlug || !regEmail || !regPassword) {
        throw new Error('Harap isi semua kolom berlabel bintang (*)!')
      }

      // Cek apakah slug toko sudah digunakan
      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', storeSlug)
        .maybeSingle()

      if (existingStore) {
        throw new Error(`URL toko "/st/${storeSlug}" sudah digunakan toko lain. Silakan ganti slug toko!`)
      }

      // 1. Buat Akun Kasir / Owner Baru
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            full_name: ownerName || storeName,
            phone,
            role: 'cashier',
          },
        },
      })

      if (authErr) throw authErr
      if (!authData.user) throw new Error('Gagal membuat akun pengelola toko.')

      // 2. Buat Toko Baru di Supabase
      const { data: newStore, error: storeErr } = await supabase
        .from('stores')
        .insert({
          store_name: storeName,
          slug: storeSlug,
          is_open: true,
          owner_id: authData.user.id,
        })
        .select()
        .single()

      if (storeErr) throw storeErr

      // 3. Update Profil Kasir
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        store_id: newStore.id,
        store_name: storeName,
        role: 'cashier',
        full_name: ownerName,
        phone,
      })

      alert('🎉 Toko Baru Berhasil Didaftarkan! Silakan login ke Dashboard Kasir Anda.')
      setIsRegister(false)
      setLoginEmail(regEmail)
    } catch (err: any) {
      alert(err.message || 'Gagal mendaftarkan toko baru.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 font-sans py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
        
        <div className="text-center space-y-1">
          <span className="text-xs font-black tracking-widest text-rose-500 uppercase">REYYZTORE POS</span>
          <h1 className="text-xl font-black text-white">{isRegister ? 'Daftar Toko Baru' : 'Masuk Kasir Toko'}</h1>
          <p className="text-xs text-slate-400">
            {isRegister ? 'Mulai buat toko & QR pemesanan digital Anda' : 'Kelola pesanan dan operasional toko Anda'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 rounded-xl transition ${!isRegister ? 'bg-rose-600 text-white font-black' : 'text-slate-400'}`}
          >
            Masuk Kasir
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 rounded-xl transition ${isRegister ? 'bg-rose-600 text-white font-black' : 'text-slate-400'}`}
          >
            Daftar Toko Baru
          </button>
        </div>

        {/* FORM LOGIN */}
        {!isRegister ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Email Kasir / Toko</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                placeholder="kasir@toko.com"
                className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Kata Sandi</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:border-rose-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/20 active:scale-95 transition"
            >
              {loading ? 'Memproses...' : 'Masuk Dashboard Kasir ➔'}
            </button>
          </form>
        ) : (
          /* FORM REGISTER TOKO BARU */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Toko / Warkop *</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => handleStoreNameChange(e.target.value)}
                required
                placeholder="Warkop Reyyztore"
                className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">URL Link Toko (/st/slug) *</label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 mt-1">
                <span className="text-xs text-slate-500 font-bold select-none">/st/</span>
                <input
                  type="text"
                  value={storeSlug}
                  onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  required
                  placeholder="warkop-reyyztore"
                  className="w-full p-3 bg-transparent text-xs text-white font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Pemilik Toko</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Raihan"
                className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">No. WhatsApp / HP</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Email Login Kasir *</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                placeholder="owner@warkop.com"
                className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Kata Sandi *</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:border-rose-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/20 active:scale-95 transition"
            >
              {loading ? 'Mendaftarkan Toko...' : 'Daftarkan Toko Sekarang ➔'}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-[10px] text-slate-500">
          <Link href="/" className="hover:underline">← Kembali ke Landing Page Promosi</Link>
        </div>

      </div>
    </div>
  )
}
