import type { AuditFilterErrors, AuditListQuery } from './types'

const ALLOWED_PAGE_SIZES = [10, 20, 50, 100]

export function validateAuditFilters(query: AuditListQuery): AuditFilterErrors {
  const errors: AuditFilterErrors = {}

  if (query.search.length > 200) errors.search = 'Pencarian maksimal 200 karakter.'
  if (query.action.length > 100) errors.action = 'Action maksimal 100 karakter.'
  if (query.entityType.length > 100) errors.entityType = 'Entity type maksimal 100 karakter.'
  if (query.userId && query.userId.length > 200) errors.userId = 'User filter terlalu panjang.'
  if (!ALLOWED_PAGE_SIZES.includes(query.pageSize)) errors.pageSize = 'Page size tidak valid.'

  if (query.dateFrom && query.dateTo && query.dateFrom > query.dateTo) {
    errors.dateFrom = 'Date from harus lebih awal atau sama dengan date to.'
    errors.dateTo = 'Date to harus lebih akhir atau sama dengan date from.'
  }

  return errors
}
