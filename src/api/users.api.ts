import { apiClient } from '@/api/client'
import { mapPaginatedResponse } from '@/api/master-data.shared'
import type { MasterDataListResult } from '@/features/master-data/types'
import { toStatusQuery } from '@/features/master-data/utils'
import type {
  UserDetail,
  UserFormValues,
  UserListItem,
  UsersQueryState,
} from '@/features/users/types'
import type { ApiPaginatedResponse } from '@/types/api'
import { normalizeUserFormValues } from '@/features/users/validation'

interface BackendRoleLookupResponse {
  id: string
  name: string
}

interface BackendUserListItemResponse {
  id: string
  username: string
  fullName: string
  email: string | null
  isActive: boolean
  status: string
  createdAtUtc: string
  updatedAtUtc: string | null
  roles: BackendRoleLookupResponse[]
}

interface BackendUserDetailResponse extends BackendUserListItemResponse {
  lastLoginAtUtc: string | null
}

function mapUserListItem(response: BackendUserListItemResponse): UserListItem {
  return {
    id: response.id,
    username: response.username,
    fullName: response.fullName,
    email: response.email,
    isActive: response.isActive,
    lastLoginAtUtc: null,
    roles: response.roles,
  }
}

function mapUserDetail(response: BackendUserDetailResponse): UserDetail {
  return {
    id: response.id,
    username: response.username,
    fullName: response.fullName,
    email: response.email,
    isActive: response.isActive,
    lastLoginAtUtc: response.lastLoginAtUtc,
    roles: response.roles,
  }
}

export const usersApi = {
  list: (query: UsersQueryState): Promise<MasterDataListResult<UserListItem>> =>
    apiClient
      .get<ApiPaginatedResponse<BackendUserListItemResponse>>('/admin/users', {
        params: {
          search: query.search || undefined,
          roleId: query.roleId || undefined,
          isActive: toStatusQuery(query.status),
          page: query.page,
          pageSize: query.pageSize,
        },
      })
      .then((response) => ({
        ...mapPaginatedResponse(response.data),
        items: response.data.items.map(mapUserListItem),
      })),

  getById: (id: string): Promise<UserDetail> =>
    apiClient
      .get<BackendUserDetailResponse>(`/admin/users/${id}`)
      .then((response) => mapUserDetail(response.data)),

  create: (values: UserFormValues): Promise<UserDetail> => {
    const normalized = normalizeUserFormValues(values)
    return apiClient
      .post<BackendUserDetailResponse>('/admin/users', {
        username: normalized.username,
        fullName: normalized.fullName,
        email: normalized.email || null,
        password: normalized.password,
        roleIds: normalized.roleIds,
        isActive: normalized.isActive,
      })
      .then((response) => mapUserDetail(response.data))
  },

  update: (id: string, values: UserFormValues): Promise<UserDetail> => {
    const normalized = normalizeUserFormValues(values)
    return apiClient
      .put<BackendUserDetailResponse>(`/admin/users/${id}`, {
        username: normalized.username,
        fullName: normalized.fullName,
        email: normalized.email || null,
        isActive: normalized.isActive,
      })
      .then((response) => mapUserDetail(response.data))
  },

  changeStatus: (id: string, isActive: boolean): Promise<void> => {
    const endpoint = isActive ? 'activate' : 'deactivate'
    return apiClient.post(`/admin/users/${id}/${endpoint}`).then(() => undefined)
  },

  assignRoles: (id: string, roleIds: string[]): Promise<UserDetail> =>
    apiClient
      .put<BackendUserDetailResponse>(`/admin/users/${id}/roles`, { roleIds })
      .then((response) => mapUserDetail(response.data)),

  changePassword: (id: string, newPassword: string): Promise<void> =>
    apiClient.post(`/admin/users/${id}/reset-password`, { newPassword }).then(() => undefined),

  revokeSessions: (id: string): Promise<void> =>
    apiClient.post(`/admin/users/${id}/revoke-sessions`).then(() => undefined),
}
