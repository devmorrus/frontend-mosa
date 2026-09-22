import { describe, expect, it } from 'vitest'
import { getStockOpnameProgress, getStockOpnameStatusLabel, getStockOpnameStatusTone, getStockOpnameVarianceLabel, getStockOpnameVarianceTone } from '@/features/stock-opname/utils'
import type { StockOpnameItem } from '@/features/stock-opname/types'

describe('stock opname display utilities', () => {
  it('maps status values to readable labels and tones', () => {
    expect(getStockOpnameStatusLabel('INPROGRESS')).toBe('In Progress')
    expect(getStockOpnameStatusLabel('READYTOPOST')).toBe('Ready to Post')
    expect(getStockOpnameStatusTone('POSTED')).toContain('emerald')
  })

  it('maps variance values to readable labels and tones', () => {
    expect(getStockOpnameVarianceLabel(null)).toBe('Not counted')
    expect(getStockOpnameVarianceLabel(0)).toBe('Match')
    expect(getStockOpnameVarianceLabel(2)).toBe('Surplus')
    expect(getStockOpnameVarianceLabel(-2)).toBe('Shortage')
    expect(getStockOpnameVarianceTone(-2)).toContain('rose')
  })

  it('calculates counting progress', () => {
    const base = { physicalQuantity: null } as StockOpnameItem
    expect(getStockOpnameProgress([])).toBe(0)
    expect(getStockOpnameProgress([base, { ...base, id: 'counted', physicalQuantity: 1 }])).toBe(50)
  })
})
