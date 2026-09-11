import type { Permission, SidebarItem, User } from '@/types/auth'

/**
 * Home route per role + route-to-permission map.
 *
 * Root cause it fixes: every login (and `/`) used to land on `/dashboard`,
 * so roles without `dashboard.view` (operator, warehouse, QC, ...) instantly
 * fired `GET /api/dashboard/summary` + warehouse lookup and got 403s.
 * The landing page is now derived from what the user may actually open:
 * dashboard when allowed, otherwise the first backend-filtered sidebar path.
 */

export const DASHBOARD_PATH = '/dashboard'
const FALLBACK_PATH = '/403'

interface RoutePermissionEntry {
  prefix: string
  /** `null` = any authenticated user may open it. */
  permission: Permission | null
}

/**
 * Mirrors the `requiredPermission` guards in `AppRoutes.tsx`.
 * Ordered longest-prefix-first so `/production/recipes/create` wins over
 * `/production/recipes`, and detail URLs (`/production/orders/:id`) inherit
 * the list permission via prefix match.
 */
export const ROUTE_PERMISSIONS: RoutePermissionEntry[] = [
  { prefix: '/production/recipes/create', permission: 'recipes.create' },
  { prefix: '/production/recipes/approval-queue', permission: 'recipes.approve' },
  { prefix: '/production/recipes', permission: 'recipes.view' },
  { prefix: '/recipes/create', permission: 'recipes.create' },
  { prefix: '/recipes', permission: 'recipes.view' },
  { prefix: '/production/orders/create', permission: 'production-orders.create' },
  { prefix: '/production/orders', permission: 'production-orders.view' },
  { prefix: '/operator/production', permission: 'production-orders.execute' },
  { prefix: '/production/finished-goods-lots', permission: 'finished-goods-lots.view' },
  { prefix: '/production/deviations', permission: 'production-deviations.view' },
  { prefix: '/warehouse/stock-opname/create', permission: 'stock-opname.create' },
  { prefix: '/warehouse/stock-opname', permission: 'stock-opname.view' },
  { prefix: '/stock-opname', permission: 'stock-opname.view' },
  { prefix: '/warehouse/stock-adjustments/create', permission: 'stock-adjustments.create' },
  { prefix: '/warehouse/stock-adjustments', permission: 'stock-adjustments.view' },
  { prefix: '/stock-adjustments', permission: 'stock-adjustments.view' },
  { prefix: '/quality-control', permission: 'qc.view' },
  { prefix: '/traceability', permission: 'traceability.view' },
  { prefix: '/reports', permission: 'reports.view' },
  { prefix: '/goods-receiving/create', permission: 'receiving.create' },
  { prefix: '/goods-receiving', permission: 'receiving.view' },
  { prefix: '/suppliers', permission: 'suppliers.view' },
  { prefix: '/master/suppliers', permission: 'suppliers.view' },
  { prefix: '/raw-materials', permission: 'materials.view' },
  { prefix: '/master/raw-materials', permission: 'materials.view' },
  { prefix: '/products', permission: 'products.view' },
  { prefix: '/master/products', permission: 'products.view' },
  { prefix: '/units', permission: 'uoms.view' },
  { prefix: '/master/units', permission: 'uoms.view' },
  { prefix: '/warehouses', permission: 'warehouses.view' },
  { prefix: '/master/warehouses', permission: 'warehouses.view' },
  { prefix: '/admin/users', permission: 'users.view' },
  { prefix: '/users', permission: 'users.view' },
  { prefix: '/administration/users', permission: 'users.view' },
  { prefix: '/admin/roles', permission: 'roles.view' },
  { prefix: '/roles', permission: 'roles.view' },
  { prefix: '/administration/roles', permission: 'roles.view' },
  { prefix: '/admin/audit-trail', permission: 'audit.view' },
  { prefix: '/audit-logs', permission: 'audit.view' },
  { prefix: '/menus', permission: 'menus.view' },
  { prefix: '/administration/menus', permission: 'menus.view' },
  { prefix: '/lots', permission: 'lots.view' },
  { prefix: '/inventory', permission: 'inventory.view' },
  { prefix: '/stock-movements', permission: 'stock-movements.view' },
  { prefix: '/dashboard', permission: 'dashboard.view' },
  { prefix: '/help', permission: null },
  { prefix: '/403', permission: null },
]

