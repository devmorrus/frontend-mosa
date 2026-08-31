import type { MasterDataStatusFilter } from '@/features/master-data/types'

export interface RoleLookupResponse {
  id: string
  name: string
}

export interface UserListItem {
  id: string
  username: string
  fullName: string
  isActive: boolean
  roles: RoleLookupResponse[]
}

export interface UserDetail {
  id: string
  username: string
  fullName: string
  isActive: boolean
  lastLoginAtUtc: string | null
  roles: RoleLookupResponse[]
}

export interface UserFormValues {
  username: string
  fullName: string
  password: string
  roleIds: string[]
  isActive: boolean
}

export interface UsersQueryState {
  search: string
  status: MasterDataStatusFilter
  page: number
  pageSize: number
}
