import { apiClient } from '@/api/client'
import type { BatchGenealogy, ForwardTraceability } from '@/features/traceability/types'

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
}
