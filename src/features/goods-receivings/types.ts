import type { MasterDataPagination } from '@/features/master-data/types'

export type GoodsReceivingStatusFilter = 'ALL' | 'DRAFT' | 'POSTED' | 'CANCELLED'

export interface GoodsReceivingListItem {
  id: string
  receivingNumber: string
  supplierId: string
  supplierName: string
  warehouseId: string
  warehouseName: string
  receivingDate: string
  status: string
  itemsCount: number
  createdBy: string | null
  createdAtUtc: string
  postedAtUtc: string | null
}

export interface GoodsReceivingItem {
  id: string
  rawMaterialId: string
  rawMaterialCode: string
  rawMaterialName: string
  quantity: number
  unitOfMeasureId: string
  unitOfMeasureCode: string
  supplierLot: string | null
  productionDate: string | null
  expiryDate: string | null
  internalLot: string | null
  notes: string | null
}

export interface GoodsReceivingDetail {
  id: string
  receivingNumber: string
  supplierId: string
  supplierName: string
  warehouseId: string
  warehouseName: string
  receivingDate: string
  status: string
  notes: string | null
  postedBy: string | null
  postedAtUtc: string | null
  createdBy: string | null
  createdAtUtc: string
  updatedBy: string | null
  updatedAtUtc: string | null
  items: GoodsReceivingItem[]
}

export interface GoodsReceivingItemFormValues {
  clientId: string
  rawMaterialId: string
  rawMaterialCode: string
  rawMaterialName: string
  unitOfMeasureId: string
  unitOfMeasureCode: string
  unitOfMeasureName: string
  hasExpiry: boolean
  quantity: string
  supplierLot: string
  productionDate: string
  expiryDate: string
  notes: string
}

export interface GoodsReceivingFormValues {
  supplierId: string
  warehouseId: string
  receivingDate: string
  notes: string
  items: GoodsReceivingItemFormValues[]
}

export interface GoodsReceivingQueryState {
  search: string
  status: GoodsReceivingStatusFilter
  supplierId: string
  warehouseId: string
  dateFrom: string
  dateTo: string
  page: number
  pageSize: number
}

export interface GoodsReceivingListResult {
  items: GoodsReceivingListItem[]
  pagination: MasterDataPagination
}
