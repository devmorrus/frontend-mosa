import {
  RecipeLifecycleStatus,
  RecipeStepType,
  type RecipeStep,
  type RecipeCreateFormValues,
  type RecipeStepFormValues,
  type RecipeVersionCreateFormValues,
} from '@/features/recipes/types'
import type { MasterDataFormErrors } from '@/features/master-data/types'
import { normalizeOptionalText, normalizeText } from '@/features/master-data/utils'

export const emptyRecipeStepFormValues = (): RecipeStepFormValues => ({
  id: crypto.randomUUID(),
  stepType: RecipeStepType.Material,
  rawMaterialId: '',
  targetQuantity: '',
  unitOfMeasureId: '',
  toleranceType: '',
  toleranceValue: '',
  instruction: '',
  timerSeconds: '',
})

export const emptyRecipeCreateFormValues: RecipeCreateFormValues = {
  productId: '',
  name: '',
  standardOutputQuantity: '',
  unitOfMeasureId: '',
  steps: [emptyRecipeStepFormValues()],
}

export const emptyRecipeVersionCreateFormValues: RecipeVersionCreateFormValues = {
  standardOutputQuantity: '',
  unitOfMeasureId: '',
}

export function normalizeRecipeStepFormValues(step: RecipeStepFormValues) {
  return {
    ...step,
    rawMaterialId: step.rawMaterialId.trim(),
    targetQuantity: step.targetQuantity.trim(),
    unitOfMeasureId: step.unitOfMeasureId.trim(),
    toleranceValue: step.toleranceValue.trim(),
    instruction: step.instruction.trim(),
    timerSeconds: step.timerSeconds.trim(),
  }
}

export function normalizeRecipeCreateFormValues(values: RecipeCreateFormValues) {
  return {
    ...values,
    productId: values.productId.trim(),
    name: normalizeText(values.name),
    standardOutputQuantity: values.standardOutputQuantity.trim(),
    unitOfMeasureId: values.unitOfMeasureId.trim(),
    steps: values.steps.map(normalizeRecipeStepFormValues),
  }
}

export function normalizeRecipeVersionCreateFormValues(values: RecipeVersionCreateFormValues) {
  return {
    standardOutputQuantity: values.standardOutputQuantity.trim(),
    unitOfMeasureId: values.unitOfMeasureId.trim(),
  }
}

function isPositiveNumber(value: string) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) && numberValue > 0
}

function isNonNegativeNumber(value: string) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) && numberValue >= 0
}

export function validateRecipeStep(step: RecipeStepFormValues, index: number): MasterDataFormErrors {
  const errors: MasterDataFormErrors = {}
  const normalized = normalizeRecipeStepFormValues(step)
  const prefix = `steps.${index}`

  if (step.stepType === RecipeStepType.Material) {
    if (!normalized.rawMaterialId) {
      errors[`${prefix}.rawMaterialId`] = ['Raw material wajib dipilih.']
    }

    if (!normalized.unitOfMeasureId) {
      errors[`${prefix}.unitOfMeasureId`] = ['UOM material wajib dipilih.']
    }

    if (!normalized.targetQuantity) {
      errors[`${prefix}.targetQuantity`] = ['Target quantity wajib diisi.']
    } else if (!isPositiveNumber(normalized.targetQuantity)) {
      errors[`${prefix}.targetQuantity`] = ['Target quantity harus lebih dari 0.']
    }

    if (normalized.toleranceValue && !isNonNegativeNumber(normalized.toleranceValue)) {
      errors[`${prefix}.toleranceValue`] = ['Tolerance tidak boleh negatif.']
    }
  }

  if (step.stepType === RecipeStepType.Process || step.stepType === RecipeStepType.Check) {
    if (!normalized.instruction) {
      errors[`${prefix}.instruction`] = ['Instruction wajib diisi.']
    }
  }

  if (step.stepType === RecipeStepType.Timer) {
    if (!normalized.instruction) {
      errors[`${prefix}.instruction`] = ['Instruction wajib diisi.']
    }

    if (!normalized.timerSeconds) {
      errors[`${prefix}.timerSeconds`] = ['Timer seconds wajib diisi.']
    } else if (!isPositiveNumber(normalized.timerSeconds)) {
      errors[`${prefix}.timerSeconds`] = ['Timer seconds harus lebih dari 0.']
    }
  }

  return errors
}

export function validateRecipeCreateForm(values: RecipeCreateFormValues): MasterDataFormErrors {
  const normalized = normalizeRecipeCreateFormValues(values)
  const errors: MasterDataFormErrors = {}

  if (!normalized.productId) {
    errors.productId = ['Product wajib dipilih.']
  }

  if (!normalized.name) {
    errors.name = ['Recipe name wajib diisi.']
  }

  if (!normalized.standardOutputQuantity) {
    errors.standardOutputQuantity = ['Standard output wajib diisi.']
  } else if (!isPositiveNumber(normalized.standardOutputQuantity)) {
    errors.standardOutputQuantity = ['Standard output harus lebih dari 0.']
  }

  if (!normalized.unitOfMeasureId) {
    errors.unitOfMeasureId = ['UOM output wajib dipilih.']
  }

  if (normalized.steps.length === 0) {
    errors.steps = ['Minimal harus ada satu step.']
  }

  normalized.steps.forEach((step, index) => {
    Object.assign(errors, validateRecipeStep(step, index))
  })

  return errors
}

export function validateRecipeVersionCreateForm(values: RecipeVersionCreateFormValues): MasterDataFormErrors {
  const normalized = normalizeRecipeVersionCreateFormValues(values)
  const errors: MasterDataFormErrors = {}

  if (!normalized.standardOutputQuantity) {
    errors.standardOutputQuantity = ['Standard output wajib diisi.']
  } else if (!isPositiveNumber(normalized.standardOutputQuantity)) {
    errors.standardOutputQuantity = ['Standard output harus lebih dari 0.']
  }

  if (!normalized.unitOfMeasureId) {
    errors.unitOfMeasureId = ['UOM output wajib dipilih.']
  }

  return errors
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

export function formatOptionalText(value: string) {
  return normalizeOptionalText(value)
}

export function mapRecipeStepToFormValues(step: RecipeStep): RecipeStepFormValues {
  return {
    id: step.id,
    stepType: step.stepType,
    rawMaterialId: step.rawMaterial?.id ?? '',
    targetQuantity: step.targetQuantity?.toString() ?? '',
    unitOfMeasureId: step.unitOfMeasure?.id ?? '',
    toleranceType: step.toleranceType ?? '',
    toleranceValue: step.toleranceValue?.toString() ?? '',
    instruction: step.instruction ?? '',
    timerSeconds: step.timerSeconds?.toString() ?? '',
  }
}
