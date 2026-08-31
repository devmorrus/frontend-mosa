import type { MasterDataFormErrors } from '@/features/master-data/types'
import { normalizeText } from '@/features/master-data/utils'
import type { UserFormValues } from '@/features/users/types'

export const emptyUserFormValues: UserFormValues = {
  username: '',
  fullName: '',
  password: '',
  roleIds: [],
  isActive: true,
}

export function normalizeUserFormValues(values: UserFormValues): UserFormValues {
  return {
    username: normalizeText(values.username),
    fullName: normalizeText(values.fullName),
    password: values.password,
    roleIds: [...new Set(values.roleIds)],
    isActive: values.isActive,
  }
}

export function validateUserForm(
  values: UserFormValues,
  mode: 'create' | 'edit',
): MasterDataFormErrors {
  const errors: MasterDataFormErrors = {}
  const normalized = normalizeUserFormValues(values)

  if (normalized.username.length < 3 || normalized.username.length > 50) {
    errors.username = ['Username harus 3-50 karakter.']
  } else if (!/^[A-Za-z0-9_.]+$/.test(normalized.username)) {
    errors.username = ['Username hanya boleh huruf, angka, underscore, dan titik.']
  }

  if (normalized.fullName.length < 3 || normalized.fullName.length > 150) {
    errors.fullName = ['Nama lengkap harus 3-150 karakter.']
  }

  if (mode === 'create') {
    if (normalized.password.length === 0) {
      errors.password = ['Password wajib diisi.']
    } else if (normalized.password.length < 8 || normalized.password.length > 128) {
      errors.password = ['Password harus 8-128 karakter.']
    } else if (!/[A-Za-z]/.test(normalized.password)) {
      errors.password = ['Password harus mengandung minimal satu huruf.']
    } else if (!/[0-9]/.test(normalized.password)) {
      errors.password = ['Password harus mengandung minimal satu angka.']
    }
  }

  return errors
}

export function validatePasswordForm(password: string): MasterDataFormErrors {
  const errors: MasterDataFormErrors = {}

  if (password.length === 0) {
    errors.password = ['Password wajib diisi.']
  } else if (password.length < 8 || password.length > 128) {
    errors.password = ['Password harus 8-128 karakter.']
  } else if (!/[A-Za-z]/.test(password)) {
    errors.password = ['Password harus mengandung minimal satu huruf.']
  } else if (!/[0-9]/.test(password)) {
    errors.password = ['Password harus mengandung minimal satu angka.']
  }

  return errors
}
