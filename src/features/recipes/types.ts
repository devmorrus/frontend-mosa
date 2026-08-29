import type { MasterDataPagination, MasterDataStatusFilter } from '@/features/master-data/types'

export const RecipeLifecycleStatus = {
  Draft: 1,
  PendingApproval: 2,
  Approved: 3,
  NeedsRevision: 4,
  Historical: 5,
} as const

export type RecipeLifecycleStatus =
  (typeof RecipeLifecycleStatus)[keyof typeof RecipeLifecycleStatus]

export const RecipeStepType = {
  Material: 1,
  Process: 2,
  Timer: 3,
  Check: 4,
} as const

export type RecipeStepType = (typeof RecipeStepType)[keyof typeof RecipeStepType]

export const RecipeToleranceType = {
  None: 1,
  PlusMinus: 2,
  Min: 3,
  Max: 4,
} as const

export type RecipeToleranceType =
  (typeof RecipeToleranceType)[keyof typeof RecipeToleranceType]

export interface RecipeUnitOfMeasure {
  id: string
  code: string
  name: string
  symbol: string | null
}

export interface RecipeProductLookup {
  id: string
  code: string
  name: string
  unitOfMeasureId: string
  unitOfMeasureCode: string
  unitOfMeasureName: string
  unitOfMeasureSymbol: string | null
}

export interface RecipeRawMaterialLookup {
  id: string
  code: string
  name: string
}

export interface RecipeStep {
  id: string
  sequence: number
  stepType: RecipeStepType
  rawMaterial: RecipeRawMaterialLookup | null
  targetQuantity: number | null
  unitOfMeasure: RecipeUnitOfMeasure | null
  toleranceType: RecipeToleranceType | null
  toleranceValue: number | null
  instruction: string | null
  timerSeconds: number | null
}

export interface RecipeVersionListItem {
  id: string
  versionNumber: number
  standardOutputQuantity: number
  unitOfMeasure: RecipeUnitOfMeasure
  status: RecipeLifecycleStatus
  submittedBy: string | null
  submittedAtUtc: string | null
  approvedBy: string | null
  approvedAtUtc: string | null
  stepsCount: number
  createdAtUtc: string
  createdBy: string | null
  updatedAtUtc: string | null
  updatedBy: string | null
}

export interface RecipeVersionDetail {
  id: string
  recipeId: string
  recipeName: string
  versionNumber: number
  standardOutputQuantity: number
  unitOfMeasure: RecipeUnitOfMeasure
  status: RecipeLifecycleStatus
  submittedBy: string | null
  submittedAtUtc: string | null
  approvedBy: string | null
  approvedAtUtc: string | null
  approvalNotes: string | null
  createdAtUtc: string
  createdBy: string | null
  updatedAtUtc: string | null
  updatedBy: string | null
  steps: RecipeStep[]
}

export interface RecipeListItem {
  id: string
  name: string
  status: RecipeLifecycleStatus
  product: RecipeProductLookup
  currentVersion: RecipeVersionListItem | null
  createdAtUtc: string
  createdBy: string | null
  updatedAtUtc: string | null
  updatedBy: string | null
}

export interface RecipeDetail {
  id: string
  name: string
  status: RecipeLifecycleStatus
  product: RecipeProductLookup
  currentVersion: RecipeVersionDetail | null
  versions: RecipeVersionListItem[]
  createdAtUtc: string
  createdBy: string | null
  updatedAtUtc: string | null
  updatedBy: string | null
}

export interface RecipeScaledMaterialRequirement {
  stepId: string
  sequence: number
  rawMaterialId: string
  rawMaterialCode: string
  rawMaterialName: string
  originalTargetQuantity: number
  scaledTargetQuantity: number
  unitOfMeasure: RecipeUnitOfMeasure
}

export interface RecipeScalingPreview {
  recipeVersionId: string
  recipeId: string
  recipeName: string
  versionNumber: number
  standardOutputQuantity: number
  targetOutputQuantity: number
  scalingFactor: number
  outputUnitOfMeasure: RecipeUnitOfMeasure
  materialRequirements: RecipeScaledMaterialRequirement[]
}

export interface RecipeApprovalQueueItem {
  recipeVersionId: string
  recipeId: string
  recipeName: string
  versionNumber: number
  product: RecipeProductLookup
  standardOutputQuantity: number
  unitOfMeasure: RecipeUnitOfMeasure
  status: RecipeLifecycleStatus
  submittedBy: string | null
  submittedAtUtc: string | null
  createdAtUtc: string
  createdBy: string | null
  updatedAtUtc: string | null
  updatedBy: string | null
}

export interface RecipeQueryState {
  search: string
  status: MasterDataStatusFilter | 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'NEEDS_REVISION' | 'HISTORICAL'
  productId: string
  page: number
  pageSize: number
}

export interface RecipeVersionQueryState {
  status: RecipeQueryState['status']
  page: number
  pageSize: number
}

export interface RecipeListResult {
  items: RecipeListItem[]
  pagination: MasterDataPagination
}

export interface RecipeVersionListResult {
  items: RecipeVersionListItem[]
  pagination: MasterDataPagination
}

export interface RecipeApprovalQueueResult {
  items: RecipeApprovalQueueItem[]
  pagination: MasterDataPagination
}

export interface RecipeStepFormValues {
  id: string
  stepType: RecipeStepType
  rawMaterialId: string
  targetQuantity: string
  unitOfMeasureId: string
  toleranceType: '' | RecipeToleranceType
  toleranceValue: string
  instruction: string
  timerSeconds: string
}

export interface RecipeCreateFormValues {
  productId: string
  name: string
  standardOutputQuantity: string
  unitOfMeasureId: string
  steps: RecipeStepFormValues[]
}

export interface RecipeVersionCreateFormValues {
  standardOutputQuantity: string
  unitOfMeasureId: string
}

export interface RecipeApprovalQueueQueryState {
  search: string
  page: number
  pageSize: number
}
