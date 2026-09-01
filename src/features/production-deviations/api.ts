import { apiClient } from '@/api/client'
import { mapPaginatedResponse } from '@/api/master-data.shared'
import type { ApiPaginatedResponse } from '@/types/api'
import { normalizeDeviationQuery, toRequestedAtFrom, toRequestedAtTo } from './validation'
import type { ProductionDeviationDetail, ProductionDeviationListItem, ProductionDeviationListResult, ProductionDeviationQueryState } from './types'

export const productionDeviationsApi = {
  list: (query: ProductionDeviationQueryState): Promise<ProductionDeviationListResult> => {
    const normalized = normalizeDeviationQuery(query)
    return apiClient.get<ApiPaginatedResponse<ProductionDeviationListItem>>('/production-deviations', { params: { status: normalized.status, productionOrderId: normalized.productionOrderId || undefined, productId: normalized.productId || undefined, requestedAtFrom: toRequestedAtFrom(normalized.requestedAtFrom), requestedAtTo: toRequestedAtTo(normalized.requestedAtTo), search: normalized.search || undefined, sortBy: normalized.sortBy, sortDir: normalized.sortDir, page: normalized.page, pageSize: normalized.pageSize } }).then((response) => mapPaginatedResponse(response.data))
  },
  getById: (id: string) => apiClient.get<ProductionDeviationDetail>(`/production-deviations/${id}`).then((response) => response.data),
  approve: (id: string, reviewNotes: string) => apiClient.post<ProductionDeviationDetail>(`/production-deviations/${id}/approve`, { reviewNotes: reviewNotes.trim() || null }).then((response) => response.data),
  reject: (id: string, reviewNotes: string) => apiClient.post<ProductionDeviationDetail>(`/production-deviations/${id}/reject`, { reviewNotes: reviewNotes.trim() }).then((response) => response.data),
}
