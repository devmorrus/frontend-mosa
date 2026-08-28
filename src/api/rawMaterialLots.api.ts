import { apiClient } from '@/api/client'
import type {
  RawMaterialLotDetail,
  RawMaterialLotLabel,
  RawMaterialLotListItem,
  RawMaterialLotQr,
  RawMaterialLotQueryState,
} from '@/features/raw-material-lots/types'
import { normalizeRawMaterialLotQuery } from '@/features/raw-material-lots/validation'
import type { ApiPaginatedResponse } from '@/types/api'

function toStatusParam(status: RawMaterialLotQueryState['status']) {
  return status === 'ALL' ? undefined : status
}

export const rawMaterialLotsApi = {
  list: (query: RawMaterialLotQueryState) => {
    const normalized = normalizeRawMaterialLotQuery(query)

    return apiClient
      .get<ApiPaginatedResponse<RawMaterialLotListItem>>('/raw-material-lots', {
        params: {
          search: normalized.search || undefined,
          rawMaterialId: normalized.rawMaterialId || undefined,
          supplierId: normalized.supplierId || undefined,
          warehouseId: normalized.warehouseId || undefined,
          status: toStatusParam(normalized.status),
          expiryFrom: normalized.expiryFrom || undefined,
          expiryTo: normalized.expiryTo || undefined,
          receivedDateFrom: normalized.receivedDateFrom || undefined,
          receivedDateTo: normalized.receivedDateTo || undefined,
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
    apiClient.get<RawMaterialLotDetail>(`/raw-material-lots/${id}`).then((response) => response.data),

  getByNumber: (internalLotNumber: string) =>
    apiClient
      .get<RawMaterialLotDetail>(`/raw-material-lots/by-number/${encodeURIComponent(internalLotNumber.trim())}`)
      .then((response) => response.data),

  getQr: (id: string) =>
    apiClient.get<RawMaterialLotQr>(`/raw-material-lots/${id}/qr`).then((response) => response.data),

  getLabel: (id: string) =>
    apiClient.get<RawMaterialLotLabel>(`/raw-material-lots/${id}/label`).then((response) => response.data),

  resolveQrToken: (token: string) =>
    apiClient
      .get<RawMaterialLotDetail>(`/qr/raw-material/${encodeURIComponent(token.trim())}`)
      .then((response) => response.data),
}
