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

export const rolesApi = {
  listOptions: async (isActive: boolean = true): Promise<RoleLookupResponse[]> => {
    const response = await apiClient.get<ApiPaginatedResponse<RoleListItem>>('/Roles', {
      params: { isActive, page: 1, pageSize: 100 },
    })
    return response.data.items.map((r) => ({ id: r.id, name: r.name }))
  },

  list: (query: RolesQueryState): Promise<MasterDataListResult<RoleListItem>> =>
    apiClient
      .get<ApiPaginatedResponse<RoleListItem>>('/Roles', {
        params: {
          search: query.search || undefined,
          isActive: query.status === 'ALL' ? undefined : query.status === 'ACTIVE',
          page: query.page,
          pageSize: query.pageSize,
        },
      })
      .then((response) => mapPaginatedResponse(response.data)),

  getById: (id: string): Promise<RoleDetail> =>
    apiClient.get<RoleDetail>(`/Roles/${id}`).then((response) => response.data),

  create: (values: RoleFormValues): Promise<RoleDetail> =>
    apiClient
      .post<RoleDetail>('/Roles', {
        name: values.name.trim(),
        description: values.description.trim() || null,
      })
      .then((response) => response.data),

  update: (id: string, values: RoleFormValues): Promise<RoleDetail> =>
    apiClient
      .put<RoleDetail>(`/Roles/${id}`, {
        name: values.name.trim(),
        description: values.description.trim() || null,
        isActive: values.isActive,
      })
      .then((response) => response.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/Roles/${id}`).then(() => undefined),

  changeStatus: (id: string, isActive: boolean): Promise<void> => {
    const endpoint = isActive ? 'activate' : 'deactivate'
    return apiClient.patch(`/Roles/${id}/${endpoint}`).then(() => undefined)
  },

  setPermissions: (id: string, permissionIds: string[]): Promise<RoleDetail> =>
    apiClient
      .put<RoleDetail>(`/Roles/${id}/permissions`, { permissionIds })
      .then((response) => response.data),

  listPermissions: (): Promise<PermissionItem[]> =>
    apiClient
      .get<ApiPaginatedResponse<PermissionItem>>('/Permissions', {
        params: { page: 1, pageSize: 200 },
      })
      .then((response) => response.data.items),
}
