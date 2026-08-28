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
