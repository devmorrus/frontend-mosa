import type { MasterDataFormErrors } from '@/features/master-data/types'
import { normalizeOptionalText, normalizeText } from '@/features/master-data/utils'
import type { RawMaterialFormValues } from '@/features/raw-materials/types'

export const emptyRawMaterialFormValues: RawMaterialFormValues = {
  code: '',
  name: '',
  category: '',
  unitOfMeasureId: '',
  hasExpiry: true,
  shelfLifeDays: '',
  minimumStock: '0',
  isActive: true,
}

export function normalizeRawMaterialFormValues(
  values: RawMaterialFormValues,
): RawMaterialFormValues {
  return {
    code: normalizeText(values.code),
    name: normalizeText(values.name),
    category: normalizeOptionalText(values.category) ?? '',
    unitOfMeasureId: values.unitOfMeasureId,
    hasExpiry: values.hasExpiry,
    shelfLifeDays: values.hasExpiry ? values.shelfLifeDays.trim() : '',
    minimumStock: values.minimumStock.trim(),
    isActive: values.isActive,
  }
}

export function validateRawMaterialForm(
  values: RawMaterialFormValues,
): MasterDataFormErrors {
  const errors: MasterDataFormErrors = {}
  const normalized = normalizeRawMaterialFormValues(values)

  if (normalized.code.length < 2 || normalized.code.length > 50) {
    errors.code = ['Kode material harus 2-50 karakter.']
  }

  if (normalized.name.length < 2 || normalized.name.length > 150) {
    errors.name = ['Nama material harus 2-150 karakter.']
  }

  if (normalized.category.length > 100) {
    errors.category = ['Kategori material maksimal 100 karakter.']
  }

  if (!normalized.unitOfMeasureId) {
    errors.unitOfMeasureId = ['Unit of measure wajib dipilih.']
  }

  if (!normalized.minimumStock) {
    errors.minimumStock = ['Minimum stock wajib diisi.']
  } else {
    const minimumStock = Number(normalized.minimumStock)

    if (Number.isNaN(minimumStock)) {
      errors.minimumStock = ['Minimum stock harus berupa angka.']
    } else if (minimumStock < 0) {
      errors.minimumStock = ['Minimum stock tidak boleh negatif.']
    }
  }

  if (normalized.hasExpiry) {
    if (!normalized.shelfLifeDays) {
      errors.shelfLifeDays = ['Shelf life wajib diisi saat material memiliki expiry.']
    } else {
      const shelfLifeDays = Number(normalized.shelfLifeDays)

      if (!Number.isInteger(shelfLifeDays)) {
        errors.shelfLifeDays = ['Shelf life harus berupa bilangan bulat.']
      } else if (shelfLifeDays <= 0) {
        errors.shelfLifeDays = ['Shelf life harus lebih besar dari 0 hari.']
      }
    }
  }

  return errors
}
