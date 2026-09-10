import { beforeEach, describe, expect, it } from 'vitest'
import { getRecipeTutorialStorageKey, useRecipeTutorialStore } from './recipeTutorialStore'

describe('recipe tutorial progress isolation', () => {
  beforeEach(() => {
    useRecipeTutorialStore.setState({ progress: null })
  })

  it('keeps two recipe versions and target outputs independent', () => {
    const store = useRecipeTutorialStore.getState()
    store.start('user-1', 'recipe-a', 10)
    store.completeStep('user-1', 'step-a', 2)
    const recipeA = useRecipeTutorialStore.getState().progress

    store.start('user-1', 'recipe-b', 20)
    expect(useRecipeTutorialStore.getState().progress?.recipeVersionId).toBe('recipe-b')
    expect(useRecipeTutorialStore.getState().progress?.completedStepIds).toEqual([])
    expect(getRecipeTutorialStorageKey('user-1', 'recipe-a', 10)).not.toBe(
      getRecipeTutorialStorageKey('user-1', 'recipe-b', 20),
    )
    expect(recipeA?.completedStepIds).toEqual(['step-a'])
  })
})
