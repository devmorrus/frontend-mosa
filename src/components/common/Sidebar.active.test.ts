import { describe, expect, it } from 'vitest'
import { isSidebarPathActive } from '@/routes/sidebarActive'

const QC_PATHS = [
  '/dashboard',
  '/quality-control',
  '/quality-control/parameters',
  '/quality-control/history',
  '/quality-control/ncr',
]

describe('isSidebarPathActive', () => {
  it('hanya mengaktifkan Inspection History saat di /quality-control/history', () => {
    expect(isSidebarPathActive('/quality-control/history', '/quality-control/history', QC_PATHS)).toBe(true)
    expect(isSidebarPathActive('/quality-control', '/quality-control/history', QC_PATHS)).toBe(false)
  })

  it('tetap mengaktifkan QC Queue saat di detail yang tidak ada di sidebar', () => {
    expect(isSidebarPathActive('/quality-control', '/quality-control/abc-123', QC_PATHS)).toBe(true)
    expect(isSidebarPathActive('/quality-control/history', '/quality-control/abc-123', QC_PATHS)).toBe(false)
  })

  it('mengaktifkan exact match untuk queue', () => {
    expect(isSidebarPathActive('/quality-control', '/quality-control', QC_PATHS)).toBe(true)
  })
})
