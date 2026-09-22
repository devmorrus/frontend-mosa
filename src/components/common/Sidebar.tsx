import { createElement, useEffect, useMemo, useState, type ReactNode } from 'react'
import { BookOpen, ChevronRight, PanelLeftClose } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { filterSidebarItems } from '@/routes/homeRoute'
import { getSidebarIcon } from '@/routes/navigation.config'
import { collapseReportsSidebarItem } from '@/routes/sidebarPresentation'
import { useUiStore } from '@/stores/uiStore'
import type { SidebarItem } from '@/types/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

// ─── Expand/collapse helpers ──────────────────────────────────────────────────

/** True if `item` itself or any descendant matches the current path. */
function subtreeContainsPath(item: SidebarItem, pathname: string): boolean {
  if (item.path === pathname) return true
  return item.children.some((child) => subtreeContainsPath(child, pathname))
}

/** Ids of every group (anywhere in the tree) whose subtree contains `pathname`. */
function collectActiveAncestorIds(items: SidebarItem[], pathname: string): string[] {
  const ids: string[] = []

  function walk(item: SidebarItem) {
    if (item.children.length === 0) return
    if (subtreeContainsPath(item, pathname)) ids.push(item.id)
    item.children.forEach(walk)
  }

  items.forEach(walk)
  return ids
}

// ─── SidebarEntry (recursive) ────────────────────────────────────────────────

