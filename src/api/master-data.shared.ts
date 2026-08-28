import type { ApiPaginatedResponse } from '@/types/api'
import type {
  MasterDataBaseQueryState,
  MasterDataListResult,
  MasterDataPagination,
} from '@/features/master-data/types'
import { toStatusQuery } from '@/features/master-data/utils'

export function buildMasterDataParams(query: MasterDataBaseQueryState) {
  return {
    search: query.search || undefined,
    status: toStatusQuery(query.status),
    page: query.page,
    pageSize: query.pageSize,
  }
}

export function mapPaginatedResponse<T>(response: ApiPaginatedResponse<T>): MasterDataListResult<T> {
  return {
    items: response.items,
    pagination: response.pagination as MasterDataPagination,
  }
}
