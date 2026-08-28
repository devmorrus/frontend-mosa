import { apiClient } from '@/api/client'
import type {
  InventoryRawMaterialListItem,
  InventoryRawMaterialQueryState,
} from '@/features/raw-material-inventory/types'
import { normalizeInventoryRawMaterialQuery } from '@/features/raw-material-inventory/validation'
import type { ApiPaginatedResponse } from '@/types/api'

function toStatusParam(status: InventoryRawMaterialQueryState['status']) {
  return status === 'ALL' ? undefined : status
}

export const inventoryApi = {
  listRawMaterials: (query: InventoryRawMaterialQueryState) => {
    const normalized = normalizeInventoryRawMaterialQuery(query)

    return apiClient
      .get<ApiPaginatedResponse<InventoryRawMaterialListItem>>('/inventory/raw-materials', {
        params: {
          search: normalized.search || undefined,
          warehouseId: normalized.warehouseId || undefined,
          rawMaterialId: normalized.rawMaterialId || undefined,
          status: toStatusParam(normalized.status),
          expiryFrom: normalized.expiryFrom || undefined,
          expiryTo: normalized.expiryTo || undefined,
          page: normalized.page,
          pageSize: normalized.pageSize,
        },
      })
      .then((response) => ({
        items: response.data.items,
        pagination: response.data.pagination,
      }))
  },
}
