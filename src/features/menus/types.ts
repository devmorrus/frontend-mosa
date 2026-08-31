import type { MasterDataPagination } from '@/features/master-data/types'

export interface MenuListItem {
  id: string
  code: string
  name: string
  path: string | null
  icon: string | null
  requiredPermissionCode: string | null
  parentId: string | null
  sortOrder: number
  isSystem: boolean
  isActive: boolean
}

export interface MenuTreeNode {
  id: string
  code: string
  name: string
  path: string | null
  icon: string | null
  requiredPermissionCode: string | null
  sortOrder: number
  isSystem: boolean
  isActive: boolean
  children: MenuTreeNode[]
}

export interface MenuFormValues {
  code: string
  name: string
  path: string
  icon: string
  requiredPermissionCode: string
  parentId: string | null
  sortOrder: number
  isActive: boolean
}

export interface MenusQueryState {
  page: number
  pageSize: number
  includeInactive: boolean
}
