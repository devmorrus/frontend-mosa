import type { MasterDataPagination } from '@/features/master-data/types'

export type StockAdjustmentType = 'IN' | 'OUT'

export interface StockAdjustmentListItem {
  id: string
  stockAdjustmentNumber: string
  warehouseId: string
  warehouseCode: string
  warehouseName: string
  rawMaterialId: string
  rawMaterialCode: string
  rawMaterialName: string
  rawMaterialLotId: string
  internalLotNumber: string
  adjustmentType: StockAdjustmentType
  quantityBefore: number
  adjustmentQuantity: number
  quantityAfter: number
  reason: string
  reference: string | null
  postedBy: string
  postedAtUtc: string
  createdAtUtc: string
}

export interface StockAdjustmentDetail extends StockAdjustmentListItem {
  createdBy: string | null
  updatedBy: string | null
  updatedAtUtc: string | null
  isDuplicate: boolean
}

export interface StockAdjustmentPreview {
  warehouseId: string
  warehouseCode: string
  warehouseName: string
  rawMaterialId: string
  rawMaterialCode: string
  rawMaterialName: string
  rawMaterialLotId: string
  internalLotNumber: string
  adjustmentType: StockAdjustmentType
  currentQuantity: number
  adjustmentQuantity: number
  quantityAfter: number
}

export interface StockAdjustmentQueryState {
  search: string
  warehouseId: string
  rawMaterialId: string
  rawMaterialLotId: string
  adjustmentType: 'ALL' | StockAdjustmentType
  dateFrom: string
  dateTo: string
  page: number
  pageSize: number
}

export interface CreateStockAdjustmentPayload {
  warehouseId: string
  rawMaterialId: string
  rawMaterialLotId: string
  adjustmentQuantity: number
  reason: string
  reference?: string | null
}

export interface StockAdjustmentListResult {
  items: StockAdjustmentListItem[]
  pagination: MasterDataPagination
}
