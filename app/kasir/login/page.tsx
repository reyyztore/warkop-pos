'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function KasirLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      alert('🎉 Login Kasir Berhasil!')
      router.push('/kasir')
    } catch (err: any) {
      alert(err.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl">
        
        <div className="text-center space-y-1">
          <span className="text-xs font-black tracking-widest text-rose-500 uppercase">REYYZTORE POS</span>
          <h1 className="text-xl font-black text-white">Masuk Kasir Toko</h1>
          <p className="text-xs text-slate-400">Kelola pesanan dan toko warkop Anda</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Email Kasir / Toko</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="kasir@toko.com"
              className="w-full mt-1 p-3 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Kata Sandi</label>
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
            {loading ? 'Memproses...' : 'Masuk Dashboard Kasir ➔'}
          </button>
        </form>

        {/* Tautan Pendaftaran Toko Baru */}
        <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
          <p className="text-xs text-slate-400">
            Belum punya toko?{' '}
            <Link href="/kasir/register" className="font-extrabold text-rose-400 hover:underline">
              Daftar Toko Baru
            </Link>
          </p>
          <p className="text-[10px] text-slate-500">
            <Link href="/" className="hover:underline">← Kembali ke Halaman Utama</Link>
          </p>
        </div>

      </div>
    </div>
  )
}
