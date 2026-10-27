'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EntryPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [nama, setNama] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (isRegister) {
        // --- PROSES DAFTAR AKUN BARU ---
        if (!nama.trim() || !phone.trim() || !email || !password) {
          throw new Error('Semua kolom wajib diisi!')
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: nama.trim(),
              phone: phone.trim(),
              role: 'customer',
            },
          },
        })

        if (error) throw error

        localStorage.setItem('customer_name', nama.trim())
        localStorage.setItem('customer_phone', phone.trim())

        if (data.session) {
          router.push('/meja')
        } else {
          setSuccessMsg('Pendaftaran berhasil! Silakan masuk dengan email dan password kamu.')
          setIsRegister(false)
          setPassword('')
        }
      } else {
        // --- PROSES MASUK (LOGIN) ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        const userNama = data.user?.user_metadata?.full_name || email.split('@')[0]
        const userPhone = data.user?.user_metadata?.phone || ''

        localStorage.setItem('customer_name', userNama)
        localStorage.setItem('customer_phone', userPhone)

        router.push('/meja')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 bg-slate-50">
      <div className="flex-1 flex flex-col justify-center items-center max-w-sm mx-auto w-full my-auto">
        {/* Logo Warkop */}
        <div className="w-20 h-20 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-200 mb-4">
          ☕
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Warung Kopi Kita</h1>
        <p className="text-slate-500 text-sm mt-1 mb-6 text-center">
          {isRegister ? 'Buat akun untuk mulai memesan' : 'Masuk ke akun pelanggan kamu'}
        </p>

        {/* Tab Switcher (Masuk / Daftar) */}
        <div className="w-full bg-slate-200 p-1 rounded-xl flex mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false)
              setErrorMsg('')
              setSuccessMsg('')
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              !isRegister ? 'bg-white text-emerald-600 shadow' : 'text-slate-600'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true)
              setErrorMsg('')
              setSuccessMsg('')
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              isRegister ? 'bg-white text-emerald-600 shadow' : 'text-slate-600'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Notifikasi Pesan */}
        {errorMsg && (
          <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="w-full mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl">
            {successMsg}
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleAuth} className="w-full space-y-3">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Raihan"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor WhatsApp / HP</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-100 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : isRegister ? 'Daftar Sekarang' : 'Masuk Aplikasi'}
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-slate-400 mt-6">
        <a href="/kasir/login" className="hover:underline font-medium text-slate-500">
          Akses Portal Kasir →
        </a>
      </div>
    </div>
  )
}
