import type { MasterDataFormErrors } from '@/features/master-data/types'
import { normalizeText } from '@/features/master-data/utils'
import type { RoleFormValues } from '@/features/roles/types'

export const emptyRoleFormValues: RoleFormValues = {
  name: '',
  description: '',
  isActive: true,
}

export function normalizeRoleFormValues(values: RoleFormValues): RoleFormValues {
  return {
    name: normalizeText(values.name),
    description: normalizeText(values.description),
    isActive: values.isActive,
  }
}

export function validateRoleForm(values: RoleFormValues): MasterDataFormErrors {
  const errors: MasterDataFormErrors = {}
  const normalized = normalizeRoleFormValues(values)

  if (normalized.name.length < 3 || normalized.name.length > 100) {
    errors.name = ['Nama role harus 3-100 karakter.']
  }

  if (normalized.description.length > 300) {
    errors.description = ['Deskripsi maksimal 300 karakter.']
  }

  return errors
}
