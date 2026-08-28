import type { MasterDataPagination } from '@/features/master-data/types'

export type StockMovementTypeFilter =
  | 'ALL'
  | 'RECEIVING'
  | 'ADJUSTMENTIN'
  | 'ADJUSTMENTOUT'
  | 'PRODUCTIONCONSUMPTION'
  | 'STOCKOPNAME'

export interface StockMovementListItem {
  id: string
  warehouseId: string
  warehouseCode: string
  warehouseName: string
  rawMaterialId: string
  rawMaterialCode: string
  rawMaterialName: string
  rawMaterialLotId: string
  internalLotNumber: string
  movementType: string
  quantity: number
  quantityDirection: string
  displayQuantity: number
  quantityBefore: number
  quantityAfter: number
  referenceType: string
  referenceId: string
  referenceNumber: string | null
  notes: string | null
  createdBy: string | null
  createdAtUtc: string
}

export interface StockMovementDetail extends StockMovementListItem {}

export interface StockMovementQueryState {
  warehouseId: string
  rawMaterialId: string
  rawMaterialLotId: string
  movementType: StockMovementTypeFilter
  dateFrom: string
  dateTo: string
  reference: string
  page: number
  pageSize: number
}

export interface StockMovementListResult {
  items: StockMovementListItem[]
  pagination: MasterDataPagination
}
