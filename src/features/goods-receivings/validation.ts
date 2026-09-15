import type { MasterDataFormErrors } from '@/features/master-data/types'
import { normalizeOptionalText } from '@/features/master-data/utils'
import type {
  GoodsReceivingFormValues,
  GoodsReceivingItemFormValues,
} from '@/features/goods-receivings/types'

export function createEmptyReceivingItem(): GoodsReceivingItemFormValues {
  return {
    clientId:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    rawMaterialId: '',
    rawMaterialCode: '',
    rawMaterialName: '',
    internalLot: '',
    unitOfMeasureId: '',
    unitOfMeasureCode: '',
    unitOfMeasureName: '',
    hasExpiry: false,
    quantity: '',
    supplierLot: '',
    productionDate: '',
    expiryDate: '',
    notes: '',
  }
}

export const emptyGoodsReceivingFormValues: GoodsReceivingFormValues = {
  supplierId: '',
  warehouseId: '',
  receivingDate: '',
  notes: '',
  items: [createEmptyReceivingItem()],
}

export function normalizeGoodsReceivingItemValues(
  item: GoodsReceivingItemFormValues,
): GoodsReceivingItemFormValues {
  return {
    ...item,
    quantity: item.quantity.trim(),
    supplierLot: normalizeOptionalText(item.supplierLot) ?? '',
    productionDate: item.productionDate.trim(),
    expiryDate: item.hasExpiry ? item.expiryDate.trim() : '',
    notes: normalizeOptionalText(item.notes) ?? '',
  }
}

export function normalizeGoodsReceivingFormValues(
  values: GoodsReceivingFormValues,
): GoodsReceivingFormValues {
  return {
    supplierId: values.supplierId,
    warehouseId: values.warehouseId,
    receivingDate: values.receivingDate.trim(),
    notes: normalizeOptionalText(values.notes) ?? '',
    items: values.items.map(normalizeGoodsReceivingItemValues),
  }
}

export function validateGoodsReceivingForm(
  values: GoodsReceivingFormValues,
): MasterDataFormErrors {
  const errors: MasterDataFormErrors = {}
  const normalized = normalizeGoodsReceivingFormValues(values)

  if (!normalized.supplierId) {
    errors.supplierId = ['Supplier wajib dipilih.']
  }

  if (!normalized.warehouseId) {
    errors.warehouseId = ['Warehouse wajib dipilih.']
  }

  if (!normalized.receivingDate) {
    errors.receivingDate = ['Receiving date wajib diisi.']
  }

  if (normalized.notes.length > 500) {
    errors.notes = ['Notes maksimal 500 karakter.']
  }

  if (normalized.items.length === 0) {
    errors.items = ['Goods receiving minimal memiliki satu item.']
  }

  normalized.items.forEach((item, index) => {
    if (!item.rawMaterialId) {
      errors[`items[${index}].rawMaterialId`] = ['Raw material wajib dipilih.']
    }

    if (!item.quantity) {
      errors[`items[${index}].quantity`] = ['Quantity wajib diisi.']
    } else {
      const quantity = Number(item.quantity)
      if (Number.isNaN(quantity)) {
        errors[`items[${index}].quantity`] = ['Quantity harus berupa angka.']
      } else if (quantity <= 0) {
        errors[`items[${index}].quantity`] = ['Quantity harus lebih besar dari 0.']
      }
    }

    if (!item.unitOfMeasureId) {
      errors[`items[${index}].unitOfMeasureId`] = ['UOM wajib terisi dari raw material.']
    }

    if (item.supplierLot.length > 100) {
      errors[`items[${index}].supplierLot`] = ['Supplier LOT maksimal 100 karakter.']
    }

    if (item.notes.length > 500) {
      errors[`items[${index}].notes`] = ['Notes item maksimal 500 karakter.']
    }

    if (item.hasExpiry && !item.expiryDate) {
      errors[`items[${index}].expiryDate`] = ['Expiry date wajib diisi untuk material ini.']
    }

    if (item.productionDate && item.expiryDate && item.productionDate > item.expiryDate) {
      errors[`items[${index}].productionDate`] = [
        'Production date harus lebih awal atau sama dengan expiry date.',
      ]
    }
  })

  return errors
}
