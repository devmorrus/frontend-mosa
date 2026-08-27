import { apiClient } from '@/api/client'
import { buildMasterDataParams, mapPaginatedResponse } from '@/api/master-data.shared'
import type { MasterDataQueryState } from '@/features/master-data/types'
import {
  normalizeUnitOfMeasureFormValues,
} from '@/features/unit-of-measures/validation'
import type {
  UnitOfMeasureDetail,
  UnitOfMeasureFormValues,
  UnitOfMeasureListItem,
} from '@/features/unit-of-measures/types'
import type { ApiPaginatedResponse } from '@/types/api'

export const unitOfMeasuresApi = {
  list: (query: MasterDataQueryState) =>
    apiClient
      .get<ApiPaginatedResponse<UnitOfMeasureListItem>>('/unit-of-measures', {
        params: buildMasterDataParams(query),
      })
      .then((response) => mapPaginatedResponse(response.data)),

  getById: (id: string) =>
    apiClient.get<UnitOfMeasureDetail>(`/unit-of-measures/${id}`).then((response) => response.data),

  create: (values: UnitOfMeasureFormValues) => {
    const normalized = normalizeUnitOfMeasureFormValues(values)

    return apiClient
      .post<UnitOfMeasureDetail>('/unit-of-measures', {
        ...normalized,
        symbol: normalized.symbol || null,
      })
      .then((response) => response.data)
  },

  update: (id: string, values: UnitOfMeasureFormValues) => {
    const normalized = normalizeUnitOfMeasureFormValues(values)

    return apiClient
      .put<UnitOfMeasureDetail>(`/unit-of-measures/${id}`, {
        ...normalized,
        symbol: normalized.symbol || null,
      })
      .then((response) => response.data)
  },

  changeStatus: (id: string, isActive: boolean) =>
    apiClient
      .patch<UnitOfMeasureDetail>(`/unit-of-measures/${id}/status`, { isActive })
      .then((response) => response.data),
}
