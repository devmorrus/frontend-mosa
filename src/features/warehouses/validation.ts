import type { MasterDataFormErrors } from '@/features/master-data/types'
import { normalizeText } from '@/features/master-data/utils'
import type { WarehouseFormValues } from '@/features/warehouses/types'

export const emptyWarehouseFormValues: WarehouseFormValues = {
  code: '',
  name: '',
  isActive: true,
}

export function normalizeWarehouseFormValues(values: WarehouseFormValues): WarehouseFormValues {
  return {
    code: normalizeText(values.code),
    name: normalizeText(values.name),
    isActive: values.isActive,
  }
}

export function validateWarehouseForm(values: WarehouseFormValues): MasterDataFormErrors {
  const errors: MasterDataFormErrors = {}
  const normalized = normalizeWarehouseFormValues(values)

  if (normalized.code.length < 2 || normalized.code.length > 50) {
    errors.code = ['Kode warehouse harus 2-50 karakter.']
  }

  if (normalized.name.length < 2 || normalized.name.length > 150) {
    errors.name = ['Nama warehouse harus 2-150 karakter.']
  }

  return errors
}
