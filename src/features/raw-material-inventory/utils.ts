import type {
  FefoRecommendedLot,
  InventoryRawMaterialListItem,
  InventoryRawMaterialLot,
  InventoryRawMaterialStatusFilter,
} from '@/features/raw-material-inventory/types'

export const INVENTORY_RAW_MATERIAL_STATUS_OPTIONS: Array<{
  label: string
  value: InventoryRawMaterialStatusFilter
}> = [
  { label: 'Semua status', value: 'ALL' },
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Blocked', value: 'BLOCKED' },
  { label: 'Consumed', value: 'CONSUMED' },
  { label: 'Expired', value: 'EXPIRED' },
]

export function formatInventoryDateLabel(value: string | null | undefined) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatInventoryQuantity(value: number, unit: string) {
  return `${new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
  }).format(value)} ${unit}`
}

export function buildInventorySearchPlaceholder() {
  return 'Cari material code, material name, atau internal LOT'
}

export function getInventoryFilterErrorMessage(errors: string[]) {
  return errors[0] ?? null
}

export function getUniqueWarehouseCount(item: InventoryRawMaterialListItem) {
  return new Set(item.lots.map((lot) => lot.warehouseId)).size
}

export function getAggregateWarehouseLabel(item: InventoryRawMaterialListItem) {
  if (item.lots.length === 0) return '-'

  const warehouseNames = [...new Set(item.lots.map((lot) => lot.warehouseName))]
  if (warehouseNames.length === 1) {
    return warehouseNames[0]
  }

  return `Multi Warehouse (${warehouseNames.length})`
}

export function getInventoryLotStatusTone(lot: InventoryRawMaterialLot) {
  if (lot.isExpired) {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }

  switch (lot.status.toUpperCase()) {
    case 'AVAILABLE':
      return 'border-blue-200 bg-blue-50 text-blue-700'
    case 'BLOCKED':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'CONSUMED':
      return 'border-slate-200 bg-slate-100 text-slate-600'
    case 'EXPIRED':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600'
  }
}

export function getInventoryLotStatusLabel(lot: InventoryRawMaterialLot) {
  return lot.isExpired ? 'EXPIRED' : lot.status.toUpperCase()
}

export function getInventoryAggregateStatus(item: InventoryRawMaterialListItem) {
  const allBlocked = item.lots.length > 0 && item.lots.every((lot) => lot.status.toUpperCase() === 'BLOCKED')
  const allExpired = item.lots.length > 0 && item.lots.every((lot) => lot.isExpired)

  if (item.availableQuantity > 0) {
    return 'AVAILABLE'
  }

  if (allBlocked) {
    return 'BLOCKED'
  }

  if (allExpired) {
    return 'EXPIRED'
  }

  return 'MIXED'
}

export function getInventoryAggregateStatusTone(status: string) {
  switch (status) {
    case 'AVAILABLE':
      return 'border-blue-200 bg-blue-50 text-blue-700'
    case 'BLOCKED':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'EXPIRED':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    default:
      return 'border-slate-200 bg-slate-100 text-slate-600'
  }
}

export function resolveInventoryFefoWarehouseId(
  item: InventoryRawMaterialListItem,
  selectedWarehouseId: string,
) {
  if (selectedWarehouseId) return selectedWarehouseId

  const warehouseIds = [...new Set(item.lots.map((lot) => lot.warehouseId))]
  return warehouseIds.length === 1 ? warehouseIds[0] : null
}

export function getInventoryFefoInfoMessage(
  item: InventoryRawMaterialListItem,
  selectedWarehouseId: string,
) {
  const resolvedWarehouseId = resolveInventoryFefoWarehouseId(item, selectedWarehouseId)
  if (resolvedWarehouseId) return null

  return 'Pilih warehouse untuk melihat rekomendasi FEFO pada material multi-warehouse.'
}

export function getInventoryFefoStatusTone(lot: FefoRecommendedLot) {
  if (lot.isExpired) {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }

  switch (lot.status.toUpperCase()) {
    case 'AVAILABLE':
      return 'border-blue-200 bg-blue-50 text-blue-700'
    case 'BLOCKED':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'CONSUMED':
      return 'border-slate-200 bg-slate-100 text-slate-600'
    case 'EXPIRED':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600'
  }
}

export function getInventoryFefoStatusLabel(lot: FefoRecommendedLot) {
  return lot.isExpired ? 'EXPIRED' : lot.status.toUpperCase()
}
