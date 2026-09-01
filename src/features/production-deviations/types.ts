import type { MasterDataPagination } from '@/features/master-data/types'

export const ProductionDeviationStatus = { PendingApproval: 1, Approved: 2, Rejected: 3, Cancelled: 4 } as const
export type ProductionDeviationStatus = (typeof ProductionDeviationStatus)[keyof typeof ProductionDeviationStatus]
export type ProductionDeviationStatusFilter = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface ProductionDeviationListItem {
  id: string; productionOrderId: string; productionOrderNumber: string; productId: string; productName: string; productCode: string
  stepSequence: number; stepName: string; rawMaterialName: string; rawMaterialCode: string; targetQuantity: number; actualQuantity: number
  varianceQuantity: number; variancePercentage: number | null; unitOfMeasureSymbol: string; reason: string; status: ProductionDeviationStatus
  requestedBy: string; requestedAtUtc: string; reviewedBy: string | null; reviewedAtUtc: string | null; reviewNotes: string | null; createdAtUtc: string
}

export interface ProductionDeviationDetail {
  id: string
  productionOrder: { id: string; productionOrderNumber: string; productId: string; productCode: string; productName: string; recipeVersionId: string; recipeName: string; recipeVersionNumber: number; warehouseId: string; warehouseCode: string; warehouseName: string; assignedOperatorFullName: string | null; targetOutput: number; unitOfMeasureCode: string; unitOfMeasureSymbol: string | null; status: number }
  step: { id: string; sequence: number; stepName: string; instruction: string | null; rawMaterialName: string | null; rawMaterialCode: string | null; targetQuantity: number | null; unitOfMeasureSymbol: string | null; toleranceType: number | null; toleranceValue: number | null; actualQuantity: number | null }
  material: { targetQuantity: number; actualQuantity: number; varianceQuantity: number; variancePercentage: number | null; lowerLimit: number | null; upperLimit: number | null; toleranceType: number; toleranceValue: number | null; unitOfMeasureSymbol: string }
  lots: Array<{ materialConsumptionId: string; rawMaterialLotId: string; internalLotNumber: string; supplierLot: string | null; availableStock: number; proposedActualQuantity: number; expiryDate: string | null; warehouseCode: string }>
  request: { operator: string; reason: string; requestedAtUtc: string }
  decision: { status: ProductionDeviationStatus; reviewedBy: string | null; reviewedAtUtc: string | null; reviewNotes: string | null }
  createdAtUtc: string; updatedAtUtc: string | null
}

export interface ProductionDeviationQueryState {
  status: ProductionDeviationStatusFilter
  productionOrderId: string
  productId: string
  requestedAtFrom: string
  requestedAtTo: string
  search: string
  sortBy: 'requestedAt' | 'status' | 'productionOrderNumber'
  sortDir: 'asc' | 'desc'
  page: number
  pageSize: number
}

export interface ProductionDeviationListResult { items: ProductionDeviationListItem[]; pagination: MasterDataPagination }
