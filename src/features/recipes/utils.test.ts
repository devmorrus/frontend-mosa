import { describe, expect, it } from 'vitest'
import { RecipeLifecycleStatus, RecipeStepType, type RecipeQueryState } from '@/features/recipes/types'
import {
  countRecipeStepTypes,
  getRecipeStatusFilterLabel,
  getRecipeStatusLabel,
  getRecipeStatusTone,
  hasActiveRecipeApprovalFilters,
  hasActiveRecipeListFilters,
  isReadOnlyRecipeVersion,
  isRecipeVersionEditable,
  moveRecipeStep,
} from '@/features/recipes/utils'

describe('recipe utils', () => {
  it('maps lifecycle status labels and tones', () => {
    expect(getRecipeStatusLabel(RecipeLifecycleStatus.PendingApproval)).toBe('Pending Approval')
    expect(getRecipeStatusTone(RecipeLifecycleStatus.Approved)).toBe('success')
    expect(getRecipeStatusTone(RecipeLifecycleStatus.NeedsRevision)).toBe('danger')
  })

  it('detects editable and read-only statuses', () => {
    expect(isRecipeVersionEditable(RecipeLifecycleStatus.Draft)).toBe(true)
    expect(isRecipeVersionEditable(RecipeLifecycleStatus.NeedsRevision)).toBe(true)
    expect(isRecipeVersionEditable(RecipeLifecycleStatus.Approved)).toBe(false)
    expect(isReadOnlyRecipeVersion(RecipeLifecycleStatus.Approved)).toBe(true)
    expect(isReadOnlyRecipeVersion(RecipeLifecycleStatus.Historical)).toBe(true)
  })

  it('detects active list and approval filters', () => {
    const query: RecipeQueryState = { search: '', status: 'ALL', productId: '', page: 1, pageSize: 10 }

    expect(hasActiveRecipeListFilters(query)).toBe(false)
    expect(hasActiveRecipeListFilters({ ...query, status: 'APPROVED' })).toBe(true)
    expect(hasActiveRecipeListFilters({ ...query, search: 'rendang' })).toBe(true)
    expect(hasActiveRecipeApprovalFilters({ search: '', page: 1, pageSize: 10 })).toBe(false)
    expect(hasActiveRecipeApprovalFilters({ search: 'rendang', page: 1, pageSize: 10 })).toBe(true)
    expect(getRecipeStatusFilterLabel('NEEDS_REVISION')).toBe('Needs Revision')
  })

  it('counts step types', () => {
    expect(countRecipeStepTypes([
      { stepType: RecipeStepType.Material },
      { stepType: RecipeStepType.Process },
      { stepType: RecipeStepType.Timer },
      { stepType: RecipeStepType.Check },
      { stepType: RecipeStepType.Material },
    ])).toEqual({ material: 2, process: 1, timer: 1, check: 1 })
  })

  it('moves recipe steps without mutating invalid boundaries', () => {
    const steps = [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
    ] as Parameters<typeof moveRecipeStep>[0]

    expect(moveRecipeStep(steps, 1, -1).map((step) => step.id)).toEqual(['b', 'a', 'c'])
    expect(moveRecipeStep(steps, 0, -1)).toBe(steps)
    expect(moveRecipeStep(steps, 2, 1)).toBe(steps)
  })
})
