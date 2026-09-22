import { describe, expect, it } from 'vitest'
import {
  emptyInventoryRawMaterialQuery,
  normalizeInventoryRawMaterialQuery,
  validateInventoryRawMaterialQuery,
} from './validation'

describe('raw material inventory validation', () => {
  it('normalizes text, ids, page, and unsupported page size', () => {
    const result = normalizeInventoryRawMaterialQuery({
      ...emptyInventoryRawMaterialQuery,
      search: `  ${'material '.repeat(30)} `,
      warehouseId: ' warehouse-1 ',
      rawMaterialId: ' material-1 ',
      page: 0,
      pageSize: 999,
    })

    expect(result.search).toHaveLength(100)
    expect(result.warehouseId).toBe('warehouse-1')
    expect(result.rawMaterialId).toBe('material-1')
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(10)
  })

  it('rejects an inverted expiry range', () => {
    const result = validateInventoryRawMaterialQuery({
      ...emptyInventoryRawMaterialQuery,
      expiryFrom: '2026-09-10',
      expiryTo: '2026-09-01',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Rentang expiry inventory tidak valid.')
  })

  it('accepts an empty or correctly ordered expiry range', () => {
    expect(validateInventoryRawMaterialQuery(emptyInventoryRawMaterialQuery).isValid).toBe(true)
    expect(validateInventoryRawMaterialQuery({
      ...emptyInventoryRawMaterialQuery,
      expiryFrom: '2026-09-01',
      expiryTo: '2026-09-10',
    }).isValid).toBe(true)
  })
})
