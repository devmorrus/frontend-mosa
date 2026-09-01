import { create } from 'zustand'
import { MATERIAL_SIMULATION_PAGE_SIZE, MAX_SIMULATED_LOTS } from '@/features/recipes/tutorial/material-simulation/validation'
import type { MaterialSimulationSeed, MaterialSimulationState } from '@/features/recipes/tutorial/material-simulation/types'

export type RecipeTutorialStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
export type TutorialTimerState = { remainingSeconds: number; status: 'IDLE' | 'RUNNING' | 'PAUSED' }
export type TutorialDeviationSimulation = { status: 'IDLE' | 'REQUESTED' | 'APPROVED' | 'REJECTED'; reason: string; updatedAt: string; reviewNotes: string | null }

export interface RecipeTutorialProgress {
  recipeVersionId: string
  targetOutput: number
  currentUnlockedStep: number
  viewedStep: number
  completedStepIds: string[]
  timers: Record<string, TutorialTimerState>
  materialSimulations: Record<string, MaterialSimulationState>
  deviationSimulations: Record<string, TutorialDeviationSimulation>
  status: RecipeTutorialStatus
  updatedAt: string
}

function storageKey(userId: string, recipeVersionId: string, targetOutput: number) {
  return `mosa_recipe_tutorial_v1:${userId}:${recipeVersionId}:${targetOutput}`
}

function readProgress(userId: string, recipeVersionId: string, targetOutput: number): RecipeTutorialProgress | null {
  try {
    const value = localStorage.getItem(storageKey(userId, recipeVersionId, targetOutput))
    if (!value) return null
    const progress = JSON.parse(value) as RecipeTutorialProgress
    return { ...progress, materialSimulations: progress.materialSimulations ?? {}, deviationSimulations: progress.deviationSimulations ?? {} }
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
  scanMaterialLot: (userId: string, seed: MaterialSimulationSeed) => void
  addMaterialLot: (userId: string, seed: MaterialSimulationSeed) => void
  updateMaterialActual: (userId: string, stepId: string, lotId: string, actualQuantity: string) => void
  removeMaterialLot: (userId: string, stepId: string, lotId: string) => void
  setMaterialLotPage: (userId: string, stepId: string, page: number) => void
  setDeviationSimulation: (userId: string, stepId: string, value: TutorialDeviationSimulation) => void
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
    persist(set, userId, { recipeVersionId, targetOutput, currentUnlockedStep: 0, viewedStep: 0, completedStepIds: [], timers: {}, materialSimulations: {}, deviationSimulations: {}, status: 'IN_PROGRESS', updatedAt: new Date().toISOString() })
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
  scanMaterialLot: (userId, seed) => {
    const progress = get().progress
    if (!progress || progress.materialSimulations[seed.stepId]?.lots.length) return
    const lot = createSimulationLot(seed, 1)
    persist(set, userId, { ...progress, materialSimulations: { ...progress.materialSimulations, [seed.stepId]: { lots: [lot], page: 1, pageSize: MATERIAL_SIMULATION_PAGE_SIZE } } })
  },
  addMaterialLot: (userId, seed) => {
    const progress = get().progress
    if (!progress) return
    const state = progress.materialSimulations[seed.stepId] ?? { lots: [], page: 1, pageSize: MATERIAL_SIMULATION_PAGE_SIZE }
    if (state.lots.length >= MAX_SIMULATED_LOTS) return
    const lots = [...state.lots, createSimulationLot(seed, state.lots.length + 1)]
    const totalPages = Math.ceil(lots.length / state.pageSize)
    persist(set, userId, { ...progress, materialSimulations: { ...progress.materialSimulations, [seed.stepId]: { ...state, lots, page: totalPages } } })
  },
  updateMaterialActual: (userId, stepId, lotId, actualQuantity) => {
    const progress = get().progress
    const state = progress?.materialSimulations[stepId]
    if (!progress || !state) return
    persist(set, userId, { ...progress, materialSimulations: { ...progress.materialSimulations, [stepId]: { ...state, lots: state.lots.map((lot) => lot.id === lotId ? { ...lot, actualQuantity } : lot) } } })
  },
  removeMaterialLot: (userId, stepId, lotId) => {
    const progress = get().progress
    const state = progress?.materialSimulations[stepId]
    if (!progress || !state || state.lots[0]?.id === lotId) return
    const lots = state.lots.filter((lot) => lot.id !== lotId)
    const totalPages = Math.max(1, Math.ceil(lots.length / state.pageSize))
    persist(set, userId, { ...progress, materialSimulations: { ...progress.materialSimulations, [stepId]: { ...state, lots, page: Math.min(state.page, totalPages) } } })
  },
  setMaterialLotPage: (userId, stepId, page) => {
    const progress = get().progress
    const state = progress?.materialSimulations[stepId]
    if (!progress || !state) return
    const totalPages = Math.max(1, Math.ceil(state.lots.length / state.pageSize))
    persist(set, userId, { ...progress, materialSimulations: { ...progress.materialSimulations, [stepId]: { ...state, page: Math.min(Math.max(page, 1), totalPages) } } })
  },
  setDeviationSimulation: (userId, stepId, value) => {
    const progress = get().progress
    if (!progress) return
    persist(set, userId, { ...progress, deviationSimulations: { ...progress.deviationSimulations, [stepId]: value } })
  },
  restart: (userId) => {
    const progress = get().progress
    if (!progress) return
    persist(set, userId, { ...progress, currentUnlockedStep: 0, viewedStep: 0, completedStepIds: [], timers: {}, materialSimulations: {}, deviationSimulations: {}, status: 'IN_PROGRESS' })
  },
  close: () => set({ progress: null }),
}))

function createSimulationLot(seed: MaterialSimulationSeed, ordinal: number) {
  const suffix = String(ordinal).padStart(2, '0')
  return {
    id: `${seed.stepId}:lot:${ordinal}`,
    lotCode: `SIM-${seed.materialCode || `STEP${seed.sequence}`}-${suffix}`,
    materialCode: seed.materialCode,
    materialName: seed.materialName,
    availableQuantity: seed.targetQuantity,
    actualQuantity: '',
    isScanned: true,
  }
}
