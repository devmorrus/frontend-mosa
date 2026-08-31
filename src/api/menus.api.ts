import { apiClient } from '@/api/client'
import { mapPaginatedResponse } from '@/api/master-data.shared'
import type { MasterDataListResult } from '@/features/master-data/types'
import type { MenuFormValues, MenuListItem, MenuTreeNode, MenusQueryState } from '@/features/menus/types'
import type { ApiPaginatedResponse } from '@/types/api'

export const menusApi = {
  list: (query: MenusQueryState): Promise<MasterDataListResult<MenuListItem>> =>
    apiClient
      .get<ApiPaginatedResponse<MenuListItem>>('/Menus', {
        params: {
          includeInactive: query.includeInactive,
          page: query.page,
          pageSize: query.pageSize,
        },
      })
      .then((response) => mapPaginatedResponse(response.data)),

  tree: (includeInactive: boolean = true): Promise<MenuTreeNode[]> =>
    apiClient
      .get<MenuTreeNode[]>('/Menus/tree', {
        params: { includeInactive },
      })
      .then((response) => response.data),

  getById: (id: string): Promise<MenuListItem> =>
    apiClient.get<MenuListItem>(`/Menus/${id}`).then((response) => response.data),

  create: (values: MenuFormValues): Promise<MenuListItem> => {
    const n = normalize(values)
    return apiClient
      .post<MenuListItem>('/Menus', {
        code: n.code,
        name: n.name,
        path: n.path || null,
        icon: n.icon || null,
        requiredPermissionCode: n.requiredPermissionCode || null,
        parentId: n.parentId,
        sortOrder: n.sortOrder,
        isActive: n.isActive,
      })
      .then((response) => response.data)
  },

  update: (id: string, values: MenuFormValues): Promise<MenuListItem> => {
    const n = normalize(values)
    return apiClient
      .put<MenuListItem>(`/Menus/${id}`, {
        name: n.name,
        path: n.path || null,
        icon: n.icon || null,
        requiredPermissionCode: n.requiredPermissionCode || null,
        parentId: n.parentId,
        sortOrder: n.sortOrder,
        isActive: n.isActive,
      })
      .then((response) => response.data)
  },

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/Menus/${id}`).then(() => undefined),
}

function normalize(values: MenuFormValues) {
  return {
    code: values.code.trim().toLowerCase(),
    name: values.name.trim(),
    path: values.path.trim(),
    icon: values.icon.trim(),
    requiredPermissionCode: values.requiredPermissionCode.trim(),
    parentId: values.parentId,
    sortOrder: values.sortOrder,
    isActive: values.isActive,
  }
}
