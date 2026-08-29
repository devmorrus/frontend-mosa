import { apiClient } from '@/api/client'
import { mapPaginatedResponse } from '@/api/master-data.shared'
import {
  RecipeStepType,
  type RecipeCreateFormValues,
  type RecipeDetail,
  type RecipeListItem,
  type RecipeListResult,
  type RecipeQueryState,
  type RecipeScalingPreview,
  type RecipeVersionCreateFormValues,
  type RecipeVersionDetail,
  type RecipeVersionListItem,
  type RecipeVersionListResult,
} from '@/features/recipes/types'
import { formatOptionalText, normalizeRecipeCreateFormValues, normalizeRecipeVersionCreateFormValues } from '@/features/recipes/validation'
import type { ApiPaginatedResponse } from '@/types/api'

function mapRecipeStatus(status: RecipeQueryState['status']) {
  return status === 'ALL' ? undefined : status
}

function toNullableGuid(value: string) {
  const trimmed = value.trim()
  return trimmed || null
}

function toNullableDecimal(value: string) {
  const trimmed = value.trim()
  return trimmed ? Number(trimmed) : null
}

function toNullableInteger(value: string) {
  const trimmed = value.trim()
  return trimmed ? Number(trimmed) : null
}

function buildStepPayload(values: RecipeCreateFormValues['steps']) {
  return values.map((step, index) => ({
    sequence: index + 1,
    stepType: step.stepType,
    rawMaterialId: step.stepType === RecipeStepType.Material ? toNullableGuid(step.rawMaterialId) : null,
    targetQuantity: step.stepType === RecipeStepType.Material ? toNullableDecimal(step.targetQuantity) : null,
    unitOfMeasureId: step.stepType === RecipeStepType.Material ? toNullableGuid(step.unitOfMeasureId) : null,
    toleranceType: step.stepType === RecipeStepType.Material && step.toleranceType !== '' ? step.toleranceType : null,
    toleranceValue:
      step.stepType === RecipeStepType.Material && step.toleranceValue.trim()
        ? toNullableDecimal(step.toleranceValue)
        : null,
    instruction: step.stepType === RecipeStepType.Material ? formatOptionalText(step.instruction) : formatOptionalText(step.instruction),
    timerSeconds: step.stepType === RecipeStepType.Timer ? toNullableInteger(step.timerSeconds) : null,
  }))
}

export const recipesApi = {
  list: (query: RecipeQueryState): Promise<RecipeListResult> =>
    apiClient
      .get<ApiPaginatedResponse<RecipeListItem>>('/recipes', {
        params: {
          search: query.search || undefined,
          status: mapRecipeStatus(query.status),
          productId: query.productId || undefined,
          page: query.page,
          pageSize: query.pageSize,
        },
      })
      .then((response) => mapPaginatedResponse(response.data)),

  getById: (id: string) =>
    apiClient.get<RecipeDetail>(`/recipes/${id}`).then((response) => response.data),

  getVersions: (recipeId: string, query: { status: RecipeQueryState['status']; page: number; pageSize: number }): Promise<RecipeVersionListResult> =>
    apiClient
      .get<ApiPaginatedResponse<RecipeVersionListItem>>(`/recipes/${recipeId}/versions`, {
        params: {
          status: mapRecipeStatus(query.status),
          page: query.page,
          pageSize: query.pageSize,
        },
      })
      .then((response) => mapPaginatedResponse(response.data)),

  create: (values: RecipeCreateFormValues) => {
    const normalized = normalizeRecipeCreateFormValues(values)

    return apiClient
      .post<RecipeDetail>('/recipes', {
        productId: normalized.productId,
        name: normalized.name,
        standardOutputQuantity: Number(normalized.standardOutputQuantity),
        unitOfMeasureId: normalized.unitOfMeasureId,
        steps: buildStepPayload(normalized.steps),
      })
      .then((response) => response.data)
  },

  createVersion: (recipeId: string, values: RecipeVersionCreateFormValues) => {
    const normalized = normalizeRecipeVersionCreateFormValues(values)

    return apiClient
      .post<RecipeVersionDetail>(`/recipes/${recipeId}/versions`, {
        standardOutputQuantity: Number(normalized.standardOutputQuantity),
        unitOfMeasureId: normalized.unitOfMeasureId,
      })
      .then((response) => response.data)
  },

  getVersionById: (versionId: string) =>
    apiClient.get<RecipeVersionDetail>(`/recipe-versions/${versionId}`).then((response) => response.data),

  previewScaling: (versionId: string, targetOutputQuantity: number) =>
    apiClient
      .post<RecipeScalingPreview>(`/recipe-versions/${versionId}/preview-scaling`, {
        targetOutputQuantity,
      })
      .then((response) => response.data),
}
