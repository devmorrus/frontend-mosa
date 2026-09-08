import {
  ArrowLeftRight,
  Boxes,
  Building2,
  ChartNoAxesColumn,
  ClipboardCheck,
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

/**
 * @deprecated Tasking 4: semua route utama sudah terdaftar di AppRoutes.
 * Daftar ini dipertahankan kosong agar tidak ada route placeholder paralel.
 */
export const placeholderRoutes: PlaceholderRoute[] = []

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
  'stock-opname': ClipboardCheck,
  'stock-adjustments': ScanSearch,
  production: Factory,
  'production-orders': Factory,
  'operator-production': Factory,
  'quality-control': ShieldCheck,
  'quality-control-queue': ShieldCheck,
  recipes: Factory,
  traceability: Waypoints,
  'traceability-search': Waypoints,
  reports: ChartNoAxesColumn,
  'reports-raw-material-stock': ChartNoAxesColumn,
  'reports-lot-inventory': ChartNoAxesColumn,
  'reports-goods-receiving': ChartNoAxesColumn,
  'reports-material-consumption': ChartNoAxesColumn,
  'reports-production': ChartNoAxesColumn,
  'reports-target-vs-actual': ChartNoAxesColumn,
  'reports-qc': ChartNoAxesColumn,
  'reports-traceability': ChartNoAxesColumn,
  'reports-yield': ChartNoAxesColumn,
  'reports-stock-control': ChartNoAxesColumn,
  administration: ShieldEllipsis,
  'audit-trail': ShieldEllipsis,
  users: Users,
  roles: ShieldCheck,
  menus: MenuSquare,
}

export function getSidebarIcon(code: string) {
  return sidebarIconMap[code] ?? ScanSearch
}
