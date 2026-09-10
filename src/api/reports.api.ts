import { apiClient } from '@/api/client'
import type { ApiPaginatedResponse } from '@/types/api'

export type ReportCode =
  | 'raw-material-stock'
  | 'lot-inventory'
  | 'goods-receiving'
  | 'material-consumption'
  | 'production'
  | 'target-vs-actual'
  | 'qc'
  | 'traceability'
  | 'yield'
  | 'stock-control'

export interface ReportQuery {
  search: string
  dateFrom: string
  dateTo: string
  expiryFrom: string
  expiryTo: string
  warehouseId: string
  materialId: string
  productId: string
  supplierId: string
  productionOrderId: string
  operatorId: string
  recipeVersionId: string
  status: string
  qcStatus: string
  internalLotNumber: string
  lotNumber: string
  lowStockOnly: boolean
  deviationOnly: boolean
  sourceType: string
  page: number
  pageSize: number
}

export type ReportRow = Record<string, unknown>

function buildParams(query: ReportQuery, includePagination = true) {
  return {
    search: query.search || undefined,
    dateFrom: query.dateFrom || undefined,
    dateTo: query.dateTo || undefined,
    expiryFrom: query.expiryFrom || undefined,
    expiryTo: query.expiryTo || undefined,
    warehouseId: query.warehouseId || undefined,
    materialId: query.materialId || undefined,
    productId: query.productId || undefined,
    supplierId: query.supplierId || undefined,
    productionOrderId: query.productionOrderId || undefined,
    operatorId: query.operatorId || undefined,
    recipeVersionId: query.recipeVersionId || undefined,
    status: query.status || undefined,
    qcStatus: query.qcStatus || undefined,
    internalLotNumber: query.internalLotNumber || undefined,
    lotNumber: query.lotNumber || undefined,
    lowStockOnly: query.lowStockOnly || undefined,
    deviationOnly: query.deviationOnly || undefined,
    sourceType: query.sourceType || undefined,
    page: includePagination ? query.page : undefined,
    pageSize: includePagination ? query.pageSize : undefined,
  }
}

export function buildReportParams(query: ReportQuery, includePagination = true) {
  return buildParams(query, includePagination)
}

export const emptyReportQuery: ReportQuery = {
  search: '',
  dateFrom: '',
  dateTo: '',
  expiryFrom: '',
  expiryTo: '',
  warehouseId: '',
  materialId: '',
  productId: '',
  supplierId: '',
  productionOrderId: '',
  operatorId: '',
  recipeVersionId: '',
  status: '',
  qcStatus: '',
  internalLotNumber: '',
  lotNumber: '',
  lowStockOnly: false,
  deviationOnly: false,
  sourceType: '',
  page: 1,
  pageSize: 20,
}

export const reportsApi = {
  list: (code: ReportCode, query: ReportQuery) =>
    apiClient
      .get<ApiPaginatedResponse<ReportRow>>(`/reports/${code}`, { params: buildParams(query) })
      .then((response) => response.data),

  export: async (code: ReportCode, query: ReportQuery, format: 'xlsx' | 'csv') => {
    const response = await apiClient.get<Blob>(`/reports/${code}/export`, {
      params: { ...buildParams(query, false), format },
      responseType: 'blob',
    })
    const disposition = response.headers['content-disposition']
    const match = typeof disposition === 'string' ? /filename="?([^";]+)"?/i.exec(disposition) : null
    const fileName = match?.[1] ?? `${code}.${format}`
    return { blob: response.data, fileName }
  },
}
