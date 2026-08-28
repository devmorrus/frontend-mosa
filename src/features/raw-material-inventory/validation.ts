import { PAGE_SIZE_OPTIONS, normalizeText } from '@/features/master-data/utils'
import type { InventoryRawMaterialQueryState } from '@/features/raw-material-inventory/types'

export const emptyInventoryRawMaterialQuery: InventoryRawMaterialQueryState = {
  search: '',
  warehouseId: '',
  rawMaterialId: '',
  status: 'ALL',
  expiryFrom: '',
  expiryTo: '',
  page: 1,
  pageSize: 10,
}

export interface InventoryRawMaterialQueryValidationResult {
  isValid: boolean
  errors: string[]
}

export function normalizeInventoryRawMaterialQuery(
  query: InventoryRawMaterialQueryState,
): InventoryRawMaterialQueryState {
  return {
    ...query,
    search: normalizeText(query.search).slice(0, 100),
    warehouseId: query.warehouseId.trim(),
    rawMaterialId: query.rawMaterialId.trim(),
    expiryFrom: query.expiryFrom.trim(),
    expiryTo: query.expiryTo.trim(),
    page: Math.max(1, query.page),
    pageSize: PAGE_SIZE_OPTIONS.includes(query.pageSize) ? query.pageSize : 10,
  }
}

export function validateInventoryRawMaterialQuery(
  query: InventoryRawMaterialQueryState,
): InventoryRawMaterialQueryValidationResult {
  const normalized = normalizeInventoryRawMaterialQuery(query)
  const errors: string[] = []

  if (normalized.page < 1) {
    errors.push('Halaman inventory minimal 1.')
  }

  if (!PAGE_SIZE_OPTIONS.includes(normalized.pageSize)) {
    errors.push('Jumlah data per halaman inventory tidak valid.')
  }

  if (normalized.expiryFrom && normalized.expiryTo && normalized.expiryFrom > normalized.expiryTo) {
    errors.push('Rentang expiry inventory tidak valid.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
