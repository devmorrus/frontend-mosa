import type { StockMovementListItem, StockMovementTypeFilter } from '@/features/stock-movements/types'
import { entityLinks } from '@/routes/canonicalRoutes'

export const STOCK_MOVEMENT_TYPE_OPTIONS: Array<{
  label: string
  value: StockMovementTypeFilter
}> = [
  { label: 'Semua movement', value: 'ALL' },
  { label: 'Receiving', value: 'RECEIVING' },
  { label: 'Adjustment In', value: 'ADJUSTMENTIN' },
  { label: 'Adjustment Out', value: 'ADJUSTMENTOUT' },
  { label: 'Production Consumption', value: 'PRODUCTIONCONSUMPTION' },
  { label: 'Stock Opname', value: 'STOCKOPNAME' },
]

export function formatStockMovementDateLabel(value: string | null | undefined) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatStockMovementDateTimeLabel(value: string | null | undefined) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatStockMovementQuantity(value: number) {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
  }).format(Math.abs(value))
}

export function getStockMovementDirectionTone(direction: string) {
  return direction.toUpperCase() === 'OUT'
    ? 'text-rose-700 bg-rose-50 border-rose-200'
    : 'text-blue-700 bg-blue-50 border-blue-200'
}

export function getStockMovementDisplayLabel(item: StockMovementListItem) {
  const prefix = item.quantityDirection.toUpperCase() === 'OUT' ? '-' : '+'
  return `${prefix}${formatStockMovementQuantity(item.displayQuantity)}`
}

export function buildStockMovementSearchPlaceholder() {
  return 'Cari reference receiving atau reference movement'
}

export function getStockMovementFilterErrorMessage(errors: string[]) {
  return errors[0] ?? null
}

export function canOpenReceivingReference(item: StockMovementListItem) {
  return item.referenceType === 'GoodsReceiving' && Boolean(item.referenceId)
}

/** Route aman untuk reference movement apa pun; null bila tidak ada route. */
export function getStockMovementReferenceLink(item: StockMovementListItem): string | null {
  if (!item.referenceId) return null
  switch (item.referenceType) {
    case 'GoodsReceiving':
      return entityLinks.receivingDetail(item.referenceId)
    case 'StockAdjustment':
      return entityLinks.stockAdjustmentDetail(item.referenceId)
    case 'StockOpname':
      return entityLinks.stockOpnameDetail(item.referenceId)
    case 'ProductionOrder':
      return entityLinks.productionOrderDetail(item.referenceId)
    default:
      return null
  }
}

export function getStockMovementReferenceLabel(item: StockMovementListItem) {
  return item.referenceNumber ?? item.referenceType
}
