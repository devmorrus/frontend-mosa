import type { TutorialDefinition } from '@/types/tutorial'
import { assertTutorialSchema } from './tutorialSchema'
import { appIntroTutorial } from './appIntro.config'
import { masterDataTutorial } from './masterData.config'
import { goodsReceivingTutorial } from './goodsReceiving.config'
import { lotAndQrTutorial } from './lotAndQr.config'
import { inventoryTutorial } from './inventory.config'
import { recipeBuilderTutorial } from './recipeBuilder.config'
import { productionOrderTutorial } from './productionOrder.config'
import { backwardTraceabilityTutorial, forwardTraceabilityTutorial } from './traceability.config'
import { dashboardTutorial } from './dashboard.config'
import { reportingTutorial } from './reporting.config'
import { guidedProductionTutorial } from './guidedProduction.config'
import { materialConsumptionTutorial } from './materialConsumption.config'
import { deviationApprovalTutorial } from './deviationApproval.config'
import { qcInspectionTutorial } from './qcInspection.config'
import { stockOpnameTutorial } from './stockOpname.config'
import { stockAdjustmentTutorial } from './stockAdjustment.config'
import { adminAuditTrailTutorial, adminRolesPermissionsTutorial, adminUserManagementTutorial } from './administration.config'

export const allTutorials: TutorialDefinition[] = [
  appIntroTutorial,
  dashboardTutorial,
  masterDataTutorial,
  goodsReceivingTutorial,
  lotAndQrTutorial,
  inventoryTutorial,
  recipeBuilderTutorial,
  productionOrderTutorial,
  guidedProductionTutorial,
  materialConsumptionTutorial,
  deviationApprovalTutorial,
  qcInspectionTutorial,
  backwardTraceabilityTutorial,
  forwardTraceabilityTutorial,
  reportingTutorial,
  stockOpnameTutorial,
  stockAdjustmentTutorial,
  adminUserManagementTutorial,
  adminRolesPermissionsTutorial,
  adminAuditTrailTutorial,
]

export const tutorialRegistry: Record<string, TutorialDefinition> = {
  'app-intro': appIntroTutorial,
  dashboard: dashboardTutorial,
  'master-data': masterDataTutorial,
  'goods-receiving': goodsReceivingTutorial,
  'lot-qr': lotAndQrTutorial,
  'inventory': inventoryTutorial,
  'recipe-builder': recipeBuilderTutorial,
  'production-order': productionOrderTutorial,
  'guided-production': guidedProductionTutorial,
  'material-consumption': materialConsumptionTutorial,
  'deviation-approval': deviationApprovalTutorial,
  'qc-inspection': qcInspectionTutorial,
  'traceability-backward': backwardTraceabilityTutorial,
  'traceability-forward': forwardTraceabilityTutorial,
  reporting: reportingTutorial,
  'stock-opname': stockOpnameTutorial,
  'stock-adjustment': stockAdjustmentTutorial,
  'admin-user-management': adminUserManagementTutorial,
  'admin-roles-permissions': adminRolesPermissionsTutorial,
  'admin-audit-trail': adminAuditTrailTutorial,
}

if (import.meta.env.DEV) {
  assertTutorialSchema(allTutorials)
}

export function getAvailableTutorials(
  userPermissions: string[],
  userRoles: string[] = [],
): TutorialDefinition[] {
  return allTutorials.filter((tutorial) => {
    // If no specific permissions required, available to all
    if (!tutorial.requiredPermissions || tutorial.requiredPermissions.length === 0) {
      return true
    }

    // A permission-protected tutorial remains hidden unless the user has one required permission.
    const hasPermission = tutorial.requiredPermissions.some((perm) => userPermissions.includes(perm))

    // Check roles if defined (case-insensitive: backend uses SUPERADMIN,
    // frontend configs historically mix 'Admin' and 'ADMIN').
    const normalizedUserRoles = userRoles.map((r) => r.trim().toLowerCase())
    const hasRole =
      !tutorial.allowedRoles ||
      tutorial.allowedRoles.length === 0 ||
      tutorial.allowedRoles.some((role) => normalizedUserRoles.includes(role.trim().toLowerCase()))

    return hasPermission && hasRole
  })
}
