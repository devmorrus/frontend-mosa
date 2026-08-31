import {
  ArrowLeftRight,
  Boxes,
  Building2,
  ChartNoAxesColumn,
  Factory,
  LayoutDashboard,
  MenuSquare,
  PackageSearch,
  ScanSearch,
  ShieldCheck,
  ShieldEllipsis,
  ShoppingBasket,
  Tags,
  Truck,
  Users,
  Warehouse,
  Waypoints,
  Ruler,
} from 'lucide-react'
import type { ComponentType } from 'react'

export interface PlaceholderRoute {
  title: string
  path: string
  description: string
  permission: string
}

export interface SidebarIconMap {
  [code: string]: ComponentType<{ size?: number; className?: string }>
}

export const placeholderRoutes: PlaceholderRoute[] = [
  {
    title: 'Lots',
    path: '/lots',
    description: 'Foundation route untuk modul Lots sudah siap dan diproteksi permission.',
    permission: 'lots.view',
  },
  {
    title: 'Inventory',
    path: '/inventory',
    description: 'Foundation route untuk modul Inventory sudah siap dan diproteksi permission.',
    permission: 'inventory.view',
  },
  {
    title: 'Stock Movements',
    path: '/stock-movements',
    description:
      'Foundation route untuk modul Stock Movements sudah siap dan diproteksi permission.',
    permission: 'stock-movements.view',
  },
  {
    title: 'Roles',
    path: '/roles',
    description: 'Foundation route untuk modul Roles sudah siap dan diproteksi permission.',
    permission: 'roles.view',
  },
  {
    title: 'Menus',
    path: '/menus',
    description: 'Foundation route untuk modul Menus sudah siap dan diproteksi permission.',
    permission: 'menus.view',
  },
]

export const sidebarIconMap: SidebarIconMap = {
  dashboard: LayoutDashboard,
  'master-data': Boxes,
  suppliers: Truck,
  'raw-materials': Boxes,
  products: ShoppingBasket,
  units: Ruler,
  warehouses: Building2,
  warehouse: Warehouse,
  'goods-receiving': PackageSearch,
  lots: Tags,
  inventory: Warehouse,
  'stock-movements': ArrowLeftRight,
  production: Factory,
  'quality-control': ShieldCheck,
  traceability: Waypoints,
  reports: ChartNoAxesColumn,
  administration: ShieldEllipsis,
  users: Users,
  roles: ShieldCheck,
  menus: MenuSquare,
}

export function getSidebarIcon(code: string) {
  return sidebarIconMap[code] ?? ScanSearch
}
