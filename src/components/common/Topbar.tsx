import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/stores/uiStore'

export function Topbar() {
  const toggleMobileSidebar = useUiStore((state) => state.toggleMobileSidebar)
  const { user, logout } = useAuth()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <button
        type="button"
        onClick={toggleMobileSidebar}
        aria-label="Buka menu"
        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <p className="text-sm font-medium text-slate-900">{user?.name ?? '—'}</p>
          <p className="text-xs text-slate-500">{user?.roles.join(', ') ?? ''}</p>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          aria-label="Keluar"
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
