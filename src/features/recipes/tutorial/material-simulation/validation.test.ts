import { describe, expect, it } from 'vitest'
import { RecipeToleranceType } from '@/features/recipes/types'
import { validateMaterialSimulation } from './validation'
import type { MaterialSimulationState } from './types'

function state(actualQuantity: string, availableQuantity = 10): MaterialSimulationState {
  return {
    page: 1,
    pageSize: 5,
    lots: [{ id: 'lot-1', lotCode: 'SIM-RM-001-01', materialCode: 'RM-001', materialName: 'Bawang Putih', availableQuantity, actualQuantity, isScanned: true }],
  }
}

describe('validateMaterialSimulation', () => {
  it('requires a scanned lot and valid positive actual quantity', () => {
    expect(validateMaterialSimulation(undefined, 2, RecipeToleranceType.None, null).isReady).toBe(false)
    expect(validateMaterialSimulation(state('0'), 2, RecipeToleranceType.None, null).lotErrors['lot-1']).toBeTruthy()
  })

  it('rejects actual quantity above the simulated availability', () => {
    expect(validateMaterialSimulation(state('3', 2), 2, RecipeToleranceType.None, null).isReady).toBe(false)
  })

  it('accepts actual total within plus-minus tolerance', () => {
    expect(validateMaterialSimulation(state('2.1'), 2, RecipeToleranceType.PlusMinus, 0.2).isReady).toBe(true)
  })

  it('creates local pagination metadata', () => {
    const result = validateMaterialSimulation({ ...state('2'), lots: Array.from({ length: 6 }, (_, index) => ({ ...state('2').lots[0], id: `lot-${index}`, lotCode: `SIM-${index}` })) }, 12, RecipeToleranceType.None, null)
    expect(result.pagination.totalPages).toBe(2)
    expect(result.pagination.hasNextPage).toBe(true)
  })
})
