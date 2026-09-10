import { HelpCircle, LogOut, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/stores/uiStore'
import { useTutorialStore } from '@/stores/tutorialStore'
import { getAvailableTutorials } from '@/config/tutorials'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

function getInitials(name?: string): string {
  if (!name) return 'MO'

  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
}

/**
 * Explicit contextual mapping (Tasking 5). Returns null when the current
 * route is the Guided Recipe simulation (separate system, no overlay tour).
 * Note: /operator/production maps to guided-production (primary). The
 * material-consumption tutorial shares the same pages — launch it explicitly
 * via Help → Tutorial & Panduan.
 */
export function getPageTutorialId(pathname: string): string | null {
  if (/^\/production\/recipes\/[^/]+\/versions\/[^/]+\/tutorial/.test(pathname)) return null
  if (pathname.startsWith('/dashboard')) return 'dashboard'
  if (pathname.startsWith('/reports')) return 'reporting'
  if (pathname.startsWith('/admin/users')) return 'admin-user-management'
  if (pathname.startsWith('/admin/roles')) return 'admin-roles-permissions'
  if (pathname.startsWith('/admin/audit-trail')) return 'admin-audit-trail'
  if (pathname.startsWith('/operator/production')) return 'guided-production'
  if (pathname.startsWith('/production/deviations')) return 'deviation-approval'
  if (pathname.startsWith('/quality-control')) return 'qc-inspection'
  if (pathname.startsWith('/warehouse/stock-opname')) return 'stock-opname'
  if (pathname.startsWith('/warehouse/stock-adjustments')) return 'stock-adjustment'
  if (pathname.startsWith('/goods-receiving')) return 'goods-receiving'
  if (pathname.startsWith('/suppliers') || pathname.startsWith('/master')) return 'master-data'
  if (pathname.startsWith('/lots')) return 'lot-qr'
  if (pathname.startsWith('/inventory') || pathname.startsWith('/stock-movements')) return 'inventory'
  if (pathname.startsWith('/production/recipes')) return 'recipe-builder'
  if (pathname.startsWith('/production/orders') || pathname.startsWith('/production/finished-goods-lots')) return 'production-order'
  if (pathname.startsWith('/traceability/raw-material')) return 'traceability-forward'
  if (pathname.startsWith('/traceability')) return 'traceability-backward'
  return 'app-intro'
}

export function Topbar() {
  const toggleMobileSidebar = useUiStore((state) => state.toggleMobileSidebar)
  const { user, logout } = useAuth()
  const location = useLocation()
  const startTutorial = useTutorialStore((state) => state.startTutorial)
  const initials = getInitials(user?.name)

  const activePageTutorialId = getPageTutorialId(location.pathname)
  const availableIds = new Set(
    getAvailableTutorials(user?.permissions ?? [], user?.roles ?? []).map((t) => t.id),
  )
  const canStartPageTutorial = activePageTutorialId !== null && availableIds.has(activePageTutorialId)

  function handleStartPageTutorial() {
    if (!canStartPageTutorial || !activePageTutorialId) return
    startTutorial(activePageTutorialId, true)
  }

  return (
    <header className="sticky top-0 z-20 flex h-20 shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 bg-paper/90 px-4 backdrop-blur-sm sm:gap-3 sm:px-6 lg:px-8">
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

      <div className="hidden min-w-0 md:block">
        <p className="truncate font-display text-lg font-semibold text-ink">MOSA Workspace</p>
        <p className="hidden truncate text-sm text-slate-500 lg:block">Fondasi operasional siap untuk pengembangan modul.</p>
      </div>

      <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
        {/* Quick Start Page Tutorial Button — permission-aware, mobile icon-only */}
        {activePageTutorialId !== null ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleStartPageTutorial}
              disabled={!canStartPageTutorial}
              title={canStartPageTutorial ? 'Tutorial Halaman Ini' : 'Tutorial tidak tersedia untuk role Anda'}
              className="hidden sm:flex items-center gap-1.5 bg-signal/10 text-signal hover:bg-signal/20 font-medium text-xs rounded-xl disabled:opacity-40"
            >
              <HelpCircle size={15} />
              <span className="hidden lg:inline">Tutorial Halaman Ini</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={handleStartPageTutorial}
              disabled={!canStartPageTutorial}
              aria-label="Tutorial Halaman Ini"
              title={canStartPageTutorial ? 'Tutorial Halaman Ini' : 'Tutorial tidak tersedia untuk role Anda'}
              className="sm:hidden text-signal disabled:opacity-40"
            >
              <HelpCircle size={18} />
            </Button>
          </>
        ) : null}

        {/* User Profile Container */}
        <div data-tour="user-profile" className="flex min-w-0 items-center gap-2.5">
          <div className="hidden min-w-0 text-right leading-tight sm:block">
            <p className="max-w-[110px] truncate text-sm font-semibold text-slate-900 lg:max-w-[180px]">{user?.name ?? '—'}</p>
            <p className="max-w-[110px] truncate text-xs text-slate-500 lg:max-w-[180px]">{user?.roles.join(', ') ?? 'Pengguna'}</p>
          </div>
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>

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
