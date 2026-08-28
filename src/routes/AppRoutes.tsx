import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage'
import { NotFoundPage } from '@/pages/errors/NotFoundPage'
import { ProductsPage } from '@/pages/master-data/ProductsPage'
import { RawMaterialsPage } from '@/pages/master-data/RawMaterialsPage'
import { SuppliersPage } from '@/pages/master-data/SuppliersPage'
import { UnitsPage } from '@/pages/master-data/UnitsPage'
import { WarehousesPage } from '@/pages/master-data/WarehousesPage'
import { ModulePlaceholderPage } from '@/pages/modules/ModulePlaceholderPage'
import { GoodsReceivingFormPage } from '@/pages/warehouse/GoodsReceivingFormPage'
import { GoodsReceivingsPage } from '@/pages/warehouse/GoodsReceivingsPage'
import { RawMaterialLotDetailPage } from '@/pages/warehouse/RawMaterialLotDetailPage'
import { RawMaterialLotsPage } from '@/pages/warehouse/RawMaterialLotsPage'
import { RawMaterialLotScannerPage } from '@/pages/warehouse/RawMaterialLotScannerPage'
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

          <Route element={<ProtectedRoute requiredPermission="suppliers.view" />}>
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/master/suppliers" element={<SuppliersPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="materials.view" />}>
            <Route path="/raw-materials" element={<RawMaterialsPage />} />
            <Route path="/master/raw-materials" element={<RawMaterialsPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="products.view" />}>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/master/products" element={<ProductsPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="receiving.view" />}>
            <Route path="/goods-receiving" element={<GoodsReceivingsPage />} />
            <Route path="/goods-receiving/:id" element={<GoodsReceivingFormPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="receiving.create" />}>
            <Route path="/goods-receiving/create" element={<GoodsReceivingFormPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="uoms.view" />}>
            <Route path="/units" element={<UnitsPage />} />
            <Route path="/master/units" element={<UnitsPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="warehouses.view" />}>
            <Route path="/warehouses" element={<WarehousesPage />} />
            <Route path="/master/warehouses" element={<WarehousesPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="lots.view" />}>
            <Route path="/lots" element={<RawMaterialLotsPage />} />
            <Route path="/lots/scan" element={<RawMaterialLotScannerPage />} />
            <Route path="/lots/:id" element={<RawMaterialLotDetailPage />} />
          </Route>

          {placeholderRoutes.map((route) => (
            route.path === '/lots' ? null : (
              <Route
                key={route.path}
                element={<ProtectedRoute requiredPermission={route.permission} />}
              >
                <Route
                  path={route.path}
                  element={<ModulePlaceholderPage title={route.title} description={route.description} />}
                />
              </Route>
            )
          ))}

          <Route path="/403" element={<ForbiddenPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
