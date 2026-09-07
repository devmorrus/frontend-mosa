import type { StockOpnameQueryState, StockOpnameItem, StockOpnamePostingSummary } from '@/features/stock-opname/types'

export const emptyStockOpnameQuery: StockOpnameQueryState = {
  search: '',
  status: 'ALL',
  warehouseId: '',
  dateFrom: '',
  dateTo: '',
  page: 1,
  pageSize: 20,
}

export function normalizeStockOpnameQuery(query: StockOpnameQueryState): StockOpnameQueryState {
  return {
    search: query.search.trim(),
    status: query.status,
    warehouseId: query.warehouseId,
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    page: Math.max(1, query.page || 1),
    pageSize: Math.min(100, Math.max(1, query.pageSize || 20)),
  }
}

export function validateStockOpnameCreate(values: { warehouseId: string; opnameDate: string }) {
  const errors: Record<string, string> = {}
  if (!values.warehouseId) errors.warehouseId = 'Warehouse wajib dipilih.'
  if (!values.opnameDate) errors.opnameDate = 'Tanggal opname wajib diisi.'
  return errors
}

export function getStockOpnameSummary(items: StockOpnameItem[]): StockOpnamePostingSummary {
  const counted = items.filter((item) => item.physicalQuantity !== null)
  const variances = counted.map((item) => item.varianceQuantity ?? 0)

  return {
    totalLotCounted: counted.length,
    matchingLot: variances.filter((variance) => variance === 0).length,
    positiveVariance: variances.filter((variance) => variance > 0).length,
    negativeVariance: variances.filter((variance) => variance < 0).length,
    netVariance: variances.reduce((total, variance) => total + variance, 0),
    totalCorrection: variances.reduce((total, variance) => total + Math.abs(variance), 0),
  }
}
