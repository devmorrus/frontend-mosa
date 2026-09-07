import { apiClient } from '@/api/client'
import { mapPaginatedResponse } from '@/api/master-data.shared'
import type { MasterDataListResult } from '@/features/master-data/types'
import type { RoleDetail, RoleFormValues, RoleListItem, RolesQueryState } from '@/features/roles/types'
import type { ApiPaginatedResponse } from '@/types/api'
import type { RoleLookupResponse } from '@/features/users/types'

export interface PermissionItem {
  id: string
  code: string
  name: string
  description: string | null
  module: string
  isSystem: boolean
  isActive: boolean
}

const ADMIN_ROLES_BASE = '/admin/roles'
const ADMIN_PERMS_BASE = '/admin/permissions'

export const rolesApi = {
  listOptions: async (isActive: boolean = true): Promise<RoleLookupResponse[]> => {
    const response = await apiClient.get<ApiPaginatedResponse<RoleListItem>>(ADMIN_ROLES_BASE, {
      params: { isActive, page: 1, pageSize: 100 },
    })
    return response.data.items.map((r) => ({ id: r.id, name: r.name }))
  },

  list: (query: RolesQueryState): Promise<MasterDataListResult<RoleListItem>> =>
    apiClient
      .get<ApiPaginatedResponse<RoleListItem>>(ADMIN_ROLES_BASE, {
        params: {
          search: query.search || undefined,
          isActive: query.status === 'ALL' ? undefined : query.status === 'ACTIVE',
          page: query.page,
          pageSize: query.pageSize,
        },
      })
      .then((response) => mapPaginatedResponse(response.data)),

  getById: (id: string): Promise<RoleDetail> =>
    apiClient.get<RoleDetail>(`${ADMIN_ROLES_BASE}/${id}`).then((response) => response.data),

  create: (values: RoleFormValues): Promise<RoleDetail> =>
    apiClient
      .post<RoleDetail>(ADMIN_ROLES_BASE, {
        name: values.name.trim(),
        description: values.description.trim() || null,
      })
      .then((response) => response.data),

  update: (id: string, values: RoleFormValues): Promise<RoleDetail> =>
    apiClient
      .put<RoleDetail>(`${ADMIN_ROLES_BASE}/${id}`, {
        name: values.name.trim(),
        description: values.description.trim() || null,
        isActive: values.isActive,
      })
      .then((response) => response.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`${ADMIN_ROLES_BASE}/${id}`).then(() => undefined),

  changeStatus: (id: string, isActive: boolean): Promise<void> => {
    const endpoint = isActive ? 'activate' : 'deactivate'
    return apiClient.patch(`${ADMIN_ROLES_BASE}/${id}/${endpoint}`).then(() => undefined)
  },

  setPermissions: (id: string, permissionIds: string[]): Promise<RoleDetail> =>
    apiClient
      .put<RoleDetail>(`${ADMIN_ROLES_BASE}/${id}/permissions`, { permissionIds })
      .then((response) => response.data),

  listPermissions: (): Promise<PermissionItem[]> =>
    apiClient
      .get<ApiPaginatedResponse<PermissionItem>>(ADMIN_PERMS_BASE, {
        params: { page: 1, pageSize: 500 },
      })
      .then((response) => response.data.items),

  listGroupedPermissions: async (): Promise<{ module: string; permissions: PermissionItem[] }[]> => {
    const response = await apiClient.get<{ module: string; permissions: PermissionItem[] }[]>(`${ADMIN_PERMS_BASE}/grouped`)
    return response.data
  },
}
