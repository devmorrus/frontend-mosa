import { describe, expect, it } from 'vitest'
import type { OperatorProductionCurrentStep } from '@/features/operator-production/types'
import { ProductionStepExecutionStatus } from '@/features/operator-production/types'
import { RecipeStepType, RecipeToleranceType } from '@/features/recipes/types'
import { buildStepVoiceInstruction } from './voiceGuidance'

function step(overrides: Partial<OperatorProductionCurrentStep>): OperatorProductionCurrentStep {
  return {
    id: 'step-1',
    sequence: 1,
    stepName: 'Gula Pasir',
    stepType: RecipeStepType.Material,
    instruction: null,
    rawMaterialName: 'Gula Pasir',
    targetQuantity: 10,
    unitOfMeasureSymbol: 'kg',
    toleranceType: RecipeToleranceType.None,
    toleranceValue: null,
    timerSeconds: null,
    timerEndsAtUtc: null,
    status: ProductionStepExecutionStatus.Ready,
    isConfirmed: false,
    ...overrides,
  }
}

describe('operator production voice guidance', () => {
  it('builds a material instruction from material name, quantity, and unit', () => {
    expect(buildStepVoiceInstruction(step({}))).toBe('Tambahkan Gula Pasir sebanyak 10 kg.')
  })

  it('uses explicit material instruction when available', () => {
    expect(buildStepVoiceInstruction(step({ instruction: 'Tambahkan gula sesuai takaran' }))).toBe('Tambahkan gula sesuai takaran.')
  })

  it('builds a timer instruction with spoken duration', () => {
    expect(buildStepVoiceInstruction(step({
      stepType: RecipeStepType.Timer,
      instruction: 'Aduk perlahan',
      timerSeconds: 90,
      rawMaterialName: null,
      targetQuantity: null,
      unitOfMeasureSymbol: null,
    }))).toBe('Mulai timer. Aduk perlahan. Durasi 1 menit 30 detik.')
  })

  it('builds process and check instructions', () => {
    expect(buildStepVoiceInstruction(step({ stepType: RecipeStepType.Process, instruction: 'Panaskan bahan' }))).toBe('Mulai proses. Panaskan bahan.')
    expect(buildStepVoiceInstruction(step({ stepType: RecipeStepType.Check, instruction: 'Pastikan warna merata' }))).toBe('Lakukan pemeriksaan. Pastikan warna merata. Centang konfirmasi setelah selesai.')
  })
})
