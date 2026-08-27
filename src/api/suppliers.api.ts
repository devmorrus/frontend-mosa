import { apiClient } from '@/api/client'
import { buildMasterDataParams, mapPaginatedResponse } from '@/api/master-data.shared'
import type { MasterDataQueryState } from '@/features/master-data/types'
import {
  normalizeSupplierFormValues,
} from '@/features/suppliers/validation'
import type {
  SupplierDetail,
  SupplierFormValues,
  SupplierListItem,
} from '@/features/suppliers/types'
import type { ApiPaginatedResponse } from '@/types/api'

export const suppliersApi = {
  list: (query: MasterDataQueryState) =>
    apiClient
      .get<ApiPaginatedResponse<SupplierListItem>>('/suppliers', {
        params: buildMasterDataParams(query),
      })
      .then((response) => mapPaginatedResponse(response.data)),

  getById: (id: string) =>
    apiClient.get<SupplierDetail>(`/suppliers/${id}`).then((response) => response.data),

  create: (values: SupplierFormValues) => {
    const normalized = normalizeSupplierFormValues(values)

    return apiClient
      .post<SupplierDetail>('/suppliers', {
        ...normalized,
        phone: normalized.phone || null,
        email: normalized.email || null,
        address: normalized.address || null,
      })
      .then((response) => response.data)
  },

  update: (id: string, values: SupplierFormValues) => {
    const normalized = normalizeSupplierFormValues(values)

    return apiClient
      .put<SupplierDetail>(`/suppliers/${id}`, {
        ...normalized,
        phone: normalized.phone || null,
        email: normalized.email || null,
        address: normalized.address || null,
      })
      .then((response) => response.data)
  },

  changeStatus: (id: string, isActive: boolean) =>
    apiClient
      .patch<SupplierDetail>(`/suppliers/${id}/status`, { isActive })
      .then((response) => response.data),
}
