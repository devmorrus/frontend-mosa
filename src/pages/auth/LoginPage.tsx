import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { ApiError } from '@/types/api'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard'
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      await login({ email, password })
      const redirectTo = (location.state as { from?: { pathname?: string } })?.from?.pathname
      navigate(redirectTo ?? '/dashboard', { replace: true })
    } catch (error) {
      const apiError = error as ApiError
      setFieldErrors(apiError.errors ?? {})
      setFormError(apiError.errors ? null : apiError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-2 lg:hidden">
        <div className="h-2.5 w-2.5 rounded-full bg-signal" />
        <span className="font-display text-sm font-semibold tracking-[0.22em] text-ink">MOSA</span>
      </div>

      <div className="py-4 sm:py-6">
        <div className="inline-flex items-center rounded-full border border-ink/10 bg-ink/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/70">
          Portal Operasional MOSA
        </div>

        <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-ink">
          Masuk ke akun Anda
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Gunakan email atau username yang terdaftar untuk mengakses alur kerja produksi dan
          distribusi MOSA.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-paper px-4 py-3 text-sm text-slate-600">
          Akses aman untuk tim internal. Pastikan email dan kata sandi Anda sesuai dengan akun
          yang terdaftar.
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-ink">
              Email atau username
            </label>
            <div className="group relative">
              <Mail
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-ink"
              />
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com atau superadmin"
                className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-sm text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition-all placeholder:text-slate-400 focus:border-ink focus:ring-4 focus:ring-ink/10"
              />
            </div>
            {fieldErrors.email?.map((message) => (
              <p key={message} className="mt-1.5 text-xs text-red-600">
                {message}
              </p>
            ))}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-ink">
              Kata sandi
            </label>
            <div className="group relative">
              <Lock
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-ink"
              />
              <input
                id="password"
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 pr-12 text-sm text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] outline-none transition-all placeholder:text-slate-400 focus:border-ink focus:ring-4 focus:ring-ink/10"
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible((v) => !v)}
                aria-label={isPasswordVisible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-ink"
              >
                {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password?.map((message) => (
              <p key={message} className="mt-1.5 text-xs text-red-600">
                {message}
              </p>
            ))}
          </div>

          {formError && (
            <p
              role="alert"
              className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-2xl bg-ink px-4 py-3.5 text-sm font-semibold text-paper shadow-[0_14px_32px_rgba(18,48,46,0.22)] transition-all hover:bg-ink-light hover:shadow-[0_18px_36px_rgba(18,48,46,0.26)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Memproses...' : 'Masuk ke dashboard'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Dengan masuk, Anda melanjutkan ke sistem operasional internal MOSA.
        </p>
      </div>
    </div>
  )
}
