import { apiClient } from '@/api/client'
import { mapPaginatedResponse } from '@/api/master-data.shared'
import {
  RecipeStepType,
  type RecipeApprovalQueueQueryState,
  type RecipeApprovalQueueResult,
  type RecipeCreateFormValues,
  type RecipeDetail,
  type RecipeListItem,
  type RecipeListResult,
  type RecipeQueryState,
  type RecipeScalingPreview,
  type GuidedRecipePreview,
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
  return values.map((step, index) => buildSingleStepPayload(step, index + 1))
}

function buildSingleStepPayload(step: RecipeCreateFormValues['steps'][number], sequence: number) {
  return {
    sequence,
    stepType: step.stepType,
    rawMaterialId: step.stepType === RecipeStepType.Material ? toNullableGuid(step.rawMaterialId) : null,
    targetQuantity: step.stepType === RecipeStepType.Material ? toNullableDecimal(step.targetQuantity) : null,
    unitOfMeasureId: step.stepType === RecipeStepType.Material ? toNullableGuid(step.unitOfMeasureId) : null,
    toleranceType: step.stepType === RecipeStepType.Material && step.toleranceType !== '' ? step.toleranceType : null,
    toleranceValue:
      step.stepType === RecipeStepType.Material && step.toleranceValue.trim()
        ? toNullableDecimal(step.toleranceValue)
        : null,
    instruction: formatOptionalText(step.instruction),
    timerSeconds: step.stepType === RecipeStepType.Timer ? toNullableInteger(step.timerSeconds) : null,
    checkItems: step.stepType === RecipeStepType.Check ? step.checkItems.map((item) => item.trim()).filter(Boolean) : [],
  }
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

  getApprovalQueue: (query: RecipeApprovalQueueQueryState): Promise<RecipeApprovalQueueResult> =>
    apiClient
      .get<ApiPaginatedResponse<import('@/features/recipes/types').RecipeApprovalQueueItem>>('/recipe-versions/approval-queue', {
        params: {
          search: query.search || undefined,
          page: query.page,
          pageSize: query.pageSize,
        },
      })
      .then((response) => mapPaginatedResponse(response.data)),

  updateVersion: (versionId: string, values: RecipeVersionCreateFormValues, name?: string | null) => {
    const normalized = normalizeRecipeVersionCreateFormValues(values)

    return apiClient
      .put<RecipeVersionDetail>(`/recipe-versions/${versionId}`, {
        name: name?.trim() || null,
        standardOutputQuantity: Number(normalized.standardOutputQuantity),
        unitOfMeasureId: normalized.unitOfMeasureId,
      })
      .then((response) => response.data)
  },

  saveBuilder: (versionId: string, values: RecipeVersionCreateFormValues, steps: RecipeCreateFormValues['steps'], name?: string | null) => {
    const normalized = normalizeRecipeVersionCreateFormValues(values)

    return apiClient
      .put<RecipeVersionDetail>(`/recipe-versions/${versionId}/builder`, {
        name: name?.trim() || null,
        standardOutputQuantity: Number(normalized.standardOutputQuantity),
        unitOfMeasureId: normalized.unitOfMeasureId,
        steps: buildStepPayload(steps),
      })
      .then((response) => response.data)
  },

  addStep: (versionId: string, step: RecipeCreateFormValues['steps'][number], sequence: number) =>
    apiClient
      .post<RecipeVersionDetail>(`/recipe-versions/${versionId}/steps`, buildSingleStepPayload(step, sequence))
      .then((response) => response.data),

  getGuidedPreview: (versionId: string, params: { targetOutput?: number; page: number; pageSize: number }) =>
    apiClient
      .get<GuidedRecipePreview>(`/recipe-versions/${versionId}/guided-preview`, { params })
      .then((response) => response.data),

  updateStep: (versionId: string, stepId: string, step: RecipeCreateFormValues['steps'][number], sequence: number) =>
    apiClient
      .put<RecipeVersionDetail>(`/recipe-versions/${versionId}/steps/${stepId}`, buildSingleStepPayload(step, sequence))
      .then((response) => response.data),

  deleteStep: (versionId: string, stepId: string) =>
    apiClient.delete<void>(`/recipe-versions/${versionId}/steps/${stepId}`),

  reorderSteps: (versionId: string, items: Array<{ stepId: string; sequence: number }>) =>
    apiClient
      .put<RecipeVersionDetail>(`/recipe-versions/${versionId}/steps/reorder`, {
        items: items.map((item) => ({
          stepId: item.stepId,
          sequence: item.sequence,
        })),
      })
      .then((response) => response.data),

  submitVersion: (versionId: string) =>
    apiClient.post<RecipeVersionDetail>(`/recipe-versions/${versionId}/submit`).then((response) => response.data),

  approveVersion: (versionId: string, approvalNotes: string) =>
    apiClient
      .post<RecipeVersionDetail>(`/recipe-versions/${versionId}/approve`, {
        approvalNotes: formatOptionalText(approvalNotes),
      })
      .then((response) => response.data),

  rejectVersion: (versionId: string, reason: string) =>
    apiClient
      .post<RecipeVersionDetail>(`/recipe-versions/${versionId}/reject`, {
        reason: reason.trim(),
      })
      .then((response) => response.data),

  previewScaling: (versionId: string, targetOutputQuantity: number) =>
    apiClient
      .post<RecipeScalingPreview>(`/recipe-versions/${versionId}/preview-scaling`, {
        targetOutputQuantity,
      })
      .then((response) => response.data),
}
