import { apiClient } from '@/api/client'
import { mapPaginatedResponse } from '@/api/master-data.shared'
import type { ApiPaginatedResponse } from '@/types/api'
import type { QcHistoryItem, QcInspection, QcPaged, QcQuery, QcQueueItem, QcResultInput } from '@/features/quality-control/types'

export const qcApi = {
  list: (query: QcQuery): Promise<QcPaged<QcQueueItem>> => apiClient.get<ApiPaginatedResponse<QcQueueItem>>('/qc/queue', { params: { search: query.search.trim() || undefined, productId: query.productId.trim() || undefined, productionOrderId: query.productionOrderId.trim() || undefined, status: query.status || undefined, productionDateFrom: query.from || undefined, productionDateTo: query.to || undefined, page: query.page, pageSize: query.pageSize } }).then((response) => mapPaginatedResponse(response.data)),
  getInspection: (id: string) => apiClient.get<QcInspection>(`/qc/finished-goods/${id}`).then((response) => response.data),
  history: (id: string, page = 1, pageSize = 10): Promise<QcPaged<QcHistoryItem>> => apiClient.get<ApiPaginatedResponse<QcHistoryItem>>(`/qc/finished-goods/${id}/history`, { params: { page, pageSize } }).then((response) => mapPaginatedResponse(response.data)),
  inspect: (id: string, items: QcResultInput[]) => apiClient.post(`/qc/finished-goods/${id}/inspect`, { items }).then((response) => response.data),
  decide: (id: string, decision: 'pass' | 'hold' | 'reject', notes: string | null, items: QcResultInput[]) => apiClient.post(`/qc/finished-goods/${id}/${decision}`, { notes, items }).then((response) => response.data),
}
