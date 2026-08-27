import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage'
import { NotFoundPage } from '@/pages/errors/NotFoundPage'
import { ModulePlaceholderPage } from '@/pages/modules/ModulePlaceholderPage'
import { placeholderRoutes } from '@/routes/navigation.config'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

/**
 * Central route tree. Feature modules (Supplier, Material, Product, ...)
 * plug in under the protected <MainLayout> group in later tasking — this
 * file is the one place that changes when a new page is added, so routing
 * never gets defined ad-hoc inside components.
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected routes: any authenticated user */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          {placeholderRoutes.map((route) => (
            <Route
              key={route.path}
              element={<ProtectedRoute requiredPermission={route.permission} />}
            >
              <Route
                path={route.path}
                element={<ModulePlaceholderPage title={route.title} description={route.description} />}
              />
            </Route>
          ))}

          <Route path="/403" element={<ForbiddenPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
