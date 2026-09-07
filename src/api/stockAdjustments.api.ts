import { apiClient } from '@/api/client'
import type {
  CreateStockAdjustmentPayload,
  StockAdjustmentDetail,
  StockAdjustmentListItem,
  StockAdjustmentPreview,
  StockAdjustmentQueryState,
} from '@/features/stock-adjustments/types'
import { normalizeStockAdjustmentQuery } from '@/features/stock-adjustments/validation'
import type { ApiPaginatedResponse } from '@/types/api'

function toTypeParam(type: StockAdjustmentQueryState['adjustmentType']) {
  return type === 'ALL' ? undefined : type
}

export const stockAdjustmentsApi = {
  list: (query: StockAdjustmentQueryState) => {
    const normalized = normalizeStockAdjustmentQuery(query)
    return apiClient
      .get<ApiPaginatedResponse<StockAdjustmentListItem>>('/stock-adjustments', {
        params: {
          search: normalized.search || undefined,
          warehouseId: normalized.warehouseId || undefined,
          rawMaterialId: normalized.rawMaterialId || undefined,
          rawMaterialLotId: normalized.rawMaterialLotId || undefined,
          adjustmentType: toTypeParam(normalized.adjustmentType),
          dateFrom: normalized.dateFrom || undefined,
          dateTo: normalized.dateTo || undefined,
          page: normalized.page,
          pageSize: normalized.pageSize,
        },
      })
      .then((response) => ({ items: response.data.items, pagination: response.data.pagination }))
  },

  getById: (id: string) => apiClient.get<StockAdjustmentDetail>(`/stock-adjustments/${id}`).then((response) => response.data),

  preview: (payload: Omit<CreateStockAdjustmentPayload, 'reason' | 'reference'>) => apiClient.post<StockAdjustmentPreview>('/stock-adjustments/preview', payload).then((response) => response.data),

  create: (payload: CreateStockAdjustmentPayload, idempotencyKey: string) => apiClient.post<StockAdjustmentDetail>('/stock-adjustments', payload, { headers: { 'Idempotency-Key': idempotencyKey } }).then((response) => response.data),
}
