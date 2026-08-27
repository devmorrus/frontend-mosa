import type { ReactNode } from 'react'
import { PanelLeftClose } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navItems } from '@/routes/navigation.config'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

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
              cn(
                'group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-paper/8 text-paper shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]'
                  : 'text-paper/62 hover:bg-paper/6 hover:text-paper',
              )
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

function SidebarShell({
  children,
  withFooter = true,
}: {
  children: ReactNode
  withFooter?: boolean
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-ink text-paper">
      <div className="relative px-6 py-6">
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

      <Separator className="bg-paper/8" />
      {children}
      {withFooter && (
        <>
          <Separator className="bg-paper/8" />
          <div className="px-6 py-5">
            <div className="rounded-2xl border border-paper/10 bg-paper/6 px-4 py-3 backdrop-blur-sm">
              <div className="text-[11px] uppercase tracking-[0.2em] text-paper/45">
                Focus area
              </div>
              <div className="mt-1 font-display text-lg font-semibold text-paper">
                Quality Control
              </div>
            </div>
          </div>
        </>
      )}
    </div>
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
      <aside className="hidden w-72 shrink-0 border-r border-paper/8 md:block">
        <SidebarShell>
          <SidebarContent />
        </SidebarShell>
      </aside>

      {/* Mobile: off-canvas drawer */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={(open) => !open && closeMobileSidebar()}>
        <SheetContent side="left" className="w-72 border-r border-paper/8 p-0 md:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigasi MOSA</SheetTitle>
          </SheetHeader>
          <SidebarShell withFooter={false}>
            <div className="flex items-center justify-between px-6 pb-2 pt-5">
              <Badge variant="subtle">Navigation</Badge>
              <Button variant="ghost" size="icon" onClick={closeMobileSidebar} aria-label="Tutup menu">
                <PanelLeftClose size={18} />
              </Button>
            </div>
            <SidebarContent />
          </SidebarShell>
        </SheetContent>
      </Sheet>
    </>
  )
}
