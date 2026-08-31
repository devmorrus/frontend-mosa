import type { MasterDataPagination, MasterDataStatusFilter } from '@/features/master-data/types'
import type { PermissionItem } from '@/api/roles.api'

export interface RoleListItem {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  isActive: boolean
}

export interface RoleDetail {
  id: string
  name: string
  description: string | null
  isSystem: boolean
  isActive: boolean
  permissions: PermissionItem[]
}

export interface RoleFormValues {
  name: string
  description: string
  isActive: boolean
}

export interface RolesQueryState {
  search: string
  status: MasterDataStatusFilter
  page: number
  pageSize: number
}

export interface PermissionGroup {
  module: string
  permissions: PermissionItem[]
}
