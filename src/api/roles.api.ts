import { apiClient } from '@/api/client'
import type { ApiPaginatedResponse } from '@/types/api'
import type { RoleLookupResponse } from '@/features/users/types'

export interface RoleListItem {
  id: string
  name: string
  description: string | null
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
}
