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
          setSuccessMsg('Pendaftaran berhasil! Silakan masuk dengan email & password.')
          setIsRegister(false)
          setPassword('')
        }
      } else {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex-1 flex flex-col justify-center items-center max-w-sm mx-auto w-full my-auto z-10">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-emerald-950/50 mb-4 animate-bounce duration-1000">
          ☕
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Warung Kopi Kita</h1>
        <p className="text-slate-400 text-xs mt-1 mb-6 text-center font-medium">
          {isRegister ? 'Buat akun pelanggan baru' : 'Masuk untuk mulai memesan'}
        </p>

        <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-5 rounded-3xl shadow-2xl">
          <div className="w-full bg-slate-950 p-1 rounded-2xl flex mb-5 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false)
                setErrorMsg('')
                setSuccessMsg('')
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 ${
                !isRegister ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
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
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 ${
                isRegister ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              Daftar Akun
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-3">
            {isRegister && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Raihan"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kata Sandi</label>
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
              className="w-full py-3 mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : isRegister ? 'Daftar Sekarang →' : 'Masuk Aplikasi →'}
            </button>
          </form>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 z-10">
        <a href="/kasir/login" className="hover:text-emerald-400 transition-colors font-medium">
          Portal Kasir Warkop →
        </a>
      </div>
    </div>
  )
}
