import { describe, expect, it } from 'vitest'
import { RecipeToleranceType } from '@/features/recipes/types'
import { evaluateTolerance, formatAllowedRange, validateLots } from './validation'

describe('operator material consumption validation', () => {
  it('matches backend minimum tolerance as target minus tolerance', () => {
    const result = evaluateTolerance(19, 20, RecipeToleranceType.Min, 1)

    expect(result.lowerLimit).toBe(19)
    expect(result.upperLimit).toBeNull()
    expect(result.isWithinTolerance).toBe(true)
  })

  it('matches backend maximum tolerance as target plus tolerance', () => {
    const result = evaluateTolerance(21, 20, RecipeToleranceType.Max, 1)

    expect(result.lowerLimit).toBeNull()
    expect(result.upperLimit).toBe(21)
    expect(result.isWithinTolerance).toBe(true)
  })

  it('matches backend None tolerance as always within tolerance', () => {
    const below = evaluateTolerance(5, 20, RecipeToleranceType.None, null)
    const above = evaluateTolerance(50, 20, RecipeToleranceType.None, null)
    const missing = evaluateTolerance(50, 20, null, null)

    expect(below.lowerLimit).toBeNull()
    expect(below.upperLimit).toBeNull()
    expect(below.isWithinTolerance).toBe(true)
    expect(above.isWithinTolerance).toBe(true)
    expect(missing.isWithinTolerance).toBe(true)
    expect(formatAllowedRange(below.lowerLimit, below.upperLimit, 'kg')).toBe('Tidak ada batas tolerance')
  })

  it('formats one-sided allowed ranges clearly', () => {
    expect(formatAllowedRange(19, null, 'kg')).toBe('>= 19 kg')
    expect(formatAllowedRange(null, 21, 'kg')).toBe('<= 21 kg')
    expect(formatAllowedRange(18, 22, 'kg')).toBe('18 - 22 kg')
  })

  it('rejects duplicate lots and quantities above availability', () => {
    expect(validateLots([
      { lotId: 'lot-1', lotNumber: 'LOT-1', materialName: 'Gula', availableQuantity: 10, actualQuantity: '1' },
      { lotId: 'lot-1', lotNumber: 'LOT-1', materialName: 'Gula', availableQuantity: 10, actualQuantity: '1' },
    ])).toContain('tidak boleh')

    expect(validateLots([
      { lotId: 'lot-1', lotNumber: 'LOT-1', materialName: 'Gula', availableQuantity: 10, actualQuantity: '11' },
    ])).toContain('melebihi')
  })
})
