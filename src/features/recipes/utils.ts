import {
  RecipeLifecycleStatus,
  RecipeStepType,
  RecipeToleranceType,
  type RecipeStep,
  type RecipeStepFormValues,
  type RecipeApprovalQueueQueryState,
  type RecipeQueryState,
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

export function getRecipeStatusLabel(status: RecipeLifecycleStatus) {
  switch (status) {
    case RecipeLifecycleStatus.Draft:
      return 'Draft'
    case RecipeLifecycleStatus.PendingApproval:
      return 'Pending Approval'
    case RecipeLifecycleStatus.Approved:
      return 'Approved'
    case RecipeLifecycleStatus.NeedsRevision:
      return 'Needs Revision'
    case RecipeLifecycleStatus.Historical:
      return 'Historical'
    default:
      return 'Unknown'
  }
}

export function getRecipeStatusTone(status: RecipeLifecycleStatus) {
  switch (status) {
    case RecipeLifecycleStatus.Approved:
      return 'success'
    case RecipeLifecycleStatus.PendingApproval:
      return 'warning'
    case RecipeLifecycleStatus.NeedsRevision:
      return 'danger'
    case RecipeLifecycleStatus.Historical:
      return 'muted'
    case RecipeLifecycleStatus.Draft:
    default:
      return 'neutral'
  }
}

export function getRecipeStatusFilterLabel(status: RecipeQueryState['status']) {
  return RECIPE_STATUS_FILTER_OPTIONS.find((option) => option.value === status)?.label ?? 'Semua status'
}

export function hasActiveRecipeListFilters(query: RecipeQueryState) {
  return Boolean(query.search || query.status !== 'ALL' || query.productId)
}

export function hasActiveRecipeApprovalFilters(query: RecipeApprovalQueueQueryState) {
  return Boolean(query.search)
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

export function getRecipeStepTypeTone(stepType: RecipeStepType) {
  switch (stepType) {
    case RecipeStepType.Material:
      return 'blue'
    case RecipeStepType.Timer:
      return 'amber'
    case RecipeStepType.Check:
      return 'emerald'
    case RecipeStepType.Process:
    default:
      return 'slate'
  }
}

export function countRecipeStepTypes(steps: Array<{ stepType: RecipeStepType }>) {
  return steps.reduce(
    (summary, step) => {
      if (step.stepType === RecipeStepType.Material) summary.material += 1
      else if (step.stepType === RecipeStepType.Process) summary.process += 1
      else if (step.stepType === RecipeStepType.Timer) summary.timer += 1
      else if (step.stepType === RecipeStepType.Check) summary.check += 1
      return summary
    },
    { material: 0, process: 0, timer: 0, check: 0 },
  )
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
