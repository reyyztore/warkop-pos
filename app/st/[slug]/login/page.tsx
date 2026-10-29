'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CustomerLoginPage({ params }: { params: { slug: string } }) {
  const storeSlug = params.slug
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    try {
      // 🔒 Format Email Terisolasi Khusus Toko Ini
      const tenantEmail = `${storeSlug.toLowerCase()}_${email.trim().toLowerCase()}`

      const { data, error } = await supabase.auth.signInWithPassword({
        email: tenantEmail,
        password: password,
      })

      if (error) {
        alert('❌ Email atau password salah untuk toko ini!')
        setLoading(false)
        return
      }

      alert('✅ Login berhasil!')
      window.location.href = `/st/${storeSlug}`
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
          <h1 className="text-xl font-black text-emerald-400">🔑 Masuk Akun Pelanggan</h1>
          <p className="text-xs text-slate-400">Masuk untuk memesan & kumpulkan stamp loyalty toko ini.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
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
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition mt-2"
          >
            {loading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          Belum punya akun di toko ini?{' '}
          <Link href={`/st/${storeSlug}/register`} className="text-emerald-400 font-bold hover:underline">
            Daftar Baru
          </Link>
        </div>
      </div>
    </div>
  )
}
