import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/stores/uiStore'

function getInitials(name?: string): string {
  if (!name) return 'MO'

  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
}

export function Topbar() {
  const toggleMobileSidebar = useUiStore((state) => state.toggleMobileSidebar)
  const { user, logout } = useAuth()
  const initials = getInitials(user?.name)

  return (
    <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center justify-between border-b border-slate-200/80 bg-paper/90 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={toggleMobileSidebar}
        aria-label="Buka menu"
        className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 md:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="hidden md:block">
        <p className="font-display text-lg font-semibold text-ink">MOSA Workspace</p>
        <p className="text-sm text-slate-500">Fondasi operasional siap untuk pengembangan modul.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right leading-tight sm:block">
          <p className="text-sm font-semibold text-slate-900">{user?.name ?? '—'}</p>
          <p className="text-xs text-slate-500">{user?.roles.join(', ') ?? 'Pengguna'}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-ink/10 bg-ink text-sm font-semibold text-paper shadow-[0_10px_24px_rgba(18,48,46,0.16)]">
          {initials}
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          aria-label="Keluar"
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
