import type { MasterDataPagination } from '@/features/master-data/types'

export const ProductionOrderStatus = {
  Draft: 1,
  MaterialShortage: 2,
  Ready: 3,
  Scheduled: 4,
  Released: 5,
  InProgress: 6,
  WaitingQc: 7,
  Completed: 8,
  Cancelled: 9,
} as const

export type ProductionOrderStatus =
  (typeof ProductionOrderStatus)[keyof typeof ProductionOrderStatus]

export type ProductionOrderStatusFilter =
  | 'ALL'
  | 'DRAFT'
  | 'MATERIAL_SHORTAGE'
  | 'READY'
  | 'SCHEDULED'
  | 'RELEASED'
  | 'IN_PROGRESS'
  | 'WAITING_QC'
  | 'COMPLETED'
  | 'CANCELLED'

export interface ProductionOrderProductLookup {
  id: string
  code: string
  name: string
}

export interface ProductionOrderRecipeVersionLookup {
  id: string
  recipeId: string
  recipeName: string
  versionNumber: number
  unitOfMeasure: {
    id: string
    code: string
    name: string
    symbol: string | null
  }
}

export interface ProductionOrderWarehouseLookup {
  id: string
  code: string
  name: string
}

export interface ProductionOrderOperatorLookup {
  id: string
  username: string
  fullName: string
}

export interface ProductionOrderUnitOfMeasureLookup {
  id: string
  code: string
  name: string
  symbol: string | null
}

export interface ProductionOrderListItem {
  id: string
  productionOrderNumber: string
  product: ProductionOrderProductLookup
  recipeVersion: ProductionOrderRecipeVersionLookup
  warehouse: ProductionOrderWarehouseLookup
  assignedOperator: ProductionOrderOperatorLookup | null
  targetOutput: number
  unitOfMeasure: ProductionOrderUnitOfMeasureLookup
  scheduledDate: string | null
  status: ProductionOrderStatus
  materialRequirementsCount: number
  createdAtUtc: string
  createdBy: string | null
  updatedAtUtc: string | null
  updatedBy: string | null
}

export interface ProductionOrderMaterialRequirement {
  id: string
  rawMaterialId: string
  rawMaterialCode: string
  rawMaterialName: string
  recipeTargetQuantity: number
  scaledRequiredQuantity: number
  availableQuantity: number
  isSufficient: boolean
  unitOfMeasure: ProductionOrderUnitOfMeasureLookup
  createdAtUtc: string
  updatedAtUtc: string | null
}

export interface ProductionOrderDetail {
  id: string
  productionOrderNumber: string
  product: ProductionOrderProductLookup
  recipeVersion: ProductionOrderRecipeVersionLookup
  warehouse: ProductionOrderWarehouseLookup
  assignedOperator: ProductionOrderOperatorLookup | null
  targetOutput: number
  unitOfMeasure: ProductionOrderUnitOfMeasureLookup
  scheduledDate: string | null
  status: ProductionOrderStatus
  releasedBy: string | null
  releasedAtUtc: string | null
  cancelledBy: string | null
  cancelledAtUtc: string | null
  cancellationReason: string | null
  createdAtUtc: string
  createdBy: string | null
  updatedAtUtc: string | null
  updatedBy: string | null
  materialRequirements: ProductionOrderMaterialRequirement[]
}

export interface ProductionOrderFormValues {
  productId: string
  recipeVersionId: string
  warehouseId: string
  targetOutput: string
  unitOfMeasureId: string
  scheduledDate: string
  assignedOperatorId: string
}

export interface ProductionOrderQueryState {
  search: string
  status: ProductionOrderStatusFilter
  page: number
  pageSize: number
}

export interface ProductionOrderListResult {
  items: ProductionOrderListItem[]
  pagination: MasterDataPagination
}

export interface RecipeVersionOption {
  id: string
  recipeId: string
  recipeName: string
  versionNumber: number
  standardOutputQuantity: number
  unitOfMeasure: ProductionOrderUnitOfMeasureLookup
}
