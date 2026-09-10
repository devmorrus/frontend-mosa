import { describe, expect, it } from 'vitest'
import { buildReportParams, emptyReportQuery } from './reports.api'

describe('reports filter/export parity (TASKING 2 Major)', () => {
  it('list params include pagination and active filters', () => {
    const params = buildReportParams(
      { ...emptyReportQuery, dateFrom: '2026-09-01', dateTo: '2026-09-10', warehouseId: 'wh-1', page: 2, pageSize: 20 },
      true,
    )
    expect(params.dateFrom).toBe('2026-09-01')
    expect(params.dateTo).toBe('2026-09-10')
    expect(params.warehouseId).toBe('wh-1')
    expect(params.page).toBe(2)
    expect(params.pageSize).toBe(20)
  })

  it('export params reuse the same active filters but strip pagination', () => {
    const query = {
      ...emptyReportQuery,
      search: 'E2E',
      dateFrom: '2026-09-01',
      dateTo: '2026-09-10',
      materialId: 'mat-1',
      page: 3,
      pageSize: 50,
    }
    const params = buildReportParams(query, false)
    expect(params.search).toBe('E2E')
    expect(params.dateFrom).toBe('2026-09-01')
    expect(params.dateTo).toBe('2026-09-10')
    expect(params.materialId).toBe('mat-1')
    expect(params.page).toBeUndefined()
    expect(params.pageSize).toBeUndefined()
  })

  it('empty filters are omitted so backend receives no stale values', () => {
    const params = buildReportParams(emptyReportQuery, true)
    expect(params.search).toBeUndefined()
    expect(params.dateFrom).toBeUndefined()
    expect(params.warehouseId).toBeUndefined()
    expect(params.page).toBe(1)
  })
})
