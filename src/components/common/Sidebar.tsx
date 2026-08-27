import { X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navItems } from '@/routes/navigation.config'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

function SidebarContent() {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const closeMobileSidebar = useUiStore((state) => state.closeMobileSidebar)

  const visibleItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission),
  )

  return (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto px-3 py-4">
      {visibleItems.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              [
                'group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-paper/8 text-paper shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
                  : 'text-paper/62 hover:bg-paper/6 hover:text-paper',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  aria-hidden
                  className={[
                    'absolute inset-y-2 left-0 w-1 rounded-r-full transition-colors',
                    isActive ? 'bg-signal' : 'bg-transparent group-hover:bg-paper/15',
                  ].join(' ')}
                />
                <Icon
                  size={18}
                  className={isActive ? 'text-signal' : 'text-paper/60 group-hover:text-paper'}
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

/**
 * Sidebar foundation: a fixed column on desktop/tablet (md and up), and an
 * off-canvas drawer with a backdrop on mobile. The item list itself is
 * shared (`SidebarContent`) so both presentations always stay in sync.
 */
export function Sidebar() {
  const isMobileSidebarOpen = useUiStore((state) => state.isMobileSidebarOpen)
  const closeMobileSidebar = useUiStore((state) => state.closeMobileSidebar)

  const sidebarClasses =
    'flex h-full flex-col overflow-hidden border-r border-paper/8 bg-ink text-paper'

  return (
    <>
      {/* Desktop / tablet: persistent column */}
      <aside className={`hidden w-72 shrink-0 md:block ${sidebarClasses}`}>
        <div className="relative border-b border-paper/8 px-6 py-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.14),transparent_50%)]" />
          <div className="relative flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-signal" />
            <span className="font-display text-2xl font-semibold tracking-[0.18em] text-paper">
              MOSA
            </span>
          </div>
          <p className="relative mt-3 max-w-[14rem] text-sm leading-6 text-paper/55">
            Sistem operasional produksi dengan jalur kerja yang lebih jelas dan terukur.
          </p>
        </div>
        <SidebarContent />
        <div className="border-t border-paper/8 px-6 py-5">
          <div className="rounded-2xl border border-paper/10 bg-paper/6 px-4 py-3 backdrop-blur-sm">
            <div className="text-[11px] uppercase tracking-[0.2em] text-paper/45">Focus area</div>
            <div className="mt-1 font-display text-lg font-semibold text-paper">Quality Control</div>
          </div>
        </div>
      </aside>

      {/* Mobile: off-canvas drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${isMobileSidebarOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!isMobileSidebarOpen}
      >
        <div
          onClick={closeMobileSidebar}
          className={`absolute inset-0 bg-slate-900/40 transition-opacity ${
            isMobileSidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 max-w-[80vw] shadow-xl transition-transform ${sidebarClasses} ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="relative flex items-center justify-between border-b border-paper/8 px-5 py-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.14),transparent_50%)]" />
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-signal" />
              <span className="font-display text-lg font-semibold tracking-[0.18em] text-paper">
                MOSA
              </span>
            </div>
            <button
              type="button"
              onClick={closeMobileSidebar}
              aria-label="Tutup menu"
              className="rounded-md p-1.5 text-paper/65 hover:bg-paper/8 hover:text-paper"
            >
              <X size={18} />
            </button>
          </div>
          <SidebarContent />
        </aside>
      </div>
    </>
  )
}
