import { apiClient } from '@/api/client'
import type { ApiPaginatedResponse } from '@/types/api'
import type { AffectedBatchItem, AffectedBatchSummary, BatchGenealogy, ForwardTraceability } from '@/features/traceability/types'

export const traceabilityApi = {
  getFinishedGoodsById: (id: string) =>
    apiClient.get<BatchGenealogy>(`/traceability/backward/finished-goods/${id}`).then((response) => response.data),

  getFinishedGoodsByLotNumber: (lotNumber: string) =>
    apiClient
      .get<BatchGenealogy>(`/traceability/backward/by-lot-number/${encodeURIComponent(lotNumber.trim())}`)
      .then((response) => response.data),

  getFinishedGoodsByQrToken: (token: string) =>
    apiClient
      .get<BatchGenealogy>(`/traceability/finished-goods/by-qr-token/${encodeURIComponent(token.trim())}`)
      .then((response) => response.data),

  getRawMaterialByLotNumber: (lotNumber: string) =>
    apiClient
      .get<ForwardTraceability>(`/traceability/forward/by-lot-number/${encodeURIComponent(lotNumber.trim())}`)
      .then((response) => response.data),

  getAffectedBatchSummary: (rawMaterialLotId: string) =>
    apiClient
      .get<AffectedBatchSummary>(`/traceability/raw-material/${rawMaterialLotId}/affected-batches`)
      .then((response) => response.data),

  getAffectedBatchPage: (rawMaterialLotId: string, page: number, pageSize = 20) =>
    apiClient
      .get<ApiPaginatedResponse<AffectedBatchItem>>(
        `/traceability/raw-material/${rawMaterialLotId}/affected-batches/paged`,
        { params: { page, pageSize } },
      )
      .then((response) => response.data),
}
