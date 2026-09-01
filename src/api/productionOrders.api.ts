import { apiClient } from '@/api/client'
import { mapPaginatedResponse } from '@/api/master-data.shared'
import type {
  ProductionOrderDetail,
  ProductionOrderFormValues,
  ProductionOrderListItem,
  ProductionOrderQueryState,
  RecipeVersionOption,
} from '@/features/production-orders/types'
import {
  normalizeProductionOrderFormValues,
} from '@/features/production-orders/validation'
import type { ApiPaginatedResponse } from '@/types/api'
import type { MasterDataPagination } from '@/features/master-data/types'
import type { ProductListItem } from '@/features/products/types'
import type { WarehouseListItem } from '@/features/warehouses/types'
import type { UserListItem } from '@/features/users/types'
import type {
  ConsumeMaterialResponse,
  OperatorProductionDetail,
  OperatorProductionQueueItem,
  ValidatedMaterialLot,
} from '@/features/operator-production/types'

function toStatusParam(status: ProductionOrderQueryState['status']) {
  return status === 'ALL' ? undefined : status
}

function toUtcDateString(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toISOString()
}

function toNullableGuid(value: string) {
  const trimmed = value.trim()
  return trimmed || null
}

export const productionOrdersApi = {
  list: (
    query: ProductionOrderQueryState,
  ): Promise<{ items: ProductionOrderListItem[]; pagination: MasterDataPagination }> =>
    apiClient
      .get<ApiPaginatedResponse<ProductionOrderListItem>>('/production-orders', {
        params: {
          search: query.search || undefined,
          status: toStatusParam(query.status),
          page: query.page,
          pageSize: query.pageSize,
        },
      })
      .then((response) => mapPaginatedResponse(response.data)),

  getById: (id: string): Promise<ProductionOrderDetail> =>
    apiClient
      .get<ProductionOrderDetail>(`/production-orders/${id}`)
      .then((response) => response.data),

  create: (values: ProductionOrderFormValues): Promise<ProductionOrderDetail> => {
    const normalized = normalizeProductionOrderFormValues(values)

    return apiClient
      .post<ProductionOrderDetail>('/production-orders', {
        productId: normalized.productId,
        recipeVersionId: normalized.recipeVersionId,
        warehouseId: normalized.warehouseId,
        targetOutput: Number(normalized.targetOutput),
        unitOfMeasureId: normalized.unitOfMeasureId,
        scheduledDate: normalized.scheduledDate
          ? toUtcDateString(normalized.scheduledDate)
          : null,
        assignedOperatorId: toNullableGuid(normalized.assignedOperatorId),
      })
      .then((response) => response.data)
  },

  updateDraft: (
    id: string,
    values: ProductionOrderFormValues,
  ): Promise<ProductionOrderDetail> => {
    const normalized = normalizeProductionOrderFormValues(values)

    return apiClient
      .put<ProductionOrderDetail>(`/production-orders/${id}`, {
        productId: normalized.productId,
        recipeVersionId: normalized.recipeVersionId,
        warehouseId: normalized.warehouseId,
        targetOutput: Number(normalized.targetOutput),
        unitOfMeasureId: normalized.unitOfMeasureId,
        scheduledDate: normalized.scheduledDate
          ? toUtcDateString(normalized.scheduledDate)
          : null,
        assignedOperatorId: toNullableGuid(normalized.assignedOperatorId),
      })
      .then((response) => response.data)
  },

  cancel: (id: string, reason: string): Promise<ProductionOrderDetail> =>
    apiClient
      .post<ProductionOrderDetail>(`/production-orders/${id}/cancel`, {
        reason: reason.trim(),
      })
      .then((response) => response.data),

  checkMaterials: (
    id: string,
  ): Promise<{
    productionOrderId: string
    productionOrderNumber: string
    status: number
    materials: Array<{
      rawMaterialId: string
      rawMaterialCode: string
      rawMaterialName: string
      scaledRequiredQuantity: number
      availableQuantity: number
      shortageQuantity: number
      isSufficient: boolean
      unitOfMeasure: { id: string; code: string; name: string; symbol: string | null }
    }>
  }> =>
    apiClient
      .post(`/production-orders/${id}/check-materials`)
      .then((response) => response.data),

  release: (id: string): Promise<ProductionOrderDetail> =>
    apiClient
      .post<ProductionOrderDetail>(`/production-orders/${id}/release`)
      .then((response) => response.data),

  getMyQueue: (
    page: number,
    pageSize: number,
  ): Promise<{ items: OperatorProductionQueueItem[]; pagination: MasterDataPagination }> =>
    apiClient
      .get<ApiPaginatedResponse<OperatorProductionQueueItem>>('/production-orders/my-queue', {
        params: { page, pageSize },
      })
      .then((response) => mapPaginatedResponse(response.data)),

  getMyQueueDetail: (id: string): Promise<OperatorProductionDetail> =>
    apiClient
      .get<OperatorProductionDetail>(`/production-orders/my-queue/${id}`)
      .then((response) => response.data),

  startProduction: (id: string): Promise<ProductionOrderDetail> =>
    apiClient
      .post<ProductionOrderDetail>(`/production-orders/${id}/start`)
      .then((response) => response.data),

  startStep: (orderId: string, stepId: string) =>
    apiClient.post(`/production-orders/${orderId}/steps/${stepId}/start`),

  startTimer: (orderId: string, stepId: string) =>
    apiClient.post(`/production-orders/${orderId}/steps/${stepId}/timer/start`),

  completeStep: (
    orderId: string,
    stepId: string,
    payload: { confirmed?: boolean; notes?: string },
  ) => apiClient.post(`/production-orders/${orderId}/steps/${stepId}/complete`, payload),

  consumeMaterial: (
    orderId: string,
    stepId: string,
    payload: {
      lots: Array<{ rawMaterialLotId: string; actualQuantity: number }>
    },
    idempotencyKey: string,
  ): Promise<ConsumeMaterialResponse> =>
    apiClient
      .post<ConsumeMaterialResponse>(
        `/production-orders/${orderId}/steps/${stepId}/consume`,
        payload,
        { headers: { 'Idempotency-Key': idempotencyKey } },
      )
      .then((response) => response.data),

  createDeviationRequest: (
    orderId: string,
    stepId: string,
    payload: { lots: Array<{ rawMaterialLotId: string; actualQuantity: number }>; reason: string },
    idempotencyKey: string,
  ) => apiClient.post(`/production-orders/${orderId}/steps/${stepId}/deviations`, { ...payload, reason: payload.reason.trim() }, { headers: { 'Idempotency-Key': idempotencyKey } }).then((response) => response.data),

  validateMaterialLot: (orderId: string, stepId: string, payload: { qrToken?: string; rawMaterialLotId?: string }): Promise<ValidatedMaterialLot> =>
    apiClient.post<{ isValid: boolean; validationMessage: string; lotId: string | null; internalLotNumber: string | null; rawMaterialName: string | null; availableQuantity: number | null }>(`/production-orders/${orderId}/steps/${stepId}/validate-lot`, payload)
      .then((response) => {
        const result = response.data
        if (!result.isValid || !result.lotId || !result.internalLotNumber || result.availableQuantity === null) throw new Error(result.validationMessage)
        return { lotId: result.lotId, lotNumber: result.internalLotNumber, materialName: result.rawMaterialName ?? '', availableQuantity: result.availableQuantity, actualQuantity: '' }
      }),

  listActiveProducts: (): Promise<ProductListItem[]> =>
    apiClient
      .get<ApiPaginatedResponse<ProductListItem>>('/products', {
        params: { status: 'ACTIVE', page: 1, pageSize: 100 },
      })
      .then((response) => response.data.items),

  listActiveWarehouses: (): Promise<WarehouseListItem[]> =>
    apiClient
      .get<ApiPaginatedResponse<WarehouseListItem>>('/warehouses', {
        params: { status: 'ACTIVE', page: 1, pageSize: 100 },
      })
      .then((response) => response.data.items),

  listActiveUsers: (): Promise<UserListItem[]> =>
    apiClient
      .get<ApiPaginatedResponse<UserListItem>>('/users', {
        params: { isActive: true, page: 1, pageSize: 100 },
      })
      .then((response) => response.data.items),

  listRecipesByProduct: (productId: string): Promise<Array<{
    id: string
    name: string
    status: number
    currentVersion: { id: string; versionNumber: number; standardOutputQuantity: number; unitOfMeasure: { id: string; code: string; name: string; symbol: string | null } } | null
  }>> =>
    apiClient
      .get<ApiPaginatedResponse<{
        id: string
        name: string
        status: number
        currentVersion: { id: string; versionNumber: number; standardOutputQuantity: number; unitOfMeasure: { id: string; code: string; name: string; symbol: string | null } } | null
      }>>('/recipes', {
        params: { productId, page: 1, pageSize: 100 },
      })
      .then((response) => response.data.items),

  listApprovedRecipeVersions: (
    recipeId: string,
  ): Promise<RecipeVersionOption[]> =>
    apiClient
      .get<ApiPaginatedResponse<{
        id: string
        versionNumber: number
        standardOutputQuantity: number
        status: number
        unitOfMeasure: { id: string; code: string; name: string; symbol: string | null }
      }>>(`/recipes/${recipeId}/versions`, {
        params: { status: 'APPROVED', page: 1, pageSize: 100 },
      })
      .then((response) =>
        response.data.items.map((v) => ({
          id: v.id,
          recipeId,
          recipeName: '',
          versionNumber: v.versionNumber,
          standardOutputQuantity: v.standardOutputQuantity,
          unitOfMeasure: v.unitOfMeasure,
        })),
      ),
}
