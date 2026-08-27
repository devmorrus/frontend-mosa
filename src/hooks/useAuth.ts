import { useCallback } from 'react'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/stores/authStore'
import type { LoginPayload } from '@/types/auth'

/**
 * Thin façade over the auth store + auth API, so pages/components never
 * import the store or the API service directly for common auth actions.
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const sidebarItems = useAuthStore((state) => state.sidebarItems)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission)
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { user: loggedInUser, tokens, sidebar } = await authApi.login(payload)
      setSession(loggedInUser, tokens, sidebar)
      return loggedInUser
    },
    [setSession],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearSession()
    }
  }, [clearSession])

  return {
    user,
    sidebarItems,
    isAuthenticated,
    isInitializing,
    hasPermission,
    hasAnyPermission,
    can: hasPermission,
    canAny: hasAnyPermission,
    login,
    logout,
  }
}
