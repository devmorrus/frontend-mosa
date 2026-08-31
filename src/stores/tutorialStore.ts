import { create } from 'zustand'
import type { UserTutorialProgress } from '@/types/tutorial'

const STORAGE_KEY = 'mosa_tutorial_progress_v1'

function loadSavedProgress(): Record<string, UserTutorialProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, UserTutorialProgress>
  } catch {
    return {}
  }
}

function saveProgress(progress: Record<string, UserTutorialProgress>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // ignore storage errors
  }
}

interface TutorialStateStore {
  activeTutorialId: string | null
  currentStepIndex: number
  isActionValid: boolean
  progressRecord: Record<string, UserTutorialProgress>

  startTutorial: (tutorialId: string, resetToBeginning?: boolean) => void
  nextStep: (totalSteps?: number) => void
  previousStep: () => void
  skipTutorial: () => void
  closeTutorial: () => void
  restartTutorial: (tutorialId: string) => void
  setStepValid: (isValid: boolean) => void
  completeTutorial: () => void
  getTutorialProgress: (tutorialId: string) => UserTutorialProgress | undefined
}

export const useTutorialStore = create<TutorialStateStore>((set, get) => ({
  activeTutorialId: null,
  currentStepIndex: 0,
  isActionValid: true,
  progressRecord: loadSavedProgress(),

  startTutorial: (tutorialId: string, resetToBeginning = false) => {
    const record = get().progressRecord
    const existing = record[tutorialId]
    const startIndex = !resetToBeginning && existing?.status === 'IN_PROGRESS'
      ? existing.currentStepIndex
      : 0

    const updatedRecord: Record<string, UserTutorialProgress> = {
      ...record,
      [tutorialId]: {
        tutorialId,
        status: 'IN_PROGRESS',
        currentStepIndex: startIndex,
        updatedAt: new Date().toISOString(),
      },
    }

    saveProgress(updatedRecord)
    set({
      activeTutorialId: tutorialId,
      currentStepIndex: startIndex,
      isActionValid: true,
      progressRecord: updatedRecord,
    })
  },

  nextStep: (totalSteps?: number) => {
    const { activeTutorialId, currentStepIndex, progressRecord } = get()
    if (!activeTutorialId) return

    const nextIndex = currentStepIndex + 1

    if (totalSteps && nextIndex >= totalSteps) {
      get().completeTutorial()
      return
    }

    const updatedRecord: Record<string, UserTutorialProgress> = {
      ...progressRecord,
      [activeTutorialId]: {
        ...progressRecord[activeTutorialId],
        currentStepIndex: nextIndex,
        updatedAt: new Date().toISOString(),
      },
    }

    saveProgress(updatedRecord)
    set({
      currentStepIndex: nextIndex,
      isActionValid: true,
      progressRecord: updatedRecord,
    })
  },

  previousStep: () => {
    const { activeTutorialId, currentStepIndex, progressRecord } = get()
    if (!activeTutorialId || currentStepIndex <= 0) return

    const prevIndex = currentStepIndex - 1
    const updatedRecord: Record<string, UserTutorialProgress> = {
      ...progressRecord,
      [activeTutorialId]: {
        ...progressRecord[activeTutorialId],
        currentStepIndex: prevIndex,
        updatedAt: new Date().toISOString(),
      },
    }

    saveProgress(updatedRecord)
    set({
      currentStepIndex: prevIndex,
      isActionValid: true,
      progressRecord: updatedRecord,
    })
  },

  skipTutorial: () => {
    const { activeTutorialId, progressRecord } = get()
    if (!activeTutorialId) return

    const updatedRecord: Record<string, UserTutorialProgress> = {
      ...progressRecord,
      [activeTutorialId]: {
        ...progressRecord[activeTutorialId],
        status: 'SKIPPED',
        updatedAt: new Date().toISOString(),
      },
    }

    saveProgress(updatedRecord)
    set({
      activeTutorialId: null,
      currentStepIndex: 0,
      isActionValid: true,
      progressRecord: updatedRecord,
    })
  },

  closeTutorial: () => {
    set({ activeTutorialId: null, isActionValid: true })
  },

  restartTutorial: (tutorialId: string) => {
    get().startTutorial(tutorialId, true)
  },

  setStepValid: (isValid: boolean) => {
    set({ isActionValid: isValid })
  },

  completeTutorial: () => {
    const { activeTutorialId, progressRecord } = get()
    if (!activeTutorialId) return

    const updatedRecord: Record<string, UserTutorialProgress> = {
      ...progressRecord,
      [activeTutorialId]: {
        ...progressRecord[activeTutorialId],
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }

    saveProgress(updatedRecord)
    set({
      activeTutorialId: null,
      currentStepIndex: 0,
      isActionValid: true,
      progressRecord: updatedRecord,
    })
  },

  getTutorialProgress: (tutorialId: string) => {
    return get().progressRecord[tutorialId]
  },
}))
