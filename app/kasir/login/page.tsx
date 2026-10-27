'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function KasirLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (!profile || (profile.role !== 'cashier' && profile.role !== 'admin')) {
        await supabase.auth.signOut()
        throw new Error('Akun ini tidak memiliki hak akses sebagai kasir.')
      }

      router.push('/kasir')
    } catch (err: any) {
      setErrorMsg(err.message || 'Login gagal. Periksa email dan password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg shadow-emerald-950/50">
            🔑
          </div>
          <h1 className="text-xl font-black text-white">Portal Kasir</h1>
          <p className="text-xs text-slate-400 mt-1">Masuk untuk mengelola pesanan & toko</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Kasir</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kasir@warkop.com"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? 'Memverifikasi...' : 'Masuk Dashboard Kasir →'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-slate-500 hover:text-white transition-colors">
            ← Kembali ke Tampilan Pelanggan
          </a>
        </div>
      </div>
    </div>
  )
}
