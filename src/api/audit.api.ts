import { apiClient } from '@/api/client'
import { mapPaginatedResponse } from '@/api/master-data.shared'
import type { MasterDataListResult } from '@/features/master-data/types'
import { toUtcEnd, toUtcStart } from '@/features/audit-trail/utils'
import type { ApiPaginatedResponse } from '@/types/api'
import type { AuditDetailResponse, AuditListItem, AuditListQuery } from '@/features/audit-trail/types'

export const auditApi = {
  list(query: AuditListQuery): Promise<MasterDataListResult<AuditListItem>> {
    return apiClient
      .get<ApiPaginatedResponse<AuditListItem>>('/admin/audit-logs', {
        params: {
          search: query.search || undefined,
          userId: query.userId || undefined,
          action: query.action || undefined,
          entityType: query.entityType || undefined,
          dateFrom: query.dateFrom ? toUtcStart(query.dateFrom) : undefined,
          dateTo: query.dateTo ? toUtcEnd(query.dateTo) : undefined,
          page: query.page,
          pageSize: query.pageSize,
        },
      })
      .then((response) => mapPaginatedResponse(response.data))
  },

  getById(id: string): Promise<AuditDetailResponse> {
    return apiClient.get<AuditDetailResponse>(`/admin/audit-logs/${id}`).then((response) => response.data)
  },
}
