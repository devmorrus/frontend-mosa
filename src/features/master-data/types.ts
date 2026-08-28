import type { ApiPaginatedResponse } from '@/types/api'

export type MasterDataStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE'

export interface MasterDataBaseQueryState {
  search: string
  status: MasterDataStatusFilter
  page: number
  pageSize: number
}

export interface MasterDataPagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface MasterDataQueryState extends MasterDataBaseQueryState {}

export interface MasterDataListResult<T> {
  items: T[]
  pagination: MasterDataPagination
}

export interface MasterDataEntityBase {
  id: string
  code: string
  name: string
  isActive: boolean
}

export interface MasterDataPermissions {
  view: string
  create: string
  update: string
}

export interface ColumnDefinition<T> {
  key: string
  header: string
  className?: string
  render: (item: T) => React.ReactNode
}

export type MasterDataFormErrors = Record<string, string[]>

export type MasterDataPagedApiResponse<T> = ApiPaginatedResponse<T>
