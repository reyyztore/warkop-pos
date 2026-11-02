'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// Bentuk kotak dengan sudut terpotong (chamfer) ala desain glassy
const CHAMFER =
  'polygon(28px 0, calc(100% - 28px) 0, 100% 28px, 100% calc(100% - 28px), calc(100% - 28px) 100%, 28px 100%, 0 calc(100% - 28px), 0 28px)'

const MailIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
)

const LockIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2.5" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)

const EyeIcon = ({ off }: { off: boolean }) => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="m4 4 16 16" />}
  </svg>
)

export default function CustomerLoginPage({ params }: { params: { slug: string } }) {
  const storeSlug = params.slug
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)

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
      {/* Bingkai tipis bergradasi (border glass) */}
      <div
        className="w-full max-w-sm p-px bg-gradient-to-br from-white/40 via-sky-400/10 to-sky-300/30 shadow-[0_20px_60px_-15px_rgba(14,165,233,0.35)]"
        style={{ clipPath: CHAMFER }}
      >
        {/* Kotak kaca */}
        <div
          className="relative overflow-hidden bg-gradient-to-b from-slate-800/60 to-slate-950/70 backdrop-blur-2xl px-6 py-7 space-y-5"
          style={{ clipPath: CHAMFER }}
        >
          {/* Kilau kaca di pojok */}
          <div className="pointer-events-none absolute -top-16 -left-16 w-44 h-44 rounded-full bg-sky-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-16 w-48 h-48 rounded-full bg-sky-500/20 blur-3xl" />

          <div className="relative space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Selamat <span className="text-sky-300">Datang</span>
            </h1>
            <p className="text-xs text-slate-400">
              Masuk untuk memesan & kumpulkan stamp loyalty toko ini.
            </p>
          </div>

          <form onSubmit={handleLogin} className="relative space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300">Email</label>
              <div className="mt-1.5 flex items-center gap-2.5 px-3 h-11 rounded-xl bg-white/5 border border-white/10 text-slate-400 focus-within:border-sky-400/60 focus-within:bg-white/10 focus-within:text-sky-300 transition">
                <MailIcon />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300">Kata Sandi</label>
              <div className="mt-1.5 flex items-center gap-2.5 px-3 h-11 rounded-xl bg-white/5 border border-white/10 text-slate-400 focus-within:border-sky-400/60 focus-within:bg-white/10 focus-within:text-sky-300 transition">
                <LockIcon />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="text-slate-400 hover:text-sky-300 transition"
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-sky-400"
                />
                Ingat saya
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-sky-300 to-sky-500 hover:from-sky-200 hover:to-sky-400 text-slate-950 font-semibold text-sm shadow-[0_8px_24px_-6px_rgba(56,189,248,0.6)] transition disabled:opacity-60"
            >
              {loading ? (
                'Memproses...'
              ) : (
                <>
                  Masuk Sekarang
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="relative text-center pt-4 border-t border-white/10 text-xs text-slate-400">
            Belum punya akun di toko ini?{' '}
            <Link href={`/st/${storeSlug}/register`} className="text-sky-300 font-semibold hover:underline">
              Daftar Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
