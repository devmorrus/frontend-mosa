import { create } from 'zustand'
import type { AuthTokens, Permission, User } from '@/types/auth'
import { tokenStorage } from '@/utils/tokenStorage'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  /** True while we're restoring session on app boot (checking token + fetching /me). */
  isInitializing: boolean

  setSession: (user: User, tokens: AuthTokens) => void
  clearSession: () => void
  setInitializing: (value: boolean) => void
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
}

/**
 * Authentication state, kept separate from `uiStore` on purpose: auth is
 * consumed by route guards and the sidebar (permission checks), UI state is
 * consumed by presentation-only concerns. Splitting stores keeps re-renders
 * scoped to what actually changed.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  setSession: (user, tokens) => {
    tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken)
    set({ user, isAuthenticated: true, isInitializing: false })
  },

  clearSession: () => {
    tokenStorage.clear()
    set({ user: null, isAuthenticated: false, isInitializing: false })
  },

  setInitializing: (value) => set({ isInitializing: value }),

  hasPermission: (permission) => {
    const { user } = get()
    return Boolean(user?.permissions.includes(permission))
  },

  hasAnyPermission: (permissions) => {
    if (permissions.length === 0) return true
    const { user } = get()
    return permissions.some((permission) => user?.permissions.includes(permission))
  },
}))
