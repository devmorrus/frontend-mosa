import { apiClient } from '@/api/client'
import { buildMasterDataParams, mapPaginatedResponse } from '@/api/master-data.shared'
import type { MasterDataListResult, MasterDataStatusFilter } from '@/features/master-data/types'
import { toStatusQuery } from '@/features/master-data/utils'
import type {
  UserDetail,
  UserFormValues,
  UserListItem,
  UsersQueryState,
} from '@/features/users/types'
import type { ApiPaginatedResponse } from '@/types/api'
import { normalizeUserFormValues } from '@/features/users/validation'

export const usersApi = {
  list: (query: UsersQueryState): Promise<MasterDataListResult<UserListItem>> =>
    apiClient
      .get<ApiPaginatedResponse<UserListItem>>('/Users', {
        params: {
          search: query.search || undefined,
          isActive: toStatusQuery(query.status),
          page: query.page,
          pageSize: query.pageSize,
        },
      })
      .then((response) => mapPaginatedResponse(response.data)),

  getById: (id: string): Promise<UserDetail> =>
    apiClient.get<UserDetail>(`/Users/${id}`).then((response) => response.data),

  create: (values: UserFormValues): Promise<UserDetail> => {
    const normalized = normalizeUserFormValues(values)
    return apiClient
      .post<UserDetail>('/Users', {
        username: normalized.username,
        fullName: normalized.fullName,
        password: normalized.password,
        roleIds: normalized.roleIds,
      })
      .then((response) => response.data)
  },

  update: (id: string, values: UserFormValues): Promise<UserDetail> => {
    const normalized = normalizeUserFormValues(values)
    return apiClient
      .put<UserDetail>(`/Users/${id}`, {
        username: normalized.username,
        fullName: normalized.fullName,
      })
      .then((response) => response.data)
  },

  changeStatus: (id: string, isActive: boolean): Promise<void> => {
    const endpoint = isActive ? 'activate' : 'deactivate'
    return apiClient.patch(`/Users/${id}/${endpoint}`).then(() => undefined)
  },

  assignRoles: (id: string, roleIds: string[]): Promise<UserDetail> =>
    apiClient
      .put<UserDetail>(`/Users/${id}/roles`, { roleIds })
      .then((response) => response.data),

  changePassword: (id: string, newPassword: string): Promise<void> =>
    apiClient.put(`/Users/${id}/password`, { newPassword }).then(() => undefined),
}
