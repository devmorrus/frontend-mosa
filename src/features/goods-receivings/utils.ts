import type { MasterDataFormErrors } from '@/features/master-data/types'
import type { GoodsReceivingDetail, GoodsReceivingFormValues } from '@/features/goods-receivings/types'
import { createEmptyReceivingItem } from '@/features/goods-receivings/validation'
import type { RawMaterialDetail, RawMaterialListItem } from '@/features/raw-materials/types'
import type { SupplierListItem } from '@/features/suppliers/types'
import type { WarehouseListItem } from '@/features/warehouses/types'

export function formatDateLabel(value: string | null | undefined) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatDateTimeLabel(value: string | null | undefined) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function toDateInputValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : ''
}

export function mapReceivingDetailToFormValues(detail: GoodsReceivingDetail): GoodsReceivingFormValues {
  return {
    supplierId: detail.supplierId,
    warehouseId: detail.warehouseId,
    receivingDate: toDateInputValue(detail.receivingDate),
    notes: detail.notes ?? '',
    items: detail.items.map((item) => ({
      clientId: item.id,
      rawMaterialId: item.rawMaterialId,
      rawMaterialCode: item.rawMaterialCode,
      rawMaterialName: item.rawMaterialName,
      internalLot: item.internalLot ?? '',
      unitOfMeasureId: item.unitOfMeasureId,
      unitOfMeasureCode: item.unitOfMeasureCode,
      unitOfMeasureName: item.unitOfMeasureCode,
      hasExpiry: Boolean(item.expiryDate),
      quantity: item.quantity.toString(),
      supplierLot: item.supplierLot ?? '',
      productionDate: toDateInputValue(item.productionDate),
      expiryDate: toDateInputValue(item.expiryDate),
      notes: item.notes ?? '',
    })),
  }
}

export function normalizeGoodsReceivingErrors(
  errors: Record<string, string[]>,
): MasterDataFormErrors {
  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [normalizeErrorKey(key), value]),
  )
}

function normalizeErrorKey(key: string) {
  return key
    .replace(/^([A-Z])/, (match) => match.toLowerCase())
    .replace(/\.([A-Z])/g, (_, char: string) => `.${char.toLowerCase()}`)
    .replace(/\]([A-Z])/g, (_match, char: string) => `].${char.toLowerCase()}`)
    .replace(/\.(\d+)\./g, '[$1].')
}

export function getReceivingFieldError(errors: MasterDataFormErrors, field: string) {
  return errors[field]?.[0] ?? null
}

export function getReceivingItemFieldError(
  errors: MasterDataFormErrors,
  index: number,
  field: string,
) {
  return errors[`items[${index}].${field}`]?.[0] ?? null
}

export function mergeSelectedSupplier(
  options: SupplierListItem[],
  current: SupplierListItem | null,
) {
  if (!current) return options

  return options.some((option) => option.id === current.id) ? options : [...options, current]
}

export function mergeSelectedWarehouse(
  options: WarehouseListItem[],
  current: WarehouseListItem | null,
) {
  if (!current) return options

  return options.some((option) => option.id === current.id) ? options : [...options, current]
}

export function mergeSelectedMaterial(
  options: RawMaterialListItem[],
  current: RawMaterialListItem | null,
) {
  if (!current) return options

  return options.some((option) => option.id === current.id) ? options : [...options, current]
}

export function materialDetailToListItem(detail: RawMaterialDetail): RawMaterialListItem {
  return {
    id: detail.id,
    code: detail.code,
    name: detail.name,
    category: detail.category,
    unitOfMeasureId: detail.unitOfMeasure.id,
    unitOfMeasureCode: detail.unitOfMeasure.code,
    unitOfMeasureName: detail.unitOfMeasure.name,
    hasExpiry: detail.hasExpiry,
    shelfLifeDays: detail.shelfLifeDays,
    minimumStock: detail.minimumStock,
    isActive: detail.isActive,
  }
}

export function ensureAtLeastOneItem(values: GoodsReceivingFormValues) {
  return values.items.length > 0
    ? values
    : {
        ...values,
        items: [createEmptyReceivingItem()],
      }
}
