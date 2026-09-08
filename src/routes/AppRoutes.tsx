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
import { MenusPage } from '@/pages/administration/MenusPage'
import { UsersPage } from '@/pages/administration/UsersPage'
import { RolesPage } from '@/pages/administration/RolesPage'
import { UserCreatePage } from '@/pages/administration/UserCreatePage'
import { UserDetailPage } from '@/pages/administration/UserDetailPage'
import { RoleDetailPage } from '@/pages/administration/RoleDetailPage'
import { AuditTrailPage } from '@/pages/administration/AuditTrailPage'
import { AuditTrailDetailPage } from '@/pages/administration/AuditTrailDetailPage'
import { UnitsPage } from '@/pages/master-data/UnitsPage'
import { WarehousesPage } from '@/pages/master-data/WarehousesPage'
import { MenuPlaceholderPage } from '@/pages/modules/MenuPlaceholderPage'
import { ModulePlaceholderPage } from '@/pages/modules/ModulePlaceholderPage'
import { RecipeCreatePage } from '@/pages/production/RecipeCreatePage'
import { RecipeApprovalQueuePage } from '@/pages/production/RecipeApprovalQueuePage'
import { RecipeDetailPage } from '@/pages/production/RecipeDetailPage'
import { RecipesPage } from '@/pages/production/RecipesPage'
import { RecipeVersionPage } from '@/pages/production/RecipeVersionPage'
import { RecipeTutorialPage } from '@/pages/production/RecipeTutorialPage'
import { ProductionDeviationQueuePage } from '@/pages/production/ProductionDeviationQueuePage'
import { ProductionDeviationReviewPage } from '@/pages/production/ProductionDeviationReviewPage'
import { ProductionOrdersPage } from '@/pages/production/ProductionOrdersPage'
import { ProductionOrderCreatePage } from '@/pages/production/ProductionOrderCreatePage'
import { ProductionOrderDetailPage } from '@/pages/production/ProductionOrderDetailPage'
import { GoodsReceivingFormPage } from '@/pages/warehouse/GoodsReceivingFormPage'
import { GoodsReceivingsPage } from '@/pages/warehouse/GoodsReceivingsPage'
import { RawMaterialInventoryPage } from '@/pages/warehouse/RawMaterialInventoryPage'
import { RawMaterialLotDetailPage } from '@/pages/warehouse/RawMaterialLotDetailPage'
import { RawMaterialLotsPage } from '@/pages/warehouse/RawMaterialLotsPage'
import { RawMaterialLotScannerPage } from '@/pages/warehouse/RawMaterialLotScannerPage'
import { StockAdjustmentCreatePage } from '@/pages/warehouse/StockAdjustmentCreatePage'
import { StockAdjustmentDetailPage } from '@/pages/warehouse/StockAdjustmentDetailPage'
import { StockAdjustmentsPage } from '@/pages/warehouse/StockAdjustmentsPage'
import { StockMovementsPage } from '@/pages/warehouse/StockMovementsPage'
import { StockOpnameCreatePage } from '@/pages/warehouse/StockOpnameCreatePage'
import { StockOpnameDetailPage } from '@/pages/warehouse/StockOpnameDetailPage'
import { StockOpnamesPage } from '@/pages/warehouse/StockOpnamesPage'
import { placeholderRoutes } from '@/routes/navigation.config'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { TutorialLauncherPage } from '@/pages/help/TutorialLauncherPage'
import { OperatorProductionQueuePage } from '@/pages/operator/OperatorProductionQueuePage'
import { OperatorGuidedProductionPage } from '@/pages/operator/OperatorGuidedProductionPage'
import { FinishedGoodsLotDetailPage } from '@/pages/production/FinishedGoodsLotDetailPage'
import { QualityControlQueuePage } from '@/pages/production/QualityControlQueuePage'
import { QualityControlInspectionPage } from '@/pages/production/QualityControlInspectionPage'
import { FinishedGoodsTraceabilityPage, TraceabilitySearchPage } from '@/pages/traceability/TraceabilityPages'
import { RawMaterialTraceabilityPage } from '@/pages/traceability/RawMaterialTraceabilityPage'
import { ReportsPage } from '@/pages/reports/ReportsPage'

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
          <Route path="/help/tutorials" element={<TutorialLauncherPage />} />
          <Route path="/help" element={<Navigate to="/help/tutorials" replace />} />

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

          <Route element={<ProtectedRoute requiredPermission="recipes.view" />}>
            <Route path="/production/recipes" element={<RecipesPage />} />
            <Route path="/production/recipes/:id" element={<RecipeDetailPage />} />
            <Route
              path="/production/recipes/:recipeId/versions/:versionId"
              element={<RecipeVersionPage />}
            />
            <Route path="/production/recipes/:recipeId/versions/:versionId/tutorial" element={<RecipeTutorialPage />} />
            <Route path="/recipes" element={<Navigate to="/production/recipes" replace />} />
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
            <Route
              path="/recipes/:recipeId/versions/:versionId"
              element={<RecipeVersionPage />}
            />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="recipes.create" />}>
            <Route path="/production/recipes/create" element={<RecipeCreatePage />} />
            <Route path="/recipes/create" element={<Navigate to="/production/recipes/create" replace />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="recipes.approve" />}>
            <Route path="/production/recipes/approval-queue" element={<RecipeApprovalQueuePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="production-orders.view" />}>
            <Route path="/production/orders" element={<ProductionOrdersPage />} />
            <Route path="/production/orders/:id" element={<ProductionOrderDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="production-orders.create" />}>
            <Route path="/production/orders/create" element={<ProductionOrderCreatePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="production-orders.execute" />}>
            <Route path="/operator/production" element={<OperatorProductionQueuePage />} />
            <Route path="/operator/production/:id" element={<OperatorGuidedProductionPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="finished-goods-lots.view" />}>
            <Route path="/production/finished-goods-lots/:id" element={<FinishedGoodsLotDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="traceability.view" />}>
            <Route path="/traceability" element={<TraceabilitySearchPage />} />
            <Route path="/traceability/finished-goods/:id" element={<FinishedGoodsTraceabilityPage />} />
            <Route path="/traceability/raw-material/:id" element={<RawMaterialTraceabilityPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="reports.view" />}>
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:reportCode" element={<ReportsPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="qc.view" />}>
            <Route path="/quality-control" element={<QualityControlQueuePage />} />
            <Route path="/quality-control/:finishedGoodsLotId" element={<QualityControlInspectionPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="production-deviations.view" />}>
            <Route path="/production/deviations" element={<ProductionDeviationQueuePage />} />
            <Route path="/production/deviations/:id" element={<ProductionDeviationReviewPage />} />
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

          <Route element={<ProtectedRoute requiredPermission="users.view" />}>
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/users/create" element={<UserCreatePage />} />
            <Route path="/admin/users/:id" element={<UserDetailPage />} />
            <Route path="/users" element={<Navigate to="/admin/users" replace />} />
            <Route path="/administration/users" element={<Navigate to="/admin/users" replace />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="roles.view" />}>
            <Route path="/admin/roles" element={<RolesPage />} />
            <Route path="/admin/roles/:id" element={<RoleDetailPage />} />
            <Route path="/roles" element={<Navigate to="/admin/roles" replace />} />
            <Route path="/administration/roles" element={<Navigate to="/admin/roles" replace />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="audit.view" />}>
            <Route path="/admin/audit-trail" element={<AuditTrailPage />} />
            <Route path="/admin/audit-trail/:id" element={<AuditTrailDetailPage />} />
            <Route path="/audit-logs" element={<Navigate to="/admin/audit-trail" replace />} />
            <Route path="/audit-logs/:id" element={<Navigate to="/admin/audit-trail/:id" replace />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="menus.view" />}>
            <Route path="/menus" element={<MenusPage />} />
            <Route path="/administration/menus" element={<MenusPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="lots.view" />}>
            <Route path="/lots" element={<RawMaterialLotsPage />} />
            <Route path="/lots/scan" element={<RawMaterialLotScannerPage />} />
            <Route path="/lots/:id" element={<RawMaterialLotDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="inventory.view" />}>
            <Route path="/inventory" element={<RawMaterialInventoryPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="stock-movements.view" />}>
            <Route path="/stock-movements" element={<StockMovementsPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="stock-opname.view" />}>
            <Route path="/warehouse/stock-opname" element={<StockOpnamesPage />} />
            <Route path="/stock-opname" element={<Navigate to="/warehouse/stock-opname" replace />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="stock-opname.create" />}>
            <Route path="/warehouse/stock-opname/create" element={<StockOpnameCreatePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="stock-opname.view" />}>
            <Route path="/warehouse/stock-opname/:id" element={<StockOpnameDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="stock-adjustments.view" />}>
            <Route path="/warehouse/stock-adjustments" element={<StockAdjustmentsPage />} />
            <Route path="/stock-adjustments" element={<Navigate to="/warehouse/stock-adjustments" replace />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="stock-adjustments.create" />}>
            <Route path="/warehouse/stock-adjustments/create" element={<StockAdjustmentCreatePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermission="stock-adjustments.view" />}>
            <Route path="/warehouse/stock-adjustments/:id" element={<StockAdjustmentDetailPage />} />
          </Route>

          {placeholderRoutes.map((route) => (
            route.path === '/lots' || route.path === '/inventory' || route.path === '/stock-movements' || route.path === '/users' || route.path === '/roles' || route.path === '/menus' ? null : (
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

          {/* Catch-all for dynamic sidebar menus without registered routes */}
          <Route path="*" element={<MenuPlaceholderPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
