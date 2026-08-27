import type { MasterDataFormErrors } from '@/features/master-data/types'
import { normalizeOptionalText, normalizeText } from '@/features/master-data/utils'
import type { UnitOfMeasureFormValues } from '@/features/unit-of-measures/types'

export const emptyUnitOfMeasureFormValues: UnitOfMeasureFormValues = {
  code: '',
  name: '',
  symbol: '',
  isActive: true,
}

export function normalizeUnitOfMeasureFormValues(
  values: UnitOfMeasureFormValues,
): UnitOfMeasureFormValues {
  return {
    code: normalizeText(values.code),
    name: normalizeText(values.name),
    symbol: normalizeOptionalText(values.symbol) ?? '',
    isActive: values.isActive,
  }
}

export function validateUnitOfMeasureForm(
  values: UnitOfMeasureFormValues,
): MasterDataFormErrors {
  const errors: MasterDataFormErrors = {}
  const normalized = normalizeUnitOfMeasureFormValues(values)

  if (normalized.code.length < 1 || normalized.code.length > 20) {
    errors.code = ['Kode unit harus 1-20 karakter.']
  }

  if (normalized.name.length < 2 || normalized.name.length > 150) {
    errors.name = ['Nama unit harus 2-150 karakter.']
  }

  if (normalized.symbol.length > 20) {
    errors.symbol = ['Simbol maksimal 20 karakter.']
  }

  return errors
}
