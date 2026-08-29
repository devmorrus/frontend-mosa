import {
  RecipeLifecycleStatus,
  RecipeStepType,
  RecipeToleranceType,
  type RecipeStep,
  type RecipeStepFormValues,
} from '@/features/recipes/types'

export const RECIPE_PAGE_SIZE_OPTIONS = [10, 20, 50]

export const RECIPE_STATUS_FILTER_OPTIONS = [
  { label: 'Semua status', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Pending Approval', value: 'PENDING_APPROVAL' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Needs Revision', value: 'NEEDS_REVISION' },
  { label: 'Historical', value: 'HISTORICAL' },
] as const

export function formatRecipeDate(value: string | null) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatQuantity(value: number, symbol?: string | null, fractionDigits = 3) {
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(value)

  return symbol ? `${formatted} ${symbol}` : formatted
}

export function isReadOnlyRecipeVersion(status: RecipeLifecycleStatus) {
  return status === RecipeLifecycleStatus.Approved || status === RecipeLifecycleStatus.Historical
}

export function isRecipeVersionEditable(status: RecipeLifecycleStatus) {
  return status === RecipeLifecycleStatus.Draft || status === RecipeLifecycleStatus.NeedsRevision
}

export function getRecipeStepTypeLabel(stepType: RecipeStepType) {
  switch (stepType) {
    case RecipeStepType.Material:
      return 'Material'
    case RecipeStepType.Process:
      return 'Process'
    case RecipeStepType.Timer:
      return 'Timer'
    case RecipeStepType.Check:
      return 'Check'
    default:
      return 'Unknown'
  }
}

export function describeRecipeStep(step: RecipeStep) {
  if (step.stepType === RecipeStepType.Material) {
    const materialName = step.rawMaterial?.name ?? 'Unknown material'
    const quantity = step.targetQuantity && step.unitOfMeasure
      ? formatQuantity(step.targetQuantity, step.unitOfMeasure.symbol ?? step.unitOfMeasure.code)
      : '-'

    return `${materialName} • ${quantity}`
  }

  if (step.stepType === RecipeStepType.Timer) {
    return `${step.instruction ?? 'Timer'} • ${step.timerSeconds ?? 0} sec`
  }

  return step.instruction ?? '-'
}

export function moveRecipeStep(steps: RecipeStepFormValues[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= steps.length) {
    return steps
  }

  const next = [...steps]
  const [item] = next.splice(index, 1)
  next.splice(nextIndex, 0, item)
  return next
}

export function formatToleranceLabel(toleranceType: RecipeToleranceType | null, toleranceValue: number | null) {
  if (toleranceType === null || toleranceValue === null) {
    return 'No tolerance'
  }

  switch (toleranceType) {
    case RecipeToleranceType.PlusMinus:
      return `±${toleranceValue}`
    case RecipeToleranceType.Min:
      return `Min ${toleranceValue}`
    case RecipeToleranceType.Max:
      return `Max ${toleranceValue}`
    default:
      return `${toleranceValue}`
  }
}
