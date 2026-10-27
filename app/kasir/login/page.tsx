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
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900 text-white">
      <div className="w-full max-w-sm bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div className="text-center mb-6">
          <span className="text-4xl">🔑</span>
          <h1 className="text-xl font-bold mt-2">Portal Kasir</h1>
          <p className="text-xs text-slate-400 mt-1">Masuk untuk mengelola pesanan & toko</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Kasir</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kasir@warkop.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-emerald-900/50 disabled:opacity-50"
          >
            {loading ? 'Memverifikasi...' : 'Masuk Dashboard Kasir'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-slate-400 hover:text-white">
            ← Kembali ke Tampilan Pelanggan
          </a>
        </div>
      </div>
    </div>
  )
}