function SidebarEntry({
  item,
  level = 0,
  openIds,
  onToggle,
  siblingIds,
}: {
  item: SidebarItem
  level?: number
  openIds: Set<string>
  onToggle: (id: string, siblingIds: string[]) => void
  siblingIds: string[]
}) {
  const closeMobileSidebar = useUiStore((state) => state.closeMobileSidebar)
  const iconComponent = getSidebarIcon(item.code)
  const hasChildren = item.children.length > 0
  const isClickable = Boolean(item.path)
  const isOpen = openIds.has(item.id)
  const childIds = useMemo(() => item.children.map((child) => child.id), [item.children])

  const chevron = hasChildren ? (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onToggle(item.id, siblingIds)
      }}
      aria-expanded={isOpen}
      aria-controls={`sidebar-group-${item.id}`}
      aria-label={isOpen ? `Tutup grup ${item.name}` : `Buka grup ${item.name}`}
      className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-paper/40 transition-colors hover:bg-paper/8 hover:text-paper"
    >
      <ChevronRight
        size={15}
        className={cn('transition-transform duration-200', isOpen && 'rotate-90')}
      />
    </button>
  ) : null

  return (
    <div className="space-y-1">
      {isClickable ? (
        <NavLink
          to={item.path!}
          data-tour={getDataTourAttr(item)}
          onClick={closeMobileSidebar}
          className={({ isActive }) =>
            cn(
              'group relative flex items-center gap-3 rounded-2xl py-3 pr-2 text-sm font-medium transition-all duration-200',
              level > 0 ? 'pl-11 pr-2' : 'px-4',
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
              {createElement(iconComponent, {
                size: 18,
                className: cn(
                  'shrink-0',
                  level > 0 ? 'absolute left-4 top-1/2 -translate-y-1/2' : '',
                  isActive ? 'text-signal' : 'text-paper/60 group-hover:text-paper',
                ),
              })}
              <span className="flex-1">{item.name}</span>
              {chevron}
            </>
          )}
        </NavLink>
      ) : hasChildren ? (
        <button
          type="button"
          onClick={() => onToggle(item.id, siblingIds)}
          aria-expanded={isOpen}
          aria-controls={`sidebar-group-${item.id}`}
          className={cn(
            'group relative flex w-full items-center gap-3 rounded-2xl py-3 text-sm font-medium transition-colors',
            level > 0 ? 'pl-11 pr-2' : 'px-4',
            isOpen ? 'text-paper' : 'text-paper/72 hover:text-paper',
          )}
        >
          {createElement(iconComponent, {
            size: 18,
            className: cn(
              'shrink-0',
              level > 0 ? 'absolute left-4 top-1/2 -translate-y-1/2' : '',
              'text-paper/58 group-hover:text-paper/80',
            ),
          })}
          <span className="flex-1 text-left">{item.name}</span>
          <ChevronRight
            size={15}
            className={cn(
              'shrink-0 text-paper/40 transition-transform duration-200 group-hover:text-paper/70',
              isOpen && 'rotate-90',
            )}
          />
        </button>
      ) : (
        <div
          className={cn(
            'relative flex items-center gap-3 rounded-2xl py-3 text-sm font-medium text-paper/72',
            level > 0 ? 'pl-11 pr-4' : 'px-4',
            'border border-dashed border-paper/10 bg-paper/[0.03]',
          )}
        >
          {createElement(iconComponent, {
            size: 18,
            className: cn(
              'shrink-0 text-paper/58',
              level > 0 ? 'absolute left-4 top-1/2 -translate-y-1/2' : '',
            ),
          })}
          <span className="flex-1">{item.name}</span>
          <Badge variant="subtle">Soon</Badge>
        </div>
      )}

      {hasChildren && (
        <div
          id={`sidebar-group-${item.id}`}
          className={cn(
            'grid transition-all duration-200 ease-in-out',
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className={cn('space-y-1 overflow-hidden', level === 0 ? 'pl-2' : 'pl-4')}>
            {item.children
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((child) => (
                <SidebarEntry
                  key={child.id}
                  item={child}
                  level={level + 1}
                  openIds={openIds}
                  onToggle={onToggle}
                  siblingIds={childIds}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getDataTourAttr(item: SidebarItem): string | undefined {
  if (item.path === '/suppliers' || item.code === 'suppliers') return 'master-suppliers-menu'
  if (item.path === '/goods-receiving' || item.code === 'receiving') return 'receiving-menu'
  if (item.path === '/inventory' || item.code === 'inventory') return 'inventory-menu'
  if (item.path === '/production/recipes' || item.code === 'recipes') return 'recipe-menu'
  if (item.path === '/production/orders' || item.code === 'orders') return 'po-menu'
  if (item.path === '/traceability' || item.code === 'traceability-search') return 'traceability-menu'
  if (item.path === '/reports' || item.code === 'reports') return 'reports-menu'
  if (item.path === '/admin' || item.code === 'administration') return 'admin-menu'
  if (item.path === '/admin/users' || item.code === 'users') return 'users-menu'
  if (item.path === '/admin/roles' || item.code === 'roles') return 'roles-menu'
  if (item.path === '/admin/audit-trail' || item.code === 'audit-trail') return 'audit-menu'
  return undefined
}

// ─── SidebarContent ───────────────────────────────────────────────────────────

function SidebarContent() {
  const { sidebarItems, user } = useAuth()
  const location = useLocation()
  const closeMobileSidebar = useUiStore((state) => state.closeMobileSidebar)

  // Drop links the role may not open (e.g. Dashboard for operator): the
  // backend sidebar can include parent menus without a required permission
  // while the route itself is guarded.
  const visibleItems = useMemo(
    () => collapseReportsSidebarItem(filterSidebarItems(sidebarItems, user?.permissions ?? [])),
    [sidebarItems, user],
  )

  const [openIds, setOpenIds] = useState<Set<string>>(() =>
    new Set(collectActiveAncestorIds(visibleItems, location.pathname)),
  )

  useEffect(() => {
    const activeAncestorIds = collectActiveAncestorIds(visibleItems, location.pathname)
    if (activeAncestorIds.length === 0) return
    setOpenIds((prev) => {
      const next = new Set(prev)
      let changed = false
      activeAncestorIds.forEach((id) => {
        if (!next.has(id)) {
          next.add(id)
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [visibleItems, location.pathname])

  const sortedItems = useMemo(
    () => visibleItems.slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [visibleItems],
  )

  const rootIds = useMemo(() => sortedItems.map((item) => item.id), [sortedItems])

  function toggleGroup(id: string, siblingIds: string[]) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      const wasOpen = next.has(id)

      siblingIds.forEach((siblingId) => {
        if (siblingId !== id) next.delete(siblingId)
      })

      if (wasOpen) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })
  }

  return (
    <nav data-tour="module-nav" className="flex h-full flex-col gap-2 overflow-y-auto px-3 py-4">
      {/* Help & Tutorial Dedicated Link */}
      <NavLink
        to="/help/tutorials"
        data-tour="help-menu"
        onClick={closeMobileSidebar}
        className={({ isActive }) =>
          cn(
            'group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
            isActive
              ? 'bg-signal/20 text-signal shadow-[inset_0_0_0_1px_rgba(255,201,40,0.2)]'
              : 'text-paper/80 hover:bg-paper/8 hover:text-paper',
          )
        }
      >
        <BookOpen size={18} className="shrink-0 text-signal" />
        <span className="flex-1">Tutorial & Panduan</span>
        <Badge variant="subtle" className="bg-signal/20 text-signal text-[10px]">
          Tour
        </Badge>
      </NavLink>

      <Separator className="my-1 bg-paper/8" />

      {sortedItems.map((item) => (
        <SidebarEntry
          key={item.id}
          item={item}
          openIds={openIds}
          onToggle={toggleGroup}
          siblingIds={rootIds}
        />
      ))}

      {visibleItems.length === 0 && (
        <div className="rounded-2xl border border-dashed border-paper/10 px-4 py-4 text-sm text-paper/45">
          Navigasi sedang disiapkan dari server.
        </div>
      )}
    </nav>
  )
}

// ─── Shell + responsive wrapper (unchanged) ──────────────────────────────────

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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,201,40,0.14),transparent_50%)]" />
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

export function Sidebar() {
  const isMobileSidebarOpen = useUiStore((state) => state.isMobileSidebarOpen)
  const closeMobileSidebar = useUiStore((state) => state.closeMobileSidebar)

  return (
    <>
      <aside data-tour="sidebar" className="hidden w-72 shrink-0 border-r border-paper/8 md:block">
        <SidebarShell>
          <SidebarContent />
        </SidebarShell>
      </aside>

      <Sheet open={isMobileSidebarOpen} onOpenChange={(open) => !open && closeMobileSidebar()}>
        <SheetContent side="left" data-tour="sidebar" className="w-72 border-r border-paper/8 p-0 md:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigasi MOSA</SheetTitle>
          </SheetHeader>
          <SidebarShell withFooter={false}>
            <div className="flex items-center justify-between px-6 pb-2 pt-5">
              <Badge variant="subtle">Navigation</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMobileSidebar}
                aria-label="Tutup menu"
              >
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
