import { describe, expect, it } from 'vitest'
import { DEFAULT_DEVIATION_QUERY, toRequestedAtFrom, toRequestedAtTo, validateDeviationQuery, validateRejectReason } from './validation'

describe('production deviation validation', () => {
  it('requires a rejection reason', () => expect(validateRejectReason('  ')).toBeTruthy())
  it('rejects an inverted date range', () => expect(validateDeviationQuery({ ...DEFAULT_DEVIATION_QUERY, requestedAtFrom: '2026-09-02', requestedAtTo: '2026-09-01' })).toBeTruthy())
  it('builds an inclusive local-day interval', () => {
    const from = new Date(toRequestedAtFrom('2026-09-01')!).getTime()
    const to = new Date(toRequestedAtTo('2026-09-01')!).getTime()
    expect(to - from).toBe(86_399_999)
  })
})
