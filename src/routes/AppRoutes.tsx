import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage'
import { NotFoundPage } from '@/pages/errors/NotFoundPage'
import { ModulePlaceholderPage } from '@/pages/modules/ModulePlaceholderPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { navItems } from '@/routes/navigation.config'

const moduleDescriptions: Record<string, string> = {
  '/suppliers': 'Foundation route untuk modul Supplier sudah siap dan diproteksi permission.',
  '/materials': 'Foundation route untuk modul Material sudah siap dan diproteksi permission.',
  '/products': 'Foundation route untuk modul Product sudah siap dan diproteksi permission.',
  '/goods-receiving':
    'Foundation route untuk modul Goods Receiving sudah siap dan diproteksi permission.',
  '/inventory': 'Foundation route untuk modul Inventory sudah siap dan diproteksi permission.',
  '/recipes': 'Foundation route untuk modul Recipe sudah siap dan diproteksi permission.',
  '/production': 'Foundation route untuk modul Production sudah siap dan diproteksi permission.',
}

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

          {navItems
            .filter((item) => item.permission)
            .map((item) => (
              <Route
                key={item.path}
                element={<ProtectedRoute requiredPermission={item.permission} />}
              >
                <Route
                  path={item.path}
                  element={
                    <ModulePlaceholderPage
                      title={item.label}
                      description={moduleDescriptions[item.path] ?? 'Modul ini sedang disiapkan.'}
                    />
                  }
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