/** Permission ordered by preferred landing page when dashboard is not allowed. */
const HOME_FALLBACKS: Array<{ path: string; permission: Permission }> = [
  { path: '/operator/production', permission: 'production-orders.execute' },
  { path: '/production/orders', permission: 'production-orders.view' },
  { path: '/quality-control', permission: 'qc.view' },
  { path: '/goods-receiving', permission: 'receiving.view' },
  { path: '/lots', permission: 'lots.view' },
  { path: '/inventory', permission: 'inventory.view' },
  { path: '/stock-movements', permission: 'stock-movements.view' },
  { path: '/warehouse/stock-opname', permission: 'stock-opname.view' },
  { path: '/warehouse/stock-adjustments', permission: 'stock-adjustments.view' },
  { path: '/traceability', permission: 'traceability.view' },
  { path: '/reports', permission: 'reports.view' },
  { path: '/suppliers', permission: 'suppliers.view' },
  { path: '/raw-materials', permission: 'materials.view' },
  { path: '/products', permission: 'products.view' },
  { path: '/units', permission: 'uoms.view' },
  { path: '/warehouses', permission: 'warehouses.view' },
  { path: '/production/recipes', permission: 'recipes.view' },
  { path: '/production/deviations', permission: 'production-deviations.view' },
  { path: '/admin/users', permission: 'users.view' },
  { path: '/admin/roles', permission: 'roles.view' },
  { path: '/admin/audit-trail', permission: 'audit.view' },
  { path: '/menus', permission: 'menus.view' },
]

function findFirstSidebarPath(
  items: readonly SidebarItem[],
  permissions: readonly Permission[],
): string | null {
  const sorted = items.slice().sort((a, b) => a.sortOrder - b.sortOrder)
  for (const item of sorted) {
    // The backend sidebar can contain paths the role may not open (e.g. the
    // Dashboard parent menu has no required permission but the route needs
    // dashboard.view). Never land on a path that would render 403.
    if (item.path && isPathAllowed(item.path, permissions)) return item.path
    const childPath = findFirstSidebarPath(item.children, permissions)
    if (childPath) return childPath
  }
  return null
}

function hasPermission(permissions: readonly Permission[], permission: Permission): boolean {
  return permissions.includes(permission)
}

/**
 * Resolve where an authenticated user should land after login (or on `/`).
 * Order: dashboard when allowed, then the role's preferred working page
 * (operator -> My Production, QC -> QC queue, ...), then the first sidebar
 * path the role may actually open. Returns `/403` when nothing is navigable.
 */
export function resolveHomeRoute(
  user: Pick<User, 'permissions'> | null,
  sidebarItems: readonly SidebarItem[],
): string {
  const permissions = user?.permissions ?? []

  if (hasPermission(permissions, 'dashboard.view')) {
    return DASHBOARD_PATH
  }

  const preferred = HOME_FALLBACKS.find((entry) => hasPermission(permissions, entry.permission))
  if (preferred) {
    return preferred.path
  }

  return findFirstSidebarPath(sidebarItems, permissions) ?? FALLBACK_PATH
}

function matchRouteEntry(pathname: string): RoutePermissionEntry | null {
  let best: RoutePermissionEntry | null = null
  for (const entry of ROUTE_PERMISSIONS) {
    if (pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`)) {
      if (!best || entry.prefix.length > best.prefix.length) {
        best = entry
      }
    }
  }
  return best
}

/**
 * True when `pathname` may be opened with `permissions`.
 * Unknown app paths return true and let the router (placeholder/404) decide,
 * so this helper never blocks a page it does not know about.
 */
export function isPathAllowed(pathname: string, permissions: readonly Permission[]): boolean {
  const entry = matchRouteEntry(pathname)
  if (!entry) return true
  if (entry.permission === null) return true
  return hasPermission(permissions, entry.permission)
}

/**
 * Prune a backend sidebar tree so it never links to a page the role cannot
 * open (such links would land on 403). Items without a path (group headers,
 * SOON placeholders) are kept as-is; an item whose own path is forbidden
 * but which still has allowed children is kept as a non-clickable group.
 */
export function filterSidebarItems(
  items: readonly SidebarItem[],
  permissions: readonly Permission[],
): SidebarItem[] {
  const result: SidebarItem[] = []
  for (const item of items) {
    const children = filterSidebarItems(item.children, permissions)
    if (item.path && !isPathAllowed(item.path, permissions) && children.length === 0) {
      continue
    }
    result.push({
      ...item,
      path: item.path && !isPathAllowed(item.path, permissions) ? null : item.path,
      children,
    })
  }
  return result
}
