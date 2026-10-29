'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CustomerRegisterPage({ params }: { params: { slug: string } }) {
  const storeSlug = params.slug
  const supabase = createClient()

  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama || !email || !password) return

    setLoading(true)
    try {
      // 1. Ambil ID toko berdasarkan slug
      const { data: storeData, error: storeErr } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', storeSlug)
        .single()

      if (storeErr || !storeData) {
        alert('❌ Toko tidak ditemukan!')
        setLoading(false)
        return
      }

      // 🔒 Format Email Terisolasi Khusus Toko Ini
      const tenantEmail = `${storeSlug.toLowerCase()}_${email.trim().toLowerCase()}`

      // 2. Mendaftar di Supabase Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: tenantEmail,
        password: password,
        options: {
          data: {
            full_name: nama,
            real_email: email.trim(),
            phone: phone,
            store_id: storeData.id,
            store_slug: storeSlug,
          },
        },
      })

      if (authErr) {
        alert(`❌ Gagal Mendaftar: ${authErr.message}`)
        setLoading(false)
        return
      }

      // 3. Simpan Profil Pelanggan
      if (authData.user) {
        await supabase.from('profiles').insert({
          id: authData.user.id,
          full_name: nama,
          phone: phone,
          store_id: storeData.id,
        })
      }

      alert('✅ Akun khusus toko ini berhasil dibuat!')
      window.location.href = `/st/${storeSlug}/login`
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-black text-amber-400">📝 Daftar Akun Pelanggan</h1>
          <p className="text-xs text-slate-400">Buat akun baru khusus untuk bertransaksi di toko ini.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</label>
            <input
              type="text"
              required
              placeholder="Nama kamu"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs rounded-xl text-white font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Email</label>
            <input
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs rounded-xl text-white font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">No. WhatsApp / HP</label>
            <input
              type="tel"
              placeholder="081234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs rounded-xl text-white font-bold"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Kata Sandi</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 text-xs rounded-xl text-white font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition mt-2"
          >
            {loading ? 'Mendaftarkan...' : 'Daftar Akun'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          Sudah punya akun di toko ini?{' '}
          <Link href={`/st/${storeSlug}/login`} className="text-amber-400 font-bold hover:underline">
            Masuk
          </Link>
        </div>
      </div>
    </div>
  )
}
