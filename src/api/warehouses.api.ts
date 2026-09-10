import { apiClient } from '@/api/client'
import { buildMasterDataParams, mapPaginatedResponse } from '@/api/master-data.shared'
import type { MasterDataQueryState } from '@/features/master-data/types'
import { normalizeWarehouseFormValues } from '@/features/warehouses/validation'
import type {
  WarehouseDetail,
  WarehouseFormValues,
  WarehouseListItem,
} from '@/features/warehouses/types'
import type { ApiPaginatedResponse } from '@/types/api'
import type { MasterDataStatusFilter } from '@/features/master-data/types'

function toStatusParam(status: MasterDataStatusFilter) {
  return status === 'ALL' ? undefined : status
}

export const warehousesApi = {
  list: (query: MasterDataQueryState) =>
    apiClient
      .get<ApiPaginatedResponse<WarehouseListItem>>('/warehouses', {
        params: buildMasterDataParams(query),
      })
      .then((response) => mapPaginatedResponse(response.data)),

  listOptions: (status: MasterDataStatusFilter = 'ALL') =>
    apiClient
      .get<ApiPaginatedResponse<WarehouseListItem>>('/warehouses', {
        params: {
          status: toStatusParam(status),
          page: 1,
          pageSize: 100,
        },
        skipForbiddenRedirect: true,
      })
      .then((response) => response.data.items),

  getById: (id: string) =>
    apiClient.get<WarehouseDetail>(`/warehouses/${id}`, { skipForbiddenRedirect: true }).then((response) => response.data),

  create: (values: WarehouseFormValues) =>
    apiClient
      .post<WarehouseDetail>('/warehouses', normalizeWarehouseFormValues(values))
      .then((response) => response.data),

  update: (id: string, values: WarehouseFormValues) =>
    apiClient
      .put<WarehouseDetail>(`/warehouses/${id}`, normalizeWarehouseFormValues(values))
      .then((response) => response.data),

  changeStatus: (id: string, isActive: boolean) =>
    apiClient
      .patch<WarehouseDetail>(`/warehouses/${id}/status`, { isActive })
      .then((response) => response.data),
}
