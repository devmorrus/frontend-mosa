import type { TutorialDefinition } from '@/types/tutorial'
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

export const allTutorials: TutorialDefinition[] = [
  appIntroTutorial,
  dashboardTutorial,
  masterDataTutorial,
  goodsReceivingTutorial,
  lotAndQrTutorial,
  inventoryTutorial,
  recipeBuilderTutorial,
  productionOrderTutorial,
  backwardTraceabilityTutorial,
  forwardTraceabilityTutorial,
  reportingTutorial,
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
  'traceability-backward': backwardTraceabilityTutorial,
  'traceability-forward': forwardTraceabilityTutorial,
  reporting: reportingTutorial,
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

    // Check roles if defined
    const hasRole =
      !tutorial.allowedRoles ||
      tutorial.allowedRoles.length === 0 ||
      tutorial.allowedRoles.some((role) => userRoles.includes(role))

    return hasPermission && hasRole
  })
}
