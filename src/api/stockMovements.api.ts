import { apiClient } from '@/api/client'
import type {
  StockMovementDetail,
  StockMovementListItem,
  StockMovementQueryState,
} from '@/features/stock-movements/types'
import { normalizeStockMovementQuery } from '@/features/stock-movements/validation'
import type { ApiPaginatedResponse } from '@/types/api'

function toMovementTypeParam(movementType: StockMovementQueryState['movementType']) {
  return movementType === 'ALL' ? undefined : movementType
}

export const stockMovementsApi = {
  list: (query: StockMovementQueryState) => {
    const normalized = normalizeStockMovementQuery(query)

    return apiClient
      .get<ApiPaginatedResponse<StockMovementListItem>>('/inventory/stock-movements', {
        params: {
          warehouseId: normalized.warehouseId || undefined,
          rawMaterialId: normalized.rawMaterialId || undefined,
          rawMaterialLotId: normalized.rawMaterialLotId || undefined,
          movementType: toMovementTypeParam(normalized.movementType),
          dateFrom: normalized.dateFrom || undefined,
          dateTo: normalized.dateTo || undefined,
          reference: normalized.reference || undefined,
          page: normalized.page,
          pageSize: normalized.pageSize,
        },
      })
      .then((response) => ({
        items: response.data.items,
        pagination: response.data.pagination,
      }))
  },

  getById: (id: string) =>
    apiClient
      .get<StockMovementDetail>(`/inventory/stock-movements/${id}`)
      .then((response) => response.data),
}
