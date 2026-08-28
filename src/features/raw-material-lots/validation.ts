import { PAGE_SIZE_OPTIONS, normalizeText } from '@/features/master-data/utils'
import type { RawMaterialLotQueryState } from '@/features/raw-material-lots/types'

export const emptyRawMaterialLotQuery: RawMaterialLotQueryState = {
  search: '',
  rawMaterialId: '',
  supplierId: '',
  warehouseId: '',
  status: 'ALL',
  expiryFrom: '',
  expiryTo: '',
  receivedDateFrom: '',
  receivedDateTo: '',
  page: 1,
  pageSize: 10,
}

export interface RawMaterialLotQueryValidationResult {
  isValid: boolean
  errors: string[]
}

export function normalizeRawMaterialLotQuery(
  query: RawMaterialLotQueryState,
): RawMaterialLotQueryState {
  return {
    ...query,
    search: normalizeText(query.search).slice(0, 100),
    rawMaterialId: query.rawMaterialId.trim(),
    supplierId: query.supplierId.trim(),
    warehouseId: query.warehouseId.trim(),
    expiryFrom: query.expiryFrom.trim(),
    expiryTo: query.expiryTo.trim(),
    receivedDateFrom: query.receivedDateFrom.trim(),
    receivedDateTo: query.receivedDateTo.trim(),
    page: Math.max(1, query.page),
    pageSize: PAGE_SIZE_OPTIONS.includes(query.pageSize) ? query.pageSize : 10,
  }
}

export function validateRawMaterialLotQuery(
  query: RawMaterialLotQueryState,
): RawMaterialLotQueryValidationResult {
  const normalized = normalizeRawMaterialLotQuery(query)
  const errors: string[] = []

  if (normalized.page < 1) {
    errors.push('Halaman LOT minimal 1.')
  }

  if (!PAGE_SIZE_OPTIONS.includes(normalized.pageSize)) {
    errors.push('Jumlah data per halaman LOT tidak valid.')
  }

  if (normalized.expiryFrom && normalized.expiryTo && normalized.expiryFrom > normalized.expiryTo) {
    errors.push('Rentang expiry tidak valid.')
  }

  if (
    normalized.receivedDateFrom &&
    normalized.receivedDateTo &&
    normalized.receivedDateFrom > normalized.receivedDateTo
  ) {
    errors.push('Rentang tanggal receiving tidak valid.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function normalizeScannedQrInput(value: string) {
  return value.trim()
}
