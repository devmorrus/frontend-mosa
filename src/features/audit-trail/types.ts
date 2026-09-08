export interface AuditListQuery {
  search: string
  userId: string
  action: string
  entityType: string
  dateFrom: string
  dateTo: string
  page: number
  pageSize: number
}

export interface AuditListItem {
  id: string
  occurredAtUtc: string
  userId: string | null
  username: string | null
  userFullName: string | null
  action: string
  category: string
  entityType: string
  entityId: string | null
  reference: string | null
  ipAddress: string | null
  hasChanges: boolean
  createdAtUtc: string
}

export interface AuditDetailResponse {
  id: string
  occurredAtUtc: string
  user: {
    id: string | null
    username: string | null
    fullName: string | null
  }
  action: string
  category: string
  entity: {
    entityType: string
    entityId: string | null
    reference: string | null
  }
  ipAddress: string | null
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  createdAtUtc: string
}

export interface AuditFilterErrors {
  search?: string
  userId?: string
  action?: string
  entityType?: string
  dateFrom?: string
  dateTo?: string
  pageSize?: string
}
