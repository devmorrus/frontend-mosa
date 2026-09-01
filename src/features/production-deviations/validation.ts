import { PAGE_SIZE_OPTIONS } from '@/features/master-data/utils'
import type { ProductionDeviationQueryState } from './types'

export const DEFAULT_DEVIATION_QUERY: ProductionDeviationQueryState = { status: 'PENDING_APPROVAL', productionOrderId: '', productId: '', requestedAtFrom: '', requestedAtTo: '', search: '', sortBy: 'requestedAt', sortDir: 'desc', page: 1, pageSize: 10 }

export function normalizeDeviationQuery(query: ProductionDeviationQueryState) {
  const pageSize = PAGE_SIZE_OPTIONS.includes(query.pageSize) ? query.pageSize : 10
  return { ...query, productionOrderId: query.productionOrderId.trim(), productId: query.productId.trim(), search: query.search.trim(), page: Math.max(1, query.page), pageSize, requestedAtFrom: query.requestedAtFrom.trim(), requestedAtTo: query.requestedAtTo.trim() }
}

export function validateDeviationQuery(query: ProductionDeviationQueryState) {
  const normalized = normalizeDeviationQuery(query)
  if (normalized.requestedAtFrom && normalized.requestedAtTo && normalized.requestedAtFrom > normalized.requestedAtTo) return 'Tanggal akhir tidak boleh sebelum tanggal awal.'
  return null
}

export function validateRejectReason(value: string) {
  const reason = value.trim()
  if (!reason) return 'Rejection Reason wajib diisi.'
  if (reason.length > 2000) return 'Rejection Reason maksimal 2000 karakter.'
  return null
}

export function validateReviewNotes(value: string) {
  return value.trim().length > 2000 ? 'Review notes maksimal 2000 karakter.' : null
}

export function toRequestedAtFrom(value: string) { return value ? new Date(`${value}T00:00:00`).toISOString() : undefined }
export function toRequestedAtTo(value: string) { return value ? new Date(`${value}T23:59:59.999`).toISOString() : undefined }
