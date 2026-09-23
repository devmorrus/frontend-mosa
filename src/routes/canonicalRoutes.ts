/**
 * Source of truth untuk route path, label, breadcrumb, dan cross-link (Tasking 4).
 * Jangan hardcode string route di komponen fitur — import dari sini.
 * Mirror dari backend `Mosa.Api/Common/Models/CanonicalRoutes.cs`.
 */

export const canonicalRoutes = {
  dashboard: '/dashboard',
  suppliers: '/suppliers',
  rawMaterials: '/raw-materials',
  products: '/products',
  units: '/units',
  warehouses: '/warehouses',
  goodsReceiving: '/goods-receiving',
  lots: '/lots',
  lotScan: '/lots/scan',
  inventory: '/inventory',
  stockMovements: '/stock-movements',
  stockOpname: '/warehouse/stock-opname',
  stockAdjustments: '/warehouse/stock-adjustments',
  recipes: '/production/recipes',
  productionOrders: '/production/orders',
  operatorProduction: '/operator/production',
  qualityControl: '/quality-control',
  deviations: '/production/deviations',
  traceability: '/traceability',
  reports: '/reports',
  users: '/admin/users',
  roles: '/admin/roles',
  menus: '/menus',
  auditTrail: '/admin/audit-trail',
  help: '/help/tutorials',
} as const

export interface BreadcrumbItem {
  label: string
  to?: string
}

