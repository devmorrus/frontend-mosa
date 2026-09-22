import { apiClient } from '@/api/client'
import { mapPaginatedResponse } from '@/api/master-data.shared'
import type { ApiPaginatedResponse } from '@/types/api'
import type { QcGlobalHistoryItem, QcHistoryItem, QcInspection, QcNcr, QcPaged, QcParameterAdmin, QcParameterFormValues, QcQuery, QcQueueItem, QcResultInput } from '@/features/quality-control/types'

export const qcApi = {
  list: (query: QcQuery): Promise<QcPaged<QcQueueItem>> => apiClient.get<ApiPaginatedResponse<QcQueueItem>>('/qc/queue', { params: { search: query.search.trim() || undefined, productId: query.productId.trim() || undefined, productionOrderId: query.productionOrderId.trim() || undefined, status: query.status || undefined, productionDateFrom: query.from || undefined, productionDateTo: query.to || undefined, page: query.page, pageSize: query.pageSize } }).then((response) => mapPaginatedResponse(response.data)),
  getInspection: (id: string) => apiClient.get<QcInspection>(`/qc/finished-goods/${id}`).then((response) => response.data),
  history: (id: string, page = 1, pageSize = 10): Promise<QcPaged<QcHistoryItem>> => apiClient.get<ApiPaginatedResponse<QcHistoryItem>>(`/qc/finished-goods/${id}/history`, { params: { page, pageSize } }).then((response) => mapPaginatedResponse(response.data)),
  listHistory: (query: { search: string; productId: string; status: string; page: number; pageSize: number }): Promise<QcPaged<QcGlobalHistoryItem>> => apiClient.get<ApiPaginatedResponse<QcGlobalHistoryItem>>('/qc/history', { params: { search: query.search || undefined, productId: query.productId || undefined, status: query.status || undefined, page: query.page, pageSize: query.pageSize } }).then((response) => mapPaginatedResponse(response.data)),
  inspect: (id: string, items: QcResultInput[]) => apiClient.post(`/qc/finished-goods/${id}/inspect`, { items }).then((response) => response.data),
  decide: (id: string, decision: 'pass' | 'hold' | 'reject', notes: string | null, items: QcResultInput[]) => apiClient.post(`/qc/finished-goods/${id}/${decision}`, { notes, items }).then((response) => response.data),
  listParameters: (query: { search: string; productId: string; status: string; page: number; pageSize: number }): Promise<QcPaged<QcParameterAdmin>> => apiClient.get<ApiPaginatedResponse<QcParameterAdmin>>('/qc/parameters', { params: { search: query.search || undefined, productId: query.productId || undefined, status: query.status || undefined, page: query.page, pageSize: query.pageSize } }).then((response) => mapPaginatedResponse(response.data)),
  createParameter: (values: QcParameterFormValues) => apiClient.post<QcParameterAdmin>('/qc/parameters', toParameterPayload(values)).then((response) => response.data),
  updateParameter: (id: string, values: QcParameterFormValues) => apiClient.put<QcParameterAdmin>(`/qc/parameters/${id}`, toParameterPayload(values)).then((response) => response.data),
  changeParameterStatus: (id: string, isActive: boolean) => apiClient.patch<QcParameterAdmin>(`/qc/parameters/${id}/status`, { isActive }).then((response) => response.data),
  listNcrs: (query: { search: string; status: string; page: number; pageSize: number }): Promise<QcPaged<QcNcr>> => apiClient.get<ApiPaginatedResponse<QcNcr>>('/qc/ncr', { params: { search: query.search || undefined, status: query.status || undefined, page: query.page, pageSize: query.pageSize } }).then((response) => mapPaginatedResponse(response.data)),
  createNcr: (values: { finishedGoodsLotId: string; title: string; description: string; assignedTo: string; dueDate: string }) => apiClient.post<QcNcr>('/qc/ncr', { finishedGoodsLotId: values.finishedGoodsLotId, title: values.title.trim(), description: values.description.trim(), assignedTo: values.assignedTo.trim() || null, dueDate: toUtcDateOrNull(values.dueDate) }).then((response) => response.data),
  updateNcr: (id: string, values: { title: string; description: string; rootCause: string; correctiveAction: string; preventiveAction: string; assignedTo: string; dueDate: string; status: number }) => apiClient.put<QcNcr>(`/qc/ncr/${id}`, { title: values.title.trim(), description: values.description.trim(), rootCause: values.rootCause.trim() || null, correctiveAction: values.correctiveAction.trim() || null, preventiveAction: values.preventiveAction.trim() || null, assignedTo: values.assignedTo.trim() || null, dueDate: toUtcDateOrNull(values.dueDate), status: values.status }).then((response) => response.data),
  reopenNcr: (id: string, reason: string) => apiClient.post<QcNcr>(`/qc/ncr/${id}/reopen`, { reason: reason.trim() }).then((response) => response.data),
}

function toUtcDateOrNull(value: string) {
  const trimmed = value.trim()
  return trimmed ? new Date(`${trimmed}T00:00:00.000Z`).toISOString() : null
}

function toParameterPayload(values: QcParameterFormValues) {
  return { productId: values.productId, name: values.name.trim(), description: values.description.trim() || null, resultType: Number(values.resultType), isRequired: values.isRequired, sequence: Number(values.sequence), configJson: values.configJson.trim() || null }
}
