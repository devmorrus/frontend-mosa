import { describe, expect, it } from 'vitest'
import { emptyRawMaterialLotQuery, normalizeRawMaterialLotQuery, normalizeScannedQrInput, validateRawMaterialLotQuery } from './validation'

describe('raw material lot validation', () => {
  it('normalizes user-entered filters without changing the query shape', () => {
    const result = normalizeRawMaterialLotQuery({
      ...emptyRawMaterialLotQuery,
      search: '  LOT-001  ',
      rawMaterialId: ' material-1 ',
      page: 0,
      pageSize: 999,
    })

    expect(result.search).toBe('LOT-001')
    expect(result.rawMaterialId).toBe('material-1')
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(10)
  })

  it('rejects inverted expiry and receiving ranges', () => {
    const result = validateRawMaterialLotQuery({
      ...emptyRawMaterialLotQuery,
      expiryFrom: '2026-09-10',
      expiryTo: '2026-09-01',
      receivedDateFrom: '2026-09-10',
      receivedDateTo: '2026-09-01',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toHaveLength(2)
  })

  it('trims scanned QR input for manual fallback', () => {
    expect(normalizeScannedQrInput('  MOSA-LOT-001\n')).toBe('MOSA-LOT-001')
  })
})
