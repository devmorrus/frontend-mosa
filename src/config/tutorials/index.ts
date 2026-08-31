import type { TutorialDefinition } from '@/types/tutorial'
import { appIntroTutorial } from './appIntro.config'
import { masterDataTutorial } from './masterData.config'
import { goodsReceivingTutorial } from './goodsReceiving.config'
import { lotAndQrTutorial } from './lotAndQr.config'
import { inventoryTutorial } from './inventory.config'
import { recipeBuilderTutorial } from './recipeBuilder.config'
import { productionOrderTutorial } from './productionOrder.config'

export const allTutorials: TutorialDefinition[] = [
  appIntroTutorial,
  masterDataTutorial,
  goodsReceivingTutorial,
  lotAndQrTutorial,
  inventoryTutorial,
  recipeBuilderTutorial,
  productionOrderTutorial,
]

export const tutorialRegistry: Record<string, TutorialDefinition> = {
  'app-intro': appIntroTutorial,
  'master-data': masterDataTutorial,
  'goods-receiving': goodsReceivingTutorial,
  'lot-qr': lotAndQrTutorial,
  'inventory': inventoryTutorial,
  'recipe-builder': recipeBuilderTutorial,
  'production-order': productionOrderTutorial,
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

    // Check permissions (user must have at least one required permission)
    const hasPermission = tutorial.requiredPermissions.some((perm) =>
      userPermissions.includes(perm),
    )

    // Check roles if defined
    const hasRole =
      !tutorial.allowedRoles ||
      tutorial.allowedRoles.length === 0 ||
      tutorial.allowedRoles.some((role) => userRoles.includes(role))

    return hasPermission || hasRole
  })
}
