import type { StockAdjustmentQueryState, StockAdjustmentType } from '@/features/stock-adjustments/types'

export const emptyStockAdjustmentQuery: StockAdjustmentQueryState = {
  search: '',
  warehouseId: '',
  rawMaterialId: '',
  rawMaterialLotId: '',
  adjustmentType: 'ALL',
  dateFrom: '',
  dateTo: '',
  page: 1,
  pageSize: 20,
}

export function normalizeStockAdjustmentQuery(query: StockAdjustmentQueryState): StockAdjustmentQueryState {
  return {
    search: query.search.trim(),
    warehouseId: query.warehouseId,
    rawMaterialId: query.rawMaterialId,
    rawMaterialLotId: query.rawMaterialLotId,
    adjustmentType: query.adjustmentType,
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    page: Math.max(1, query.page || 1),
    pageSize: Math.min(100, Math.max(1, query.pageSize || 20)),
  }
}

export function toSignedAdjustmentQuantity(type: StockAdjustmentType, quantity: string) {
  const value = Number(quantity)
  if (!Number.isFinite(value)) return Number.NaN
  return type === 'OUT' ? -Math.abs(value) : Math.abs(value)
}

export function validateStockAdjustmentForm(values: {
  warehouseId: string
  rawMaterialId: string
  rawMaterialLotId: string
  adjustmentQuantity: string
  reason: string
}) {
  const errors: Record<string, string> = {}
  const quantity = Number(values.adjustmentQuantity)
  if (!values.warehouseId) errors.warehouseId = 'Warehouse wajib dipilih.'
  if (!values.rawMaterialId) errors.rawMaterialId = 'Material wajib dipilih.'
  if (!values.rawMaterialLotId) errors.rawMaterialLotId = 'LOT wajib dipilih.'
  if (!values.adjustmentQuantity || !Number.isFinite(quantity) || quantity <= 0) {
    errors.adjustmentQuantity = 'Adjustment quantity harus lebih dari 0.'
  }
  if (!values.reason.trim()) errors.reason = 'Reason wajib diisi.'
  if (values.reason.trim() && values.reason.trim().length < 5) errors.reason = 'Reason minimal 5 karakter.'
  return errors
}