function withQuery(path: string, query?: Record<string, string | number | undefined>): string {
  if (!query) return path
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

export const entityLinks = {
  dashboard: () => canonicalRoutes.dashboard,
  receivingDetail: (id: string) => `${canonicalRoutes.goodsReceiving}/${id}`,
  receivingList: (query?: Record<string, string | number | undefined>) =>
    withQuery(canonicalRoutes.goodsReceiving, query),
  lotDetail: (id: string) => `${canonicalRoutes.lots}/${id}`,
  lotList: (query?: Record<string, string | number | undefined>) =>
    withQuery(canonicalRoutes.lots, query),
  lotScan: () => canonicalRoutes.lotScan,
  inventory: (query?: Record<string, string | number | undefined>) =>
    withQuery(canonicalRoutes.inventory, query),
  stockMovements: (query?: Record<string, string | number | undefined>) =>
    withQuery(canonicalRoutes.stockMovements, query),
  stockOpnameDetail: (id: string) => `${canonicalRoutes.stockOpname}/${id}`,
  stockAdjustmentDetail: (id: string) => `${canonicalRoutes.stockAdjustments}/${id}`,
  productionOrderDetail: (id: string) => `${canonicalRoutes.productionOrders}/${id}`,
  productionOrderList: (query?: Record<string, string | number | undefined>) =>
    withQuery(canonicalRoutes.productionOrders, query),
  recipeDetail: (id: string) => `${canonicalRoutes.recipes}/${id}`,
  recipeList: (query?: Record<string, string | number | undefined>) =>
    withQuery(canonicalRoutes.recipes, query),
  recipeCreate: () => `${canonicalRoutes.recipes}/create`,
  recipeApprovalQueue: () => `${canonicalRoutes.recipes}/approval-queue`,
  recipeVersionDetail: (recipeId: string, versionId: string) =>
    `${canonicalRoutes.recipes}/${recipeId}/versions/${versionId}`,
  recipeTutorial: (recipeId: string, versionId: string) =>
    `${canonicalRoutes.recipes}/${recipeId}/versions/${versionId}/tutorial`,
  finishedGoodsLotDetail: (id: string) => `/production/finished-goods-lots/${id}`,
  deviationDetail: (id: string) => `${canonicalRoutes.deviations}/${id}`,
  qcInspection: (fgLotId: string) => `${canonicalRoutes.qualityControl}/${fgLotId}`,
  qcQueue: (query?: Record<string, string | number | undefined>) =>
    withQuery(canonicalRoutes.qualityControl, query),
  traceSearch: () => canonicalRoutes.traceability,
  traceFinishedGoods: (id: string) => `${canonicalRoutes.traceability}/finished-goods/${id}`,
  traceRawMaterial: (id: string) => `${canonicalRoutes.traceability}/raw-material/${id}`,
  auditDetail: (id: string) => `${canonicalRoutes.auditTrail}/${id}`,
  reportDetail: (code: string) => `${canonicalRoutes.reports}/${code}`,
  userDetail: (id: string) => `${canonicalRoutes.users}/${id}`,
  roleDetail: (id: string) => `${canonicalRoutes.roles}/${id}`,
}

/**
 * Map entityType backend (nama C# entity) → route detail frontend.
 * Return null bila reference tidak aman / tidak ada route (UI harus sembunyikan link).
 */
export function getAuditEntityLink(
  entityType: string,
  entityId: string | null | undefined,
): string | null {
  if (!entityId) return null
  switch (entityType) {
    case 'ProductionOrder':
      return entityLinks.productionOrderDetail(entityId)
    case 'GoodsReceiving':
      return entityLinks.receivingDetail(entityId)
    case 'RawMaterialLot':
      return entityLinks.lotDetail(entityId)
    case 'FinishedGoodsLot':
      return entityLinks.finishedGoodsLotDetail(entityId)
    case 'ProductionDeviation':
      return entityLinks.deviationDetail(entityId)
    case 'Recipe':
      return entityLinks.recipeDetail(entityId)
    case 'User':
      return entityLinks.userDetail(entityId)
    case 'Role':
      return entityLinks.roleDetail(entityId)
    case 'StockAdjustment':
      return entityLinks.stockAdjustmentDetail(entityId)
    case 'StockOpname':
      return entityLinks.stockOpnameDetail(entityId)
    default:
      return null
  }
}

/** Breadcrumb standar per halaman. Level terakhir tanpa `to` = halaman aktif. */
export const breadcrumbs = {
  dashboard: (): BreadcrumbItem[] => [{ label: 'Dashboard' }],
  receivingList: (): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Goods Receiving' },
  ],
  receivingDetail: (number: string): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Goods Receiving', to: canonicalRoutes.goodsReceiving },
    { label: number },
  ],
  lotList: (): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Lots' },
  ],
  inventory: (): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Inventory' },
  ],
  stockMovements: (): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Stock Movements' },
  ],
  stockOpnameList: (): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Stock Opname' },
  ],
  stockOpnameCreate: (): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Stock Opname', to: canonicalRoutes.stockOpname },
    { label: 'Create' },
  ],
  stockOpnameDetail: (number: string): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Stock Opname', to: canonicalRoutes.stockOpname },
    { label: number },
  ],
  lotDetail: (number: string): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Lots', to: canonicalRoutes.lots },
    { label: number },
  ],
  productionOrderList: (): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Production Orders' },
  ],
  productionOrderDetail: (number: string): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Production Orders', to: canonicalRoutes.productionOrders },
    { label: number },
  ],
  recipeList: (): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Recipes' },
  ],
  recipeCreate: (): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Recipes', to: canonicalRoutes.recipes },
    { label: 'Create' },
  ],
  recipeDetail: (name: string): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Recipes', to: canonicalRoutes.recipes },
    { label: name },
  ],
  recipeVersionDetail: (recipeName: string, versionNumber: number): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Recipes', to: canonicalRoutes.recipes },
    { label: recipeName },
    { label: `V${versionNumber}` },
  ],
  recipeApprovalQueue: (): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Recipes', to: canonicalRoutes.recipes },
    { label: 'Approval Queue' },
  ],
  recipeTutorial: (recipeName: string, versionNumber: number): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Recipes', to: canonicalRoutes.recipes },
    { label: recipeName },
    { label: `V${versionNumber} Tutorial` },
  ],
  deviationList: (): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Deviations' },
  ],
  deviationDetail: (id: string): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Deviations', to: canonicalRoutes.deviations },
    { label: id.slice(0, 8) },
  ],
  finishedGoodsDetail: (number: string): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Production Orders', to: canonicalRoutes.productionOrders },
    { label: number },
  ],
  auditList: (): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Administration' },
    { label: 'Audit Trail' },
  ],
  auditDetail: (action: string): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Administration' },
    { label: 'Audit Trail', to: canonicalRoutes.auditTrail },
    { label: action },
  ],
  traceability: (): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Traceability' },
  ],
  traceFinishedGoods: (number: string): BreadcrumbItem[] => [
    { label: 'Dashboard', to: canonicalRoutes.dashboard },
    { label: 'Traceability', to: canonicalRoutes.traceability },
    { label: number },
  ],
}

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const
export const DEFAULT_PAGE_SIZE = 10
export const DEFAULT_LIST_PAGE_SIZE = 20
