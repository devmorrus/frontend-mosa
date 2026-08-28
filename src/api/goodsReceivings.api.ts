import { apiClient } from '@/api/client'
import type {
  GoodsReceivingDetail,
  GoodsReceivingFormValues,
  GoodsReceivingListItem,
  GoodsReceivingQueryState,
} from '@/features/goods-receivings/types'
import { normalizeGoodsReceivingFormValues } from '@/features/goods-receivings/validation'
import type { ApiPaginatedResponse } from '@/types/api'

function toStatusParam(status: GoodsReceivingQueryState['status']) {
  return status === 'ALL' ? undefined : status
}

function toNullableDate(value: string) {
  const trimmed = value.trim()
  return trimmed ? toUtcDateString(trimmed) : null
}

function toUtcDateString(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toISOString()
}

export const goodsReceivingsApi = {
  list: (query: GoodsReceivingQueryState) =>
    apiClient
      .get<ApiPaginatedResponse<GoodsReceivingListItem>>('/goods-receivings', {
        params: {
          search: query.search || undefined,
          status: toStatusParam(query.status),
          supplierId: query.supplierId || undefined,
          warehouseId: query.warehouseId || undefined,
          dateFrom: query.dateFrom || undefined,
          dateTo: query.dateTo || undefined,
          page: query.page,
          pageSize: query.pageSize,
        },
      })
      .then((response) => ({
        items: response.data.items,
        pagination: response.data.pagination,
      })),

  getById: (id: string) =>
    apiClient.get<GoodsReceivingDetail>(`/goods-receivings/${id}`).then((response) => response.data),

  post: (id: string) =>
    apiClient.post<GoodsReceivingDetail>(`/goods-receivings/${id}/post`).then((response) => response.data),

  create: (values: GoodsReceivingFormValues) => {
    const normalized = normalizeGoodsReceivingFormValues(values)

    return apiClient
      .post<GoodsReceivingDetail>('/goods-receivings', {
        receivingNumber: null,
        supplierId: normalized.supplierId,
        warehouseId: normalized.warehouseId,
        receivingDate: toUtcDateString(normalized.receivingDate),
        notes: normalized.notes || null,
        items: normalized.items.map((item) => ({
          rawMaterialId: item.rawMaterialId,
          quantity: Number(item.quantity),
          unitOfMeasureId: item.unitOfMeasureId,
          supplierLot: item.supplierLot || null,
          productionDate: toNullableDate(item.productionDate),
          expiryDate: item.hasExpiry ? toNullableDate(item.expiryDate) : null,
          notes: item.notes || null,
        })),
      })
      .then((response) => response.data)
  },

  update: (id: string, values: GoodsReceivingFormValues) => {
    const normalized = normalizeGoodsReceivingFormValues(values)

    return apiClient
      .put<GoodsReceivingDetail>(`/goods-receivings/${id}`, {
        supplierId: normalized.supplierId,
        warehouseId: normalized.warehouseId,
        receivingDate: toUtcDateString(normalized.receivingDate),
        notes: normalized.notes || null,
        items: normalized.items.map((item) => ({
          rawMaterialId: item.rawMaterialId,
          quantity: Number(item.quantity),
          unitOfMeasureId: item.unitOfMeasureId,
          supplierLot: item.supplierLot || null,
          productionDate: toNullableDate(item.productionDate),
          expiryDate: item.hasExpiry ? toNullableDate(item.expiryDate) : null,
          notes: item.notes || null,
        })),
      })
      .then((response) => response.data)
  },
}
