import type { MasterDataFormErrors } from '@/features/master-data/types'
import { normalizeText } from '@/features/master-data/utils'
import type { MenuFormValues } from '@/features/menus/types'

export const emptyMenuFormValues: MenuFormValues = {
  code: '',
  name: '',
  path: '',
  icon: '',
  requiredPermissionCode: '',
  parentId: null,
  sortOrder: 0,
  isActive: true,
}

export function normalizeMenuFormValues(values: MenuFormValues): MenuFormValues {
  return {
    code: normalizeText(values.code).toLowerCase(),
    name: normalizeText(values.name),
    path: normalizeText(values.path),
    icon: normalizeText(values.icon),
    requiredPermissionCode: normalizeText(values.requiredPermissionCode),
    parentId: values.parentId,
    sortOrder: values.sortOrder,
    isActive: values.isActive,
  }
}

export function validateMenuForm(
  values: MenuFormValues,
  mode: 'create' | 'edit',
): MasterDataFormErrors {
  const errors: MasterDataFormErrors = {}
  const normalized = normalizeMenuFormValues(values)

  if (mode === 'create') {
    if (normalized.code.length === 0) {
      errors.code = ['Code wajib diisi.']
    } else if (normalized.code.length < 2 || normalized.code.length > 100) {
      errors.code = ['Code harus 2-100 karakter.']
    } else if (!/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(normalized.code)) {
      errors.code = ['Code hanya boleh huruf kecil, angka, strip, dan underscore.']
    }
  }

  if (normalized.name.length === 0) {
    errors.name = ['Nama wajib diisi.']
  } else if (normalized.name.length < 2 || normalized.name.length > 100) {
    errors.name = ['Nama harus 2-100 karakter.']
  }

  if (normalized.path.length > 0 && !normalized.path.startsWith('/')) {
    errors.path = ['Path harus dimulai dengan /']
  }

  if (normalized.icon.length > 100) {
    errors.icon = ['Icon maksimal 100 karakter.']
  }

  if (normalized.requiredPermissionCode.length > 0 &&
    !/^[a-z0-9]+(?:[-_][a-z0-9]+)*\.[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(normalized.requiredPermissionCode)) {
    errors.requiredPermissionCode = ['Format: module.action (contoh: menus.view)']
  }

  if (normalized.sortOrder < 0) {
    errors.sortOrder = ['Sort order harus >= 0.']
  }

  return errors
}
