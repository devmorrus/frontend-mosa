import type {
  MasterDataFormErrors,
  MasterDataPagination,
  MasterDataQueryState,
  MasterDataStatusFilter,
} from '@/features/master-data/types'

export const DEFAULT_MASTER_DATA_QUERY: MasterDataQueryState = {
  search: '',
  status: 'ALL',
  page: 1,
  pageSize: 10,
}

export const EMPTY_PAGINATION: MasterDataPagination = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
}

export const STATUS_FILTER_OPTIONS: Array<{
  label: string
  value: MasterDataStatusFilter
}> = [
  { label: 'Semua status', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
]

export const PAGE_SIZE_OPTIONS = [10, 20, 50]

export function toStatusQuery(status: MasterDataStatusFilter): string | undefined {
  return status === 'ALL' ? undefined : status
}

export function hasFormErrors(errors: MasterDataFormErrors) {
  return Object.keys(errors).length > 0
}

export function getFieldError(errors: MasterDataFormErrors, field: string) {
  return errors[field]?.[0] ?? null
}

export function normalizeText(value: string) {
  return value.trim()
}

export function normalizeOptionalText(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
