import type { MasterDataFormErrors } from '@/features/master-data/types'
import { normalizeText } from '@/features/master-data/utils'
import type { ProductFormValues } from '@/features/products/types'

export const emptyProductFormValues: ProductFormValues = {
  code: '',
  name: '',
  unitOfMeasureId: '',
  shelfLifeDays: '',
  isActive: true,
}

export function normalizeProductFormValues(values: ProductFormValues): ProductFormValues {
  return {
    code: normalizeText(values.code),
    name: normalizeText(values.name),
    unitOfMeasureId: values.unitOfMeasureId,
    shelfLifeDays: values.shelfLifeDays.trim(),
    isActive: values.isActive,
  }
}

export function validateProductForm(values: ProductFormValues): MasterDataFormErrors {
  const errors: MasterDataFormErrors = {}
  const normalized = normalizeProductFormValues(values)

  if (normalized.code.length < 2 || normalized.code.length > 50) {
    errors.code = ['Kode product harus 2-50 karakter.']
  }

  if (normalized.name.length < 2 || normalized.name.length > 150) {
    errors.name = ['Nama product harus 2-150 karakter.']
  }

  if (!normalized.unitOfMeasureId) {
    errors.unitOfMeasureId = ['Unit of measure wajib dipilih.']
  }

  if (normalized.shelfLifeDays) {
    const shelfLifeDays = Number(normalized.shelfLifeDays)

    if (!Number.isInteger(shelfLifeDays)) {
      errors.shelfLifeDays = ['Shelf life harus berupa bilangan bulat.']
    } else if (shelfLifeDays <= 0) {
      errors.shelfLifeDays = ['Shelf life harus lebih besar dari 0 hari.']
    }
  }

  return errors
}
