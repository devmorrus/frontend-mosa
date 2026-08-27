import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { Permission } from '@/types/auth'
import { FullScreenSpinner } from '@/components/common/FullScreenSpinner'

interface ProtectedRouteProps {
  /** If provided, the route also requires at least one of these permissions. */
  requiredPermission?: Permission
}

/**
 * Guards a route subtree: unauthenticated users are sent to /login
 * (remembering where they were headed), authenticated users missing the
 * required permission are sent to /403, everyone else sees the nested route.
 */
export function ProtectedRoute({ requiredPermission }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const location = useLocation()

  if (isInitializing) {
    return <FullScreenSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
