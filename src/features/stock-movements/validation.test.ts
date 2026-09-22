import { describe, expect, it } from 'vitest'
import {
  emptyStockMovementQuery,
  normalizeStockMovementQuery,
  validateStockMovementQuery,
} from './validation'

describe('stock movement validation', () => {
  it('normalizes ids, reference, page, and unsupported page size', () => {
    const result = normalizeStockMovementQuery({
      ...emptyStockMovementQuery,
      warehouseId: ' warehouse-1 ',
      rawMaterialId: ' material-1 ',
      rawMaterialLotId: ' lot-1 ',
      reference: `  ${'GR-001 '.repeat(30)} `,
      page: 0,
      pageSize: 999,
    })

    expect(result.warehouseId).toBe('warehouse-1')
    expect(result.rawMaterialId).toBe('material-1')
    expect(result.rawMaterialLotId).toBe('lot-1')
    expect(result.reference).toHaveLength(100)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(10)
  })

  it('rejects an inverted date range', () => {
    const result = validateStockMovementQuery({
      ...emptyStockMovementQuery,
      dateFrom: '2026-09-10',
      dateTo: '2026-09-01',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Rentang tanggal stock movement tidak valid.')
  })

  it('accepts an empty or correctly ordered date range', () => {
    expect(validateStockMovementQuery(emptyStockMovementQuery).isValid).toBe(true)
    expect(validateStockMovementQuery({
      ...emptyStockMovementQuery,
      dateFrom: '2026-09-01',
      dateTo: '2026-09-10',
    }).isValid).toBe(true)
  })
})
