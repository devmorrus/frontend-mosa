import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/stores/uiStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

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
      <Button
        type="button"
        variant="secondary"
        size="icon"
        onClick={toggleMobileSidebar}
        aria-label="Buka menu"
        className="md:hidden"
      >
        <Menu size={20} />
      </Button>

      <div className="hidden md:block">
        <p className="font-display text-lg font-semibold text-ink">MOSA Workspace</p>
        <p className="text-sm text-slate-500">Fondasi operasional siap untuk pengembangan modul.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right leading-tight sm:block">
          <p className="text-sm font-semibold text-slate-900">{user?.name ?? '—'}</p>
          <p className="text-xs text-slate-500">{user?.roles.join(', ') ?? 'Pengguna'}</p>
        </div>
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <Button
          type="button"
          onClick={() => void logout()}
          aria-label="Keluar"
          variant="secondary"
          size="icon"
          className="text-slate-500 hover:text-slate-900"
        >
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  )
}
