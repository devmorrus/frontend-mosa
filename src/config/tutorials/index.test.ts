import { describe, expect, it } from 'vitest'
import { allTutorials, getAvailableTutorials, tutorialRegistry } from './index'

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
})
