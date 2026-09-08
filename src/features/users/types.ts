import type { MasterDataStatusFilter } from '@/features/master-data/types'

export interface RoleLookupResponse {
  id: string
  name: string
}

export interface UserListItem {
  id: string
  username: string
  fullName: string
  email?: string | null
  isActive: boolean
  lastLoginAtUtc?: string | null
  roles: RoleLookupResponse[]
}

export interface UserDetail {
  id: string
  username: string
  fullName: string
  email?: string | null
  isActive: boolean
  lastLoginAtUtc: string | null
  roles: RoleLookupResponse[]
}

export interface UserFormValues {
  username: string
  fullName: string
  email: string
  password: string
  roleIds: string[]
  isActive: boolean
}

export interface UsersQueryState {
  search: string
  roleId: string
  status: MasterDataStatusFilter
  page: number
  pageSize: number
}
