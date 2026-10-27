'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EntryPage() {
  const [nama, setNama] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Login Tamu (Anonymous Sign-In)
  const handleTamuLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama.trim()) {
      setErrorMsg('Silakan isi nama kamu terlebih dahulu.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            full_name: nama.trim(),
            role: 'customer',
          },
        },
      })

      if (error) throw error

      localStorage.setItem('customer_name', nama.trim())
      router.push('/meja')
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk sebagai tamu.')
    } finally {
      setLoading(false)
    }
  }

  // Login dengan Google
  const handleGoogleLogin = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/meja`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal login dengan Google.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 bg-slate-50">
      <div className="flex-1 flex flex-col justify-center items-center text-center my-auto">
        <div className="w-20 h-20 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-200 mb-4">
          ☕
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Warung Kopi Kita</h1>
        <p className="text-slate-500 text-sm mt-1">Pesan kopi favoritmu langsung dari meja!</p>

        {errorMsg && (
          <div className="w-full mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg text-left">
            {errorMsg}
          </div>
        )}

        <div className="w-full mt-8 space-y-4">
          {/* Form Tamu */}
          <form onSubmit={handleTamuLogin} className="space-y-3">
            <div className="text-left">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Lanjut sebagai Tamu
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Masukkan nama kamu..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-100 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-slate-50 px-3 text-xs text-slate-400 font-medium absolute">atau</span>
          </div>

          {/* Tombol Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-100 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Masuk dengan Google
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 mt-6">
        <a href="/kasir/login" className="hover:underline font-medium text-slate-500">
          Akses Portal Kasir →
        </a>
      </div>
    </div>
  )
}
