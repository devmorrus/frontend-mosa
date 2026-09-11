import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { isPathAllowed, resolveHomeRoute } from '@/routes/homeRoute'
import { useAuthStore } from '@/stores/authStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ApiError } from '@/types/api'

export function LoginPage() {
  const { login, isAuthenticated, sidebarItems } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    const user = useAuthStore.getState().user
    const permissions = user?.permissions ?? []
    const requestedPath = (location.state as { from?: Location })?.from?.pathname
    const target =
      requestedPath && isPathAllowed(requestedPath, permissions)
        ? requestedPath
        : resolveHomeRoute(user, sidebarItems)
    return <Navigate to={target} replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      const loggedInUser = await login({ email, password })
      const requestedPath = (location.state as { from?: { pathname?: string } })?.from?.pathname
      const homeRoute = resolveHomeRoute(
        loggedInUser,
        useAuthStore.getState().sidebarItems,
      )
      const target =
        requestedPath && isPathAllowed(requestedPath, loggedInUser.permissions)
          ? requestedPath
          : homeRoute
      navigate(target, { replace: true })
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
        <Badge variant="default" className="px-4 py-1.5">
          Portal Operasional MOSA
        </Badge>

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
              <Input
                id="email"
                type="text"
                autoComplete="username"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com atau superadmin"
                className="pl-12"
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
              <Input
                id="password"
                type={isPasswordVisible ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-12 pr-12"
              />
              <Button
                type="button"
                onClick={() => setIsPasswordVisible((v) => !v)}
                aria-label={isPasswordVisible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 h-9 -translate-y-1/2 px-2 text-slate-400 hover:bg-transparent hover:text-ink"
              >
                {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
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

          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full"
          >
            {isSubmitting ? 'Memproses...' : 'Masuk ke dashboard'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Dengan masuk, Anda melanjutkan ke sistem operasional internal MOSA.
        </p>
      </div>
    </div>
  )
}
