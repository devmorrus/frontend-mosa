import {
  Boxes,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  PackageSearch,
  ShoppingBasket,
  Truck,
  Warehouse,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { Permission } from '@/types/auth'

export interface NavItem {
  label: string
  path: string
  icon: ComponentType<{ size?: number; className?: string }>
  /**
   * Permission required to see this item. `undefined` means every
   * authenticated user can see it. The sidebar filters this list against
   * the current user's permissions — no role/menu mapping is hardcoded
   * per-role, so adding a new permission on the backend is enough to
   * reveal the matching menu item.
   */
  permission?: Permission
}

/**
 * Single source of truth for the sidebar. Pages under each path are added
 * in later tasking (Day 3+) — today only Dashboard is a real route, the
 * rest are wired here so the permission-based navigation shell is ready
 * before those pages exist.
 */
export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Supplier', path: '/suppliers', icon: Truck, permission: 'suppliers.view' },
  { label: 'Material', path: '/materials', icon: Boxes, permission: 'materials.view' },
  { label: 'Product', path: '/products', icon: ShoppingBasket, permission: 'products.view' },
  {
    label: 'Goods Receiving',
    path: '/goods-receiving',
    icon: PackageSearch,
    permission: 'goodsreceiving.view',
  },
  { label: 'Inventory', path: '/inventory', icon: Warehouse, permission: 'inventory.view' },
  { label: 'Recipe', path: '/recipes', icon: ClipboardList, permission: 'recipes.view' },
  { label: 'Production', path: '/production', icon: FlaskConical, permission: 'production.view' },
]
