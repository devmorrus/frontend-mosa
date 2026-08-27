import { useEffect } from 'react'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/stores/authStore'
import { tokenStorage } from '@/utils/tokenStorage'

/**
 * Runs once on app load: if a token is already stored (page refresh, new
 * tab), fetch the current user to restore `isAuthenticated` instead of
 * bouncing the user to /login just because the store is empty in memory.
 */
export function useSessionBootstrap() {
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)
  const setInitializing = useAuthStore((state) => state.setInitializing)

  useEffect(() => {
    const token = tokenStorage.getAccessToken()

    if (!token) {
      setInitializing(false)
      return
    }

    authApi
      .restoreSession()
      .then(({ user, tokens, sidebar }) => setSession(user, tokens, sidebar))
      .catch(() => clearSession())
  }, [setSession, clearSession, setInitializing])
}
