import { apiClient } from '@/api/client'
import { buildMasterDataParams, mapPaginatedResponse } from '@/api/master-data.shared'
import { normalizeProductFormValues } from '@/features/products/validation'
import type {
  ProductDetail,
  ProductFormValues,
  ProductListItem,
  ProductQueryState,
} from '@/features/products/types'
import type { ApiPaginatedResponse } from '@/types/api'

function toNullableNumber(value: string) {
  const trimmed = value.trim()
  return trimmed ? Number(trimmed) : null
}

export const productsApi = {
  list: (query: ProductQueryState) =>
    apiClient
      .get<ApiPaginatedResponse<ProductListItem>>('/products', {
        params: {
          ...buildMasterDataParams(query),
          unitOfMeasureId: query.unitOfMeasureId || undefined,
        },
      })
      .then((response) => mapPaginatedResponse(response.data)),

  listActiveOptions: () =>
    apiClient
      .get<ApiPaginatedResponse<ProductListItem>>('/products', {
        params: {
          status: 'ACTIVE',
          page: 1,
          pageSize: 100,
        },
        skipForbiddenRedirect: true,
      })
      .then((response) => response.data.items),

  getById: (id: string) =>
    apiClient
      .get<ProductDetail>(`/products/${id}`, { skipForbiddenRedirect: true })
      .then((response) => response.data),

  create: (values: ProductFormValues) => {
    const normalized = normalizeProductFormValues(values)

    return apiClient
      .post<ProductDetail>('/products', {
        code: normalized.code,
        name: normalized.name,
        unitOfMeasureId: normalized.unitOfMeasureId,
        shelfLifeDays: toNullableNumber(normalized.shelfLifeDays),
        isActive: normalized.isActive,
      })
      .then((response) => response.data)
  },

  update: (id: string, values: ProductFormValues) => {
    const normalized = normalizeProductFormValues(values)

    return apiClient
      .put<ProductDetail>(`/products/${id}`, {
        code: normalized.code,
        name: normalized.name,
        unitOfMeasureId: normalized.unitOfMeasureId,
        shelfLifeDays: toNullableNumber(normalized.shelfLifeDays),
        isActive: normalized.isActive,
      })
      .then((response) => response.data)
  },

  changeStatus: (id: string, isActive: boolean) =>
    apiClient
      .patch<ProductDetail>(`/products/${id}/status`, { isActive })
      .then((response) => response.data),
}
