import type { MasterDataFormErrors } from '@/features/master-data/types'
import {
  isValidEmail,
  normalizeOptionalText,
  normalizeText,
} from '@/features/master-data/utils'
import type { SupplierFormValues } from '@/features/suppliers/types'

export const emptySupplierFormValues: SupplierFormValues = {
  code: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  isActive: true,
}

export function normalizeSupplierFormValues(values: SupplierFormValues): SupplierFormValues {
  return {
    code: normalizeText(values.code),
    name: normalizeText(values.name),
    phone: normalizeOptionalText(values.phone) ?? '',
    email: normalizeOptionalText(values.email) ?? '',
    address: normalizeOptionalText(values.address) ?? '',
    isActive: values.isActive,
  }
}

export function validateSupplierForm(values: SupplierFormValues): MasterDataFormErrors {
  const errors: MasterDataFormErrors = {}
  const normalized = normalizeSupplierFormValues(values)

  if (normalized.code.length < 2 || normalized.code.length > 50) {
    errors.code = ['Kode supplier harus 2-50 karakter.']
  }

  if (normalized.name.length < 2 || normalized.name.length > 150) {
    errors.name = ['Nama supplier harus 2-150 karakter.']
  }

  if (normalized.phone.length > 50) {
    errors.phone = ['Nomor telepon maksimal 50 karakter.']
  }

  if (normalized.email.length > 150) {
    errors.email = ['Email maksimal 150 karakter.']
  } else if (normalized.email.length > 0 && !isValidEmail(normalized.email)) {
    errors.email = ['Format email tidak valid.']
  }

  if (normalized.address.length > 500) {
    errors.address = ['Alamat maksimal 500 karakter.']
  }

  return errors
}
