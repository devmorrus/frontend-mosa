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
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              ].join(' ')
            }
          >
            <Icon size={18} />
            {item.label}
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

  return (
    <>
      {/* Desktop / tablet: persistent column */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:block">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
          <div className="h-2.5 w-2.5 rounded-full bg-teal-600" />
          <span className="text-sm font-semibold tracking-wide text-slate-900">MOSA</span>
        </div>
        <SidebarContent />
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
          className={`absolute inset-y-0 left-0 w-72 max-w-[80vw] bg-white shadow-xl transition-transform ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-teal-600" />
              <span className="text-sm font-semibold tracking-wide text-slate-900">MOSA</span>
            </div>
            <button
              type="button"
              onClick={closeMobileSidebar}
              aria-label="Tutup menu"
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
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
