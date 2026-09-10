import { apiClient } from '@/api/client'
import { buildMasterDataParams, mapPaginatedResponse } from '@/api/master-data.shared'
import { normalizeRawMaterialFormValues } from '@/features/raw-materials/validation'
import type {
  RawMaterialDetail,
  RawMaterialFormValues,
  RawMaterialListItem,
  RawMaterialQueryState,
} from '@/features/raw-materials/types'
import type { ApiPaginatedResponse } from '@/types/api'

function toNullableNumber(value: string) {
  const trimmed = value.trim()
  return trimmed ? Number(trimmed) : null
}

export const rawMaterialsApi = {
  list: (query: RawMaterialQueryState) =>
    apiClient
      .get<ApiPaginatedResponse<RawMaterialListItem>>('/raw-materials', {
        params: {
          ...buildMasterDataParams(query),
          category: query.category || undefined,
          unitOfMeasureId: query.unitOfMeasureId || undefined,
          hasExpiry: query.hasExpiry === 'ALL' ? undefined : query.hasExpiry === 'YES',
        },
      })
      .then((response) => mapPaginatedResponse(response.data)),

  getById: (id: string) =>
    apiClient.get<RawMaterialDetail>(`/raw-materials/${id}`, { skipForbiddenRedirect: true }).then((response) => response.data),

  listActiveOptions: () =>
    apiClient
      .get<ApiPaginatedResponse<RawMaterialListItem>>('/raw-materials', {
        params: {
          status: 'ACTIVE',
          page: 1,
          pageSize: 100,
        },
        skipForbiddenRedirect: true,
      })
      .then((response) => response.data.items),

  create: (values: RawMaterialFormValues) => {
    const normalized = normalizeRawMaterialFormValues(values)

    return apiClient
      .post<RawMaterialDetail>('/raw-materials', {
        code: normalized.code,
        name: normalized.name,
        category: normalized.category || null,
        unitOfMeasureId: normalized.unitOfMeasureId,
        hasExpiry: normalized.hasExpiry,
        shelfLifeDays: normalized.hasExpiry ? toNullableNumber(normalized.shelfLifeDays) : null,
        minimumStock: Number(normalized.minimumStock),
        isActive: normalized.isActive,
      })
      .then((response) => response.data)
  },

  update: (id: string, values: RawMaterialFormValues) => {
    const normalized = normalizeRawMaterialFormValues(values)

    return apiClient
      .put<RawMaterialDetail>(`/raw-materials/${id}`, {
        code: normalized.code,
        name: normalized.name,
        category: normalized.category || null,
        unitOfMeasureId: normalized.unitOfMeasureId,
        hasExpiry: normalized.hasExpiry,
        shelfLifeDays: normalized.hasExpiry ? toNullableNumber(normalized.shelfLifeDays) : null,
        minimumStock: Number(normalized.minimumStock),
        isActive: normalized.isActive,
      })
      .then((response) => response.data)
  },

  changeStatus: (id: string, isActive: boolean) =>
    apiClient
      .patch<RawMaterialDetail>(`/raw-materials/${id}/status`, { isActive })
      .then((response) => response.data),
}
