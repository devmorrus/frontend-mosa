import { apiClient } from '@/api/client'
import type {
  CreateStockOpnamePayload,
  StockOpnameDetail,
  StockOpnameListItem,
  StockOpnameQueryState,
  UpdateStockOpnameCountPayload,
} from '@/features/stock-opname/types'
import { normalizeStockOpnameQuery } from '@/features/stock-opname/validation'
import type { ApiPaginatedResponse } from '@/types/api'

function toStatusParam(status: StockOpnameQueryState['status']) {
  return status === 'ALL' ? undefined : status
}

export const stockOpnamesApi = {
  list: (query: StockOpnameQueryState) => {
    const normalized = normalizeStockOpnameQuery(query)
    return apiClient
      .get<ApiPaginatedResponse<StockOpnameListItem>>('/stock-opnames', {
        params: {
          search: normalized.search || undefined,
          status: toStatusParam(normalized.status),
          warehouseId: normalized.warehouseId || undefined,
          dateFrom: normalized.dateFrom || undefined,
          dateTo: normalized.dateTo || undefined,
          page: normalized.page,
          pageSize: normalized.pageSize,
        },
      })
      .then((response) => ({ items: response.data.items, pagination: response.data.pagination }))
  },

  getById: (id: string) => apiClient.get<StockOpnameDetail>(`/stock-opnames/${id}`).then((response) => response.data),

  create: (payload: CreateStockOpnamePayload) => apiClient.post<StockOpnameDetail>('/stock-opnames', payload).then((response) => response.data),

  start: (id: string) => apiClient.post<StockOpnameDetail>(`/stock-opnames/${id}/start`).then((response) => response.data),

  saveCounts: (id: string, payload: UpdateStockOpnameCountPayload) => apiClient.put<StockOpnameDetail>(`/stock-opnames/${id}/counts`, payload).then((response) => response.data),

  ready: (id: string) => apiClient.post<StockOpnameDetail>(`/stock-opnames/${id}/ready`).then((response) => response.data),

  post: (id: string) => apiClient.post<StockOpnameDetail>(`/stock-opnames/${id}/post`).then((response) => response.data),
}
