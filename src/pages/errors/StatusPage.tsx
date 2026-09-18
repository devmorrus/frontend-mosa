import { Link } from 'react-router-dom'
import { resolveHomeRoute } from '@/routes/homeRoute'
import { useAuthStore } from '@/stores/authStore'

interface StatusPageProps {
  code: string
  title: string
  description: string
}

export function StatusPage({ code, title, description }: StatusPageProps) {
  // Send the user somewhere they may actually open: their role home when
  // logged in (never back into the same guarded page), /login otherwise.
  const user = useAuthStore((state) => state.user)
  const sidebarItems = useAuthStore((state) => state.sidebarItems)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const target = isAuthenticated ? resolveHomeRoute(user, sidebarItems) : '/login'

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-2 bg-slate-50 px-6 text-center">
      <span className="text-sm font-semibold tracking-widest text-blue-600">{code}</span>
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
      <Link
        to={target}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Kembali ke halaman utama
      </Link>
    </div>
  )
}
