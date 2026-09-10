import { describe, expect, it } from 'vitest'
import { allTutorials, getAvailableTutorials, tutorialRegistry } from './index'
import { validateTutorialSchema } from './tutorialSchema'

describe('tutorial registry access rules', () => {
  it('contains only registered tutorial definitions', () => {
    expect(Object.keys(tutorialRegistry)).toHaveLength(allTutorials.length)
    expect(allTutorials.every((tutorial) => tutorialRegistry[tutorial.id] === tutorial)).toBe(true)
  })

  it('filters by permission and role case-insensitively', () => {
    const available = getAvailableTutorials(['production-orders.execute'], ['operator'])
    expect(available.some((tutorial) => tutorial.id === 'guided-production')).toBe(true)
    expect(getAvailableTutorials([], ['operator']).some((tutorial) => tutorial.id === 'guided-production')).toBe(false)
    expect(getAvailableTutorials(['production-orders.execute'], ['QC']).some((tutorial) => tutorial.id === 'guided-production')).toBe(false)
  })

  it('does not define critical transaction steps as executable actions', () => {
    for (const tutorial of allTutorials) {
      for (const step of tutorial.steps) {
        if (step.critical) expect(step.type).toBe('INFO')
      }
    }
  })

  it('passes schema validation with zero issues (stable data-tour selectors, sequential steps)', () => {
    expect(validateTutorialSchema(allTutorials)).toEqual([])
  })

  it('keeps the master-data save step informational so no real supplier is created', () => {
    const masterData = tutorialRegistry['master-data']
    const saveStep = masterData.steps.find((step) => step.id === 'step-6-save-supplier')
    expect(saveStep?.type).toBe('INFO')
    expect(saveStep?.critical).toBe(true)
    expect(saveStep?.requiredAction).toBeUndefined()
  })

  it('provides a fallback for every conditionally-hidden target (dialogs, dropdowns, empty queues)', () => {
    const conditionalTargets = new Set([
      '[data-tour="user-create"]',
      '[data-tour="user-role"]',
      '[data-tour="user-status"]',
      '[data-tour="user-revoke-session"]',
      '[data-tour="role-select"]',
      '[data-tour="permission-group"]',
      '[data-tour="permission-save"]',
      '[data-tour="audit-detail"]',
      '[data-tour="audit-change"]',
      '[data-tour="deviation-queue-row"]',
      '[data-tour="qc-queue-row"]',
    ])
    for (const tutorial of allTutorials) {
      for (const step of tutorial.steps) {
        if (conditionalTargets.has(step.targetSelector)) {
          expect(
            step.targetFallback,
            `${tutorial.id}/${step.id} targets hidden element without fallback`,
          ).toBeTruthy()
        }
      }
    }
  })

  it('mirrors the backend catalog visibility (view-only permissions)', () => {
    const viewOnly: Record<string, string> = {
      'master-data': 'suppliers.view',
      'goods-receiving': 'receiving.view',
      'recipe-builder': 'recipes.view',
      'production-order': 'production-orders.view',
    }
    for (const [id, permission] of Object.entries(viewOnly)) {
      expect(tutorialRegistry[id].requiredPermissions).toEqual([permission])
    }
  })
})
