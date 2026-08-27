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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission)
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { user: loggedInUser, tokens } = await authApi.login(payload)
      setSession(loggedInUser, tokens)
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
    isAuthenticated,
    isInitializing,
    hasPermission,
    hasAnyPermission,
    login,
    logout,
  }
}
