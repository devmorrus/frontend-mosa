import type { MasterDataPagination } from '@/features/master-data/types'

export type StockOpnameStatus = 'DRAFT' | 'INPROGRESS' | 'READYTOPOST' | 'POSTED' | 'CANCELLED'

export interface StockOpnameListItem {
  id: string
  stockOpnameNumber: string
  warehouseId: string
  warehouseCode: string
  warehouseName: string
  opnameDate: string
  status: StockOpnameStatus
  itemsCount: number
  varianceLines: number
  totalVariance: number | null
  createdBy: string | null
  createdAtUtc: string
  postedBy: string | null
  postedAtUtc: string | null
}

export interface StockOpnameItem {
  id: string
  rawMaterialId: string
  rawMaterialCode: string
  rawMaterialName: string
  rawMaterialLotId: string
  rawMaterialLotNumber: string
  unitOfMeasureId: string
  unitOfMeasureCode: string
  unitOfMeasureSymbol: string | null
  systemQuantity: number
  physicalQuantity: number | null
  varianceQuantity: number | null
  notes: string | null
  countedBy: string | null
  countedAt: string | null
  createdAtUtc: string
  updatedAtUtc: string | null
}

export interface StockOpnameDetail extends Omit<StockOpnameListItem, 'itemsCount' | 'varianceLines' | 'totalVariance'> {
  notes: string | null
  updatedBy: string | null
  updatedAtUtc: string | null
  items: StockOpnameItem[]
}

export interface StockOpnameQueryState {
  search: string
  status: 'ALL' | StockOpnameStatus
  warehouseId: string
  dateFrom: string
  dateTo: string
  page: number
  pageSize: number
}

export interface CreateStockOpnamePayload {
  warehouseId: string
  opnameDate: string
  notes?: string | null
}

export interface UpdateStockOpnameCountPayload {
  items: Array<{
    itemId: string
    physicalQuantity: number
    notes?: string | null
  }>
}

export interface StockOpnameListResult {
  items: StockOpnameListItem[]
  pagination: MasterDataPagination
}

export interface StockOpnamePostingSummary {
  totalLotCounted: number
  matchingLot: number
  positiveVariance: number
  negativeVariance: number
  netVariance: number
  totalCorrection: number
}
