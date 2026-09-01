import { create } from 'zustand'

export type RecipeTutorialStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
export type TutorialTimerState = { remainingSeconds: number; status: 'IDLE' | 'RUNNING' | 'PAUSED' }

export interface RecipeTutorialProgress {
  recipeVersionId: string
  targetOutput: number
  currentUnlockedStep: number
  viewedStep: number
  completedStepIds: string[]
  timers: Record<string, TutorialTimerState>
  status: RecipeTutorialStatus
  updatedAt: string
}

function storageKey(userId: string, recipeVersionId: string, targetOutput: number) {
  return `mosa_recipe_tutorial_v1:${userId}:${recipeVersionId}:${targetOutput}`
}

function readProgress(userId: string, recipeVersionId: string, targetOutput: number): RecipeTutorialProgress | null {
  try {
    const value = localStorage.getItem(storageKey(userId, recipeVersionId, targetOutput))
    return value ? JSON.parse(value) as RecipeTutorialProgress : null
  } catch { return null }
}

function saveProgress(userId: string, progress: RecipeTutorialProgress) {
  try { localStorage.setItem(storageKey(userId, progress.recipeVersionId, progress.targetOutput), JSON.stringify(progress)) } catch { /* storage is optional */ }
}

interface RecipeTutorialStore {
  progress: RecipeTutorialProgress | null
  restore: (userId: string, recipeVersionId: string, targetOutput: number) => void
  start: (userId: string, recipeVersionId: string, targetOutput: number) => void
  view: (userId: string, index: number) => void
  completeStep: (userId: string, stepId: string, totalSteps: number) => void
  setTimer: (userId: string, stepId: string, timer: TutorialTimerState) => void
  restart: (userId: string) => void
  close: () => void
}

function persist(set: (state: Partial<RecipeTutorialStore>) => void, userId: string, progress: RecipeTutorialProgress) {
  const next = { ...progress, updatedAt: new Date().toISOString() }
  saveProgress(userId, next)
  set({ progress: next })
}

export const useRecipeTutorialStore = create<RecipeTutorialStore>((set, get) => ({
  progress: null,
  restore: (userId, recipeVersionId, targetOutput) => set({ progress: readProgress(userId, recipeVersionId, targetOutput) }),
  start: (userId, recipeVersionId, targetOutput) => {
    const existing = readProgress(userId, recipeVersionId, targetOutput)
    if (existing?.status === 'IN_PROGRESS') return set({ progress: existing })
    persist(set, userId, { recipeVersionId, targetOutput, currentUnlockedStep: 0, viewedStep: 0, completedStepIds: [], timers: {}, status: 'IN_PROGRESS', updatedAt: new Date().toISOString() })
  },
  view: (userId, index) => {
    const progress = get().progress
    if (!progress || index < 0 || index > progress.currentUnlockedStep) return
    persist(set, userId, { ...progress, viewedStep: index })
  },
  completeStep: (userId, stepId, totalSteps) => {
    const progress = get().progress
    if (!progress || progress.status !== 'IN_PROGRESS') return
    const completed = [...new Set([...progress.completedStepIds, stepId])]
    const isFinal = progress.currentUnlockedStep >= totalSteps - 1
    persist(set, userId, { ...progress, completedStepIds: completed, currentUnlockedStep: isFinal ? progress.currentUnlockedStep : progress.currentUnlockedStep + 1, viewedStep: isFinal ? progress.currentUnlockedStep : progress.currentUnlockedStep + 1, status: isFinal ? 'COMPLETED' : 'IN_PROGRESS' })
  },
  setTimer: (userId, stepId, timer) => {
    const progress = get().progress
    if (!progress) return
    persist(set, userId, { ...progress, timers: { ...progress.timers, [stepId]: timer } })
  },
  restart: (userId) => {
    const progress = get().progress
    if (!progress) return
    persist(set, userId, { ...progress, currentUnlockedStep: 0, viewedStep: 0, completedStepIds: [], timers: {}, status: 'IN_PROGRESS' })
  },
  close: () => set({ progress: null }),
}))
