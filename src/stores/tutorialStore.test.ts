import { beforeEach, describe, expect, it } from 'vitest'
import { useTutorialStore } from './tutorialStore'

describe('tutorialStore persistence and navigation', () => {
  beforeEach(() => {
    useTutorialStore.setState({
      activeTutorialId: null,
      currentStepIndex: 0,
      isActionValid: true,
      progressRecord: {},
    })
  })

  it('supports next, back, skip, and resume after a fresh store state', () => {
    const store = useTutorialStore.getState()
    store.startTutorial('dashboard')
    store.nextStep(4)
    expect(useTutorialStore.getState().currentStepIndex).toBe(1)

    store.previousStep()
    expect(useTutorialStore.getState().currentStepIndex).toBe(0)

    store.nextStep(4)
    useTutorialStore.setState({ activeTutorialId: null, currentStepIndex: 0 })
    useTutorialStore.getState().startTutorial('dashboard')
    expect(useTutorialStore.getState().currentStepIndex).toBe(1)

    useTutorialStore.getState().skipTutorial()
    expect(useTutorialStore.getState().getTutorialProgress('dashboard')?.status).toBe('SKIPPED')
  })

  it('restarts completed progress at the first step', () => {
    const store = useTutorialStore.getState()
    store.startTutorial('dashboard')
    store.nextStep(1)
    expect(useTutorialStore.getState().getTutorialProgress('dashboard')?.status).toBe('COMPLETED')

    store.restartTutorial('dashboard')
    expect(useTutorialStore.getState().currentStepIndex).toBe(0)
    expect(useTutorialStore.getState().getTutorialProgress('dashboard')?.status).toBe('IN_PROGRESS')
  })
})
