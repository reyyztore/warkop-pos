'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterTokoPage() {
  const router = useRouter()
  const supabase = createClient()

  const [storeName, setStoreName] = useState('')
  const [storeSlug, setStoreSlug] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Otomatis buat slug saat menulis nama toko
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!storeName || !storeSlug || !email || !password) {
        throw new Error('Harap lengkapi semua data wajib!')
      }

      // 1. Cek apakah Slug sudah dipakai toko lain
      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', storeSlug)
        .single()

      if (existingStore) {
        throw new Error(`URL/Slug "st/${storeSlug}" sudah digunakan toko lain. Silakan ubah nama slug toko Anda.`)
      }

      // 2. Buat Akun Auth untuk Pemilik/Kasir Toko
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: ownerName || storeName,
            phone,
            role: 'cashier',
          },
        },
      })

      if (authErr) throw authErr
      if (!authData.user) throw new Error('Gagal mendaftarkan akun auth.')

      // 3. Buat Data Toko Baru di Tabel Stores
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

      // 4. Update Profile Kasir dengan store_id Baru
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        store_id: newStore.id,
        store_name: storeName,
        role: 'cashier',
        full_name: ownerName,
        phone,
      })

      alert('🎉 Registrasi Toko Baru Berhasil! Silakan login ke dashboard kasir toko Anda.')
      router.push('/kasir/login')
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat mendaftarkan toko.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 font-sans py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
        
        <div className="text-center space-y-1">
          <span className="text-xs font-black tracking-widest text-rose-500 uppercase">REYYZTORE POS</span>
          <h1 className="text-xl font-black text-white">Daftar Toko Baru</h1>
          <p className="text-xs text-slate-400">Mulai gunakan sistem kasir & QR pemesanan digital</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Toko / Warkop *</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => handleStoreNameChange(e.target.value)}
              required
              placeholder="Warkop Reyyztore Kopi"
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
            <p className="text-[10px] text-slate-500 mt-1">Link pesan pelanggan Anda nantinya: domain.com/st/{storeSlug || 'nama-toko'}</p>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tokobaru@gmail.com"
              className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Kata Sandi *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Mendaftarkan Toko...' : 'Daftarkan Toko Baru Sekarang ➔'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400">
            Sudah punya toko terdaftar?{' '}
            <Link href="/kasir/login" className="font-extrabold text-rose-400 hover:underline">
              Masuk Kasir
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
