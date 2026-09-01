import type { MasterDataPagination } from '@/features/master-data/types'
import type { ProductionOrderStatus } from '@/features/production-orders/types'
import type { RecipeStepType, RecipeToleranceType } from '@/features/recipes/types'

export const ProductionStepExecutionStatus = {
  Locked: 1,
  Ready: 2,
  InProgress: 3,
  Completed: 4,
  WaitingApproval: 5,
} as const

export type ProductionStepExecutionStatus =
  (typeof ProductionStepExecutionStatus)[keyof typeof ProductionStepExecutionStatus]

export interface OperatorProductionProgress {
  completedSteps: number
  totalSteps: number
  currentStepSequence: number | null
}

export interface OperatorProductionQueueItem {
  id: string
  productionOrderNumber: string
  productName: string
  productCode: string
  recipeVersionNumber: number
  targetOutput: number
  unitOfMeasureCode: string
  unitOfMeasureSymbol: string | null
  scheduledDate: string | null
  status: ProductionOrderStatus
  progress: OperatorProductionProgress
}

export interface OperatorProductionCurrentStep {
  id: string
  sequence: number
  stepName: string
  stepType: RecipeStepType
  instruction: string | null
  rawMaterialName: string | null
  targetQuantity: number | null
  unitOfMeasureSymbol: string | null
  toleranceType: RecipeToleranceType | null
  toleranceValue: number | null
  timerSeconds: number | null
  timerEndsAtUtc: string | null
  status: ProductionStepExecutionStatus
  isConfirmed: boolean
}

export interface OperatorProductionDetail {
  id: string
  productionOrderNumber: string
  productName: string
  productCode: string
  recipeName: string
  recipeVersionNumber: number
  targetOutput: number
  unitOfMeasureCode: string
  unitOfMeasureSymbol: string | null
  operatorName: string
  status: ProductionOrderStatus
  progress: OperatorProductionProgress
  currentStep: OperatorProductionCurrentStep | null
}

export interface ConsumeMaterialLotResponse {
  rawMaterialLotId: string
  rawMaterialLotCode: string
  actualQuantity: number
}

export interface ConsumeMaterialResponse {
  postingId: string
  productionOrderId: string
  stepExecutionId: string
  status: 'Posted' | 'PendingApproval'
  evaluation: {
    targetQuantity: number
    actualQuantity: number
    varianceQuantity: number
    variancePercentage: number | null
    lowerLimit: number | null
    upperLimit: number | null
    isWithinTolerance: boolean
    requiresSupervisorApproval: boolean
  }
  stepStatus: ProductionStepExecutionStatus
  nextStepExecutionId: string | null
  nextStepStatus: ProductionStepExecutionStatus | null
  lots: ConsumeMaterialLotResponse[]
  isIdempotentReplay: boolean
}

export interface OperatorProductionQueueResult {
  items: OperatorProductionQueueItem[]
  pagination: MasterDataPagination
}
