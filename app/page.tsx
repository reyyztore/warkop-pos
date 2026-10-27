'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EntryPage() {
  // --- AUTH STATE ---
  const [isRegister, setIsRegister] = useState(false)
  const [nama, setNama] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // --- INTERACTIVE CHARACTER STATE ---
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isHoveringButton, setIsHoveringButton] = useState(false)
  const [badgeText, setBadgeText] = useState('Mengawasimu 👀')
  const [badgeClass, setBadgeClass] = useState('bg-purple-950/80 text-purple-300 border-purple-800')

  // Mouth Shapes State
  const [mouthPurple, setMouthPurple] = useState('M-8 18 Q0 24 8 18')
  const [mouthOrange, setMouthOrange] = useState('M-6 14 Q0 19 6 14')
  const [mouthBlack, setMouthBlack] = useState('M-4 10 Q0 14 4 10')
  const [mouthYellow, setMouthYellow] = useState('M-5 6 Q0 10 5 6')
  const [eyelidOpacity, setEyelidOpacity] = useState('0')

  const svgRef = useRef<SVGSVGElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const router = useRouter()
  const supabase = createClient()

  // --- EYE TRACKING LOGIC ---
  const pupilsData = [
    { id: 'pupil-purple-l', center: { x: 176, y: 185 }, maxR: 6 },
    { id: 'pupil-purple-r', center: { x: 224, y: 185 }, maxR: 6 },
    { id: 'pupil-orange-l', center: { x: 244, y: 255 }, maxR: 5 },
    { id: 'pupil-orange-r', center: { x: 276, y: 255 }, maxR: 5 },
    { id: 'pupil-black-l', center: { x: 336, y: 120 }, maxR: 4 },
    { id: 'pupil-black-r', center: { x: 364, y: 120 }, maxR: 4 },
    { id: 'pupil-yellow-l', center: { x: 98, y: 304 }, maxR: 3.5 },
    { id: 'pupil-yellow-r', center: { x: 122, y: 304 }, maxR: 3.5 },
  ]

  const updatePupils = (targetX: number, targetY: number) => {
    if (isPasswordFocused && !isPasswordVisible) return
    if (!svgRef.current) return

    const rect = svgRef.current.getBoundingClientRect()
    const svgX = ((targetX - rect.left) / rect.width) * 500
    const svgY = ((targetY - rect.top) / rect.height) * 400

    pupilsData.forEach(({ id, center, maxR }) => {
      const el = document.getElementById(id)
      if (!el) return
      const dx = svgX - center.x
      const dy = svgY - center.y
      const angle = Math.atan2(dy, dx)
      const dist = Math.min(maxR, Math.hypot(dx, dy) / 12)

      const px = Math.cos(angle) * dist
      const py = Math.sin(angle) * dist
      el.style.transform = `translate(${px}px, ${py}px)`
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isInputFocused && !isPasswordFocused && !isHoveringButton) {
        updatePupils(e.clientX, e.clientY)
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isInputFocused, isPasswordFocused, isHoveringButton, isPasswordVisible])

  // --- REACTION HANDLERS ---
  const handleInputFocus = (ref: React.RefObject<HTMLInputElement | null>) => {
    setIsInputFocused(true)
    setBadgeText('Memerhatikan input ✍️')
    setBadgeClass('bg-blue-950/80 text-blue-300 border-blue-800')

    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      updatePupils(rect.left + 40, rect.top + rect.height / 2)
    }

    setMouthPurple('M-8 16 Q0 26 8 16')
    setMouthOrange('M-6 13 Q0 22 6 13')
  }

  const handleInputBlur = () => {
    setIsInputFocused(false)
    resetState()
  }

  const handlePasswordFocus = () => {
    setIsPasswordFocused(true)
    if (!isPasswordVisible) {
      coverEyes()
    } else {
      showShockedState()
    }
  }

  const handlePasswordBlur = () => {
    setIsPasswordFocused(false)
    uncoverEyes()
    resetState()
  }

  const coverEyes = () => {
    setBadgeText('Jangan diintip! 🙈')
    setBadgeClass('bg-amber-950/80 text-amber-300 border-amber-800')
    setEyelidOpacity('1')
    setMouthPurple('M-4 18 Q0 16 4 18')
    setMouthOrange('M-4 15 Q0 13 4 15')
  }

  const uncoverEyes = () => {
    setEyelidOpacity('0')
  }

  const showShockedState = () => {
    uncoverEyes()
    setBadgeText('Kelihatan nih! 😲')
    setBadgeClass('bg-rose-950/80 text-rose-300 border-rose-800')
    setMouthPurple('M-6 14 Q0 28 6 14')
    setMouthOrange('M-5 12 Q0 24 5 12')
    setMouthBlack('M-4 8 Q0 18 4 8')
    setMouthYellow('M-4 4 Q0 12 4 4')
  }

  const togglePasswordVisibility = () => {
    const nextState = !isPasswordVisible
    setIsPasswordVisible(nextState)
    if (nextState) {
      showShockedState()
    } else if (isPasswordFocused) {
      coverEyes()
    }
  }

  const handleButtonHover = () => {
    setIsHoveringButton(true)
    if (!isPasswordFocused) {
      setBadgeText('Siap masuk! 🎉')
      setBadgeClass('bg-emerald-950/80 text-emerald-300 border-emerald-800')
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        updatePupils(rect.left + rect.width / 2, rect.top + rect.height / 2)
      }
      setMouthPurple('M-10 16 Q0 28 10 16')
      setMouthOrange('M-8 13 Q0 24 8 13')
    }
  }

  const handleButtonLeave = () => {
    setIsHoveringButton(false)
    if (!isInputFocused && !isPasswordFocused) {
      resetState()
    }
  }

  const resetState = () => {
    setBadgeText('Mengawasimu 👀')
    setBadgeClass('bg-purple-950/80 text-purple-300 border-purple-800')
    setMouthPurple('M-8 18 Q0 24 8 18')
    setMouthOrange('M-6 14 Q0 19 6 14')
    setMouthBlack('M-4 10 Q0 14 4 10')
    setMouthYellow('M-5 6 Q0 10 5 6')
  }

  // --- SUBMIT FORM AUTH ---
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
          setSuccessMsg('Pendaftaran berhasil! Silakan masuk dengan akun kamu.')
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

  const isCovering = isPasswordFocused && !isPasswordVisible
  const isShocked = isPasswordVisible && isPasswordFocused

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-3 sm:p-6 font-sans">
      <style jsx global>{`
        .pupil {
          transition: transform 0.05s ease-out;
        }
        .eyelid {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
          transform-origin: center;
        }
        .character-arm {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: bottom center;
        }
        .character-body {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .mouth {
          transition: d 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(1deg); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-1.5deg); }
        }
        .animate-float-1 { animation: float-slow 4s ease-in-out infinite; }
        .animate-float-2 { animation: float-reverse 4.5s ease-in-out infinite 0.5s; }

        .is-covering .purple-arm-left { transform: translate(22px, -78px) rotate(42deg) scale(1.1); }
        .is-covering .purple-arm-right { transform: translate(-22px, -78px) rotate(-42deg) scale(1.1); }
        .is-covering .orange-hand-left { transform: translate(18px, -42px) rotate(35deg); }
        .is-covering .orange-hand-right { transform: translate(-18px, -42px) rotate(-35deg); }
        .is-covering .black-char { transform: translateY(70px) rotate(-8deg); }

        .is-shocked .pupil { transform: scale(1.4) !important; }
      `}</style>

      {/* Card Utama */}
      <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px] backdrop-blur-xl">
        
        {/* Kolom Kiri: Stage Karakter Interaktif */}
        <div
          className={`lg:col-span-6 bg-slate-950/60 relative p-6 sm:p-8 flex flex-col justify-between items-center overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800 select-none min-h-[320px] lg:min-h-full ${
            isCovering ? 'is-covering' : ''
          } ${isShocked ? 'is-shocked' : ''}`}
        >
          {/* Ambient Glow */}
          <div className="absolute top-10 left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Status Header */}
          <div className="w-full flex justify-between items-center z-10">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Warung Kopi Kita</span>
            </div>
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all duration-300 ${badgeClass}`}>
              {badgeText}
            </span>
          </div>

          {/* Canvas SVG Karakter */}
          <div className="relative w-full max-w-[400px] aspect-[4/3] my-auto flex items-center justify-center">
            <svg ref={svgRef} id="characters-svg" viewBox="0 0 500 400" className="w-full h-full overflow-visible">
              <ellipse cx="250" cy="365" rx="190" ry="14" fill="#0F172A" />

              {/* 1. Karakter Kuning (Kiri Bawah) */}
              <g id="char-yellow" className="character-body animate-float-1" style={{ transformOrigin: '110px 320px' }}>
                <rect x="75" y="275" width="70" height="70" rx="16" transform="rotate(45 110 310)" fill="#FACC15" />
                <g transform="translate(110, 310)">
                  <circle cx="-12" cy="-6" r="7" fill="white" />
                  <circle id="pupil-yellow-l" className="pupil" cx="-12" cy="-6" r="3.5" fill="#1E293B" />
                  <path id="eyelid-yellow-l" className="eyelid" d="M-19 -13 h14 v14 h-14 Z" fill="#FACC15" style={{ opacity: eyelidOpacity }} />
                  <circle cx="12" cy="-6" r="7" fill="white" />
                  <circle id="pupil-yellow-r" className="pupil" cx="12" cy="-6" r="3.5" fill="#1E293B" />
                  <path id="eyelid-yellow-r" className="eyelid" d="M5 -13 h14 v14 h-14 Z" fill="#FACC15" style={{ opacity: eyelidOpacity }} />
                  <path id="mouth-yellow" className="mouth" d={mouthYellow} stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
                </g>
              </g>

              {/* 2. Karakter Hitam (Kanan Belakang) */}
              <g id="char-black" className="character-body animate-float-2" style={{ transformOrigin: '350px 180px' }}>
                <rect className="black-char transition-transform duration-500" x="315" y="70" width="70" height="230" rx="35" fill="#1E293B" />
                <g className="black-char transition-transform duration-500" transform="translate(350, 120)">
                  <circle cx="-14" cy="0" r="10" fill="white" />
                  <circle id="pupil-black-l" className="pupil" cx="-14" cy="0" r="5" fill="#0F172A" />
                  <ellipse id="eyelid-black-l" className="eyelid" cx="-14" cy="0" rx="10.5" ry="10.5" fill="#1E293B" style={{ opacity: eyelidOpacity }} />
                  <circle cx="14" cy="0" r="10" fill="white" />
                  <circle id="pupil-black-r" className="pupil" cx="14" cy="0" r="5" fill="#0F172A" />
                  <ellipse id="eyelid-black-r" className="eyelid" cx="14" cy="0" rx="10.5" ry="10.5" fill="#1E293B" style={{ opacity: eyelidOpacity }} />
                  <path id="mouth-black" className="mouth" d={mouthBlack} stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                </g>
              </g>

              {/* 3. Karakter Ungu Utama (Tengah) */}
              <g id="char-purple" className="character-body animate-float-1" style={{ transformOrigin: '200px 240px' }}>
                <path d="M130 360 V180 A70 70 0 0 1 270 180 V360 Z" fill="#6366F1" />
                <g transform="translate(200, 185)">
                  <circle cx="-24" cy="0" r="14" fill="white" />
                  <circle id="pupil-purple-l" className="pupil" cx="-24" cy="0" r="6.5" fill="#1E1B4B" />
                  <rect id="eyelid-purple-l" className="eyelid" x="-40" y="-16" width="32" height="32" fill="#6366F1" rx="4" style={{ opacity: eyelidOpacity }} />
                  <circle cx="24" cy="0" r="14" fill="white" />
                  <circle id="pupil-purple-r" className="pupil" cx="24" cy="0" r="6.5" fill="#1E1B4B" />
                  <rect id="eyelid-purple-r" className="eyelid" x="8" y="-16" width="32" height="32" fill="#6366F1" rx="4" style={{ opacity: eyelidOpacity }} />
                  <path id="mouth-purple" className="mouth" d={mouthPurple} stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                </g>
                <path className="purple-arm-left character-arm" d="M130 260 C 110 260, 110 210, 130 200" stroke="#4F46E5" strokeWidth="16" strokeLinecap="round" fill="none" />
                <path className="purple-arm-right character-arm" d="M270 260 C 290 260, 290 210, 270 200" stroke="#4F46E5" strokeWidth="16" strokeLinecap="round" fill="none" />
              </g>

              {/* 4. Karakter Oranye (Kanan Depan) */}
              <g id="char-orange" className="character-body animate-float-2" style={{ transformOrigin: '270px 290px' }}>
                <path d="M205 360 V260 A55 55 0 0 1 315 260 V360 Z" fill="#F97316" />
                <g transform="translate(260, 255)">
                  <circle cx="-16" cy="0" r="12" fill="white" />
                  <circle id="pupil-orange-l" className="pupil" cx="-16" cy="0" r="5.5" fill="#431407" />
                  <rect id="eyelid-orange-l" className="eyelid" x="-30" y="-14" width="28" height="28" fill="#F97316" style={{ opacity: eyelidOpacity }} />
                  <circle cx="16" cy="0" r="12" fill="white" />
                  <circle id="pupil-orange-r" className="pupil" cx="16" cy="0" r="5.5" fill="#431407" />
                  <rect id="eyelid-orange-r" className="eyelid" x="2" y="-14" width="28" height="28" fill="#F97316" style={{ opacity: eyelidOpacity }} />
                  <path id="mouth-orange" className="mouth" d={mouthOrange} stroke="#431407" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </g>
                <circle className="orange-hand-left character-arm" cx="215" cy="300" r="12" fill="#EA580C" />
                <circle className="orange-hand-right character-arm" cx="305" cy="300" r="12" fill="#EA580C" />
              </g>
            </svg>
          </div>

          <p className="text-[11px] text-slate-500 font-medium">Sistem Pemesanan Warkop POS Interaktif</p>
        </div>

        {/* Kolom Kanan: Form Login & Register */}
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center bg-slate-900/40">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white tracking-tight">Selamat Datang! ☕</h1>
            <p className="text-slate-400 text-xs mt-1 font-medium">
              {isRegister ? 'Lengkapi data untuk membuat akun baru' : 'Silakan masuk ke akun pelanggan kamu'}
            </p>
          </div>

          {/* Tab Switcher */}
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

          {/* Alert Message */}
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

          {/* Form Auth */}
          <form onSubmit={handleAuth} className="space-y-3.5">
            {isRegister && (
              <>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    ref={nameRef}
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    onFocus={() => handleInputFocus(nameRef)}
                    onBlur={handleInputBlur}
                    placeholder="Contoh: Raihan"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onFocus={() => handleInputFocus(nameRef)}
                    onBlur={handleInputBlur}
                    placeholder="081234567890"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => handleInputFocus(emailRef)}
                onBlur={handleInputBlur}
                placeholder="nama@email.com"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white text-xs"
                >
                  {isPasswordVisible ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              ref={buttonRef}
              type="submit"
              disabled={loading}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              className="w-full py-3 mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : isRegister ? 'Daftar Sekarang →' : 'Masuk Aplikasi →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
