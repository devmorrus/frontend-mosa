import { describe, expect, it } from 'vitest'
import type { StockOpnameItem } from '@/features/stock-opname/types'
import { emptyStockOpnameQuery, getStockOpnameSummary, normalizeStockOpnameQuery, validateStockOpnameQuery } from '@/features/stock-opname/validation'

function item(overrides: Partial<StockOpnameItem> = {}): StockOpnameItem {
  return {
    id: 'item-1',
    rawMaterialId: 'material-1',
    rawMaterialCode: 'RM-001',
    rawMaterialName: 'Material',
    rawMaterialLotId: 'lot-1',
    rawMaterialLotNumber: 'LOT-001',
    unitOfMeasureId: 'unit-1',
    unitOfMeasureCode: 'KG',
    unitOfMeasureSymbol: 'KG',
    systemQuantity: 10,
    physicalQuantity: null,
    varianceQuantity: null,
    notes: null,
    countedBy: null,
    countedAt: null,
    createdAtUtc: '2026-09-23T00:00:00Z',
    updatedAtUtc: null,
    ...overrides,
  }
}

describe('stock opname validation', () => {
  it('normalizes and limits search input', () => {
    const normalized = normalizeStockOpnameQuery({ ...emptyStockOpnameQuery, search: `  ${'x'.repeat(120)}  `, page: 0, pageSize: 500 })
    expect(normalized.search).toHaveLength(100)
    expect(normalized.page).toBe(1)
    expect(normalized.pageSize).toBe(100)
  })

  it('rejects an inverted date range', () => {
    const result = validateStockOpnameQuery({ ...emptyStockOpnameQuery, dateFrom: '2026-09-30', dateTo: '2026-09-01' })
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Rentang tanggal stock opname tidak valid.')
  })

  it('summarizes counted, matching, surplus, shortage, and correction', () => {
    const result = getStockOpnameSummary([
      item({ id: 'match', physicalQuantity: 10, varianceQuantity: 0 }),
      item({ id: 'surplus', physicalQuantity: 12, varianceQuantity: 2 }),
      item({ id: 'shortage', physicalQuantity: 7, varianceQuantity: -3 }),
      item({ id: 'uncounted' }),
    ])
    expect(result).toEqual({ totalLotCounted: 3, matchingLot: 1, positiveVariance: 1, negativeVariance: 1, netVariance: -1, totalCorrection: 5 })
  })
})
