import type { MasterDataPagination } from '@/features/master-data/types'

export type RawMaterialLotStatusFilter =
  | 'ALL'
  | 'AVAILABLE'
  | 'BLOCKED'
  | 'CONSUMED'
  | 'EXPIRED'

export interface RawMaterialLotListItem {
  id: string
  internalLotNumber: string
  supplierLot: string | null
  rawMaterialId: string
  rawMaterialCode: string
  rawMaterialName: string
  supplierId: string
  supplierName: string
  warehouseId: string
  warehouseName: string
  initialQuantity: number
  currentQuantity: number
  unitOfMeasureCode: string
  expiryDate: string | null
  receivingNumber: string
  receivingDate: string
  status: string
  createdAtUtc: string
  qrToken: string
}

export interface RawMaterialLotDetail {
  id: string
  internalLotNumber: string
  supplierLot: string | null
  rawMaterialId: string
  rawMaterialCode: string
  rawMaterialName: string
  unitOfMeasureCode: string
  supplierId: string
  supplierName: string
  warehouseId: string
  warehouseName: string
  goodsReceivingId: string
  receivingNumber: string
  receivingDate: string
  goodsReceivingItemId: string
  initialQuantity: number
  currentQuantity: number
  productionDate: string | null
  expiryDate: string | null
  status: string
  createdBy: string | null
  createdAtUtc: string
  updatedBy: string | null
  updatedAtUtc: string | null
  qrToken: string
}

export interface RawMaterialLotQr {
  lotId: string
  internalLotNumber: string
  qrToken: string
  qrCodeUrl: string
}

export interface RawMaterialLotLabel {
  lotId: string
  materialName: string
  materialCode: string
  internalLotNumber: string
  supplierLot: string | null
  warehouseId: string
  warehouseCode: string
  warehouseName: string
  receivedDate: string
  expiryDate: string | null
  qrToken: string
  qrPayload: string
  qrCodeSvg: string
  reprintable: boolean
}

export interface RawMaterialLotQueryState {
  search: string
  rawMaterialId: string
  supplierId: string
  warehouseId: string
  status: RawMaterialLotStatusFilter
  expiryFrom: string
  expiryTo: string
  receivedDateFrom: string
  receivedDateTo: string
  page: number
  pageSize: number
}

export interface RawMaterialLotListResult {
  items: RawMaterialLotListItem[]
  pagination: MasterDataPagination
}
