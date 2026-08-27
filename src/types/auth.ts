/**
 * Permission codes are deliberately plain strings ("supplier.view") so the
 * backend is free to define the permission catalogue. The frontend never
 * hardcodes a role-to-menu mapping — it only checks "does this user have
 * permission X", which is what the sidebar and route guards rely on.
 */
export type Permission = string

export interface User {
  id: string
  name: string
  email?: string
  username?: string
  roles: string[]
  permissions: Permission[]
}

export interface SidebarItem {
  id: string
  code: string
  name: string
  path?: string | null
  icon?: string | null
  sortOrder: number
  children: SidebarItem[]
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  /** Present when the backend issues a rotating/refresh token. Optional so
   * this foundation still works against a backend that only issues one token. */
  refreshToken?: string
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
  sidebar: SidebarItem[]
}

export interface BackendAuthenticatedUser {
  id: string
  username: string
  fullName: string
  roles: string[]
}

export interface BackendCurrentUser {
  id: string
  username: string
  fullName: string
  isAuthenticated: boolean
  roles: string[]
  permissions: Permission[]
}

export interface BackendLoginResponse {
  accessToken: string
  refreshToken: string
  expiresAtUtc: string
  user: BackendAuthenticatedUser
}

export interface BackendSidebarItem {
  id: string
  code: string
  name: string
  path?: string | null
  icon?: string | null
  sortOrder: number
  children: BackendSidebarItem[]
}
