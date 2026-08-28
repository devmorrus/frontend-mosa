import type { MasterDataPagination } from '@/features/master-data/types'

export type InventoryRawMaterialStatusFilter =
  | 'ALL'
  | 'AVAILABLE'
  | 'BLOCKED'
  | 'CONSUMED'
  | 'EXPIRED'

export interface InventoryRawMaterialLot {
  lotId: string
  internalLotNumber: string
  warehouseId: string
  warehouseCode: string
  warehouseName: string
  quantity: number
  expiryDate: string | null
  status: string
  isExpired: boolean
  isAvailableForProduction: boolean
}

export interface InventoryRawMaterialListItem {
  materialId: string
  materialCode: string
  materialName: string
  unit: string
  totalQuantity: number
  availableQuantity: number
  lots: InventoryRawMaterialLot[]
}

export interface FefoRecommendedLot {
  lotId: string
  internalLotNumber: string
  availableQuantity: number
  recommendedQuantity: number
  expiryDate: string | null
  status: string
  isExpired: boolean
  recommendationRank: number
}

export interface FefoRecommendation {
  materialId: string
  materialCode: string
  materialName: string
  warehouseId: string
  warehouseCode: string
  warehouseName: string
  requiredQuantity: number | null
  totalAvailableQuantity: number
  totalRecommendedQuantity: number
  lots: FefoRecommendedLot[]
}

export interface InventoryRawMaterialQueryState {
  search: string
  warehouseId: string
  rawMaterialId: string
  status: InventoryRawMaterialStatusFilter
  expiryFrom: string
  expiryTo: string
  page: number
  pageSize: number
}

export interface InventoryRawMaterialListResult {
  items: InventoryRawMaterialListItem[]
  pagination: MasterDataPagination
}
