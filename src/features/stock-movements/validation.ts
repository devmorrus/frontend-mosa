import { PAGE_SIZE_OPTIONS, normalizeText } from '@/features/master-data/utils'
import type { StockMovementQueryState } from '@/features/stock-movements/types'

export const emptyStockMovementQuery: StockMovementQueryState = {
  warehouseId: '',
  rawMaterialId: '',
  rawMaterialLotId: '',
  movementType: 'ALL',
  dateFrom: '',
  dateTo: '',
  reference: '',
  page: 1,
  pageSize: 10,
}

export interface StockMovementQueryValidationResult {
  isValid: boolean
  errors: string[]
}

export function normalizeStockMovementQuery(
  query: StockMovementQueryState,
): StockMovementQueryState {
  return {
    ...query,
    warehouseId: query.warehouseId.trim(),
    rawMaterialId: query.rawMaterialId.trim(),
    rawMaterialLotId: query.rawMaterialLotId.trim(),
    movementType: query.movementType,
    dateFrom: query.dateFrom.trim(),
    dateTo: query.dateTo.trim(),
    reference: normalizeText(query.reference).slice(0, 100),
    page: Math.max(1, query.page),
    pageSize: PAGE_SIZE_OPTIONS.includes(query.pageSize) ? query.pageSize : 10,
  }
}

export function validateStockMovementQuery(
  query: StockMovementQueryState,
): StockMovementQueryValidationResult {
  const normalized = normalizeStockMovementQuery(query)
  const errors: string[] = []

  if (normalized.page < 1) {
    errors.push('Halaman stock movement minimal 1.')
  }

  if (!PAGE_SIZE_OPTIONS.includes(normalized.pageSize)) {
    errors.push('Jumlah data per halaman stock movement tidak valid.')
  }

  if (normalized.dateFrom && normalized.dateTo && normalized.dateFrom > normalized.dateTo) {
    errors.push('Rentang tanggal stock movement tidak valid.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
