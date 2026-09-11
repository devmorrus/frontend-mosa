import { describe, expect, it } from 'vitest'
import { filterSidebarItems, isPathAllowed, resolveHomeRoute } from '@/routes/homeRoute'
import type { SidebarItem } from '@/types/auth'

function sidebarItem(path: string | null, sortOrder = 0, children: SidebarItem[] = []): SidebarItem {
  return { id: path ?? `group-${sortOrder}`, code: path ?? 'group', name: path ?? 'Group', path, icon: null, sortOrder, children }
}

describe('resolveHomeRoute', () => {
  it('lands on dashboard when dashboard.view is granted', () => {
    expect(
      resolveHomeRoute({ permissions: ['dashboard.view'] }, [sidebarItem('/operator/production')]),
    ).toBe('/dashboard')
  })

  it('operator without dashboard.view lands on My Production, not dashboard', () => {
    // Backend sidebar contains the Dashboard parent menu for every role even
    // though the route needs dashboard.view: it must be skipped.
    const sidebar = [
      sidebarItem('/dashboard', 0),
      sidebarItem('/production/orders', 1),
      sidebarItem('/operator/production', 2),
    ]
    expect(
      resolveHomeRoute(
        { permissions: ['production-orders.view', 'production-orders.execute'] },
        sidebar,
      ),
    ).toBe('/operator/production')
  })

  it('falls back to permission map when sidebar is empty', () => {
    expect(resolveHomeRoute({ permissions: ['qc.view'] }, [])).toBe('/quality-control')
  })

  it('falls back to an allowed sidebar path when no preferred home matches', () => {
    const sidebar = [sidebarItem('/dashboard', 0), sidebarItem('/lots', 1)]
    expect(resolveHomeRoute({ permissions: ['lots.view'] }, sidebar)).toBe('/lots')
  })

  it('returns /403 when the user has no navigable permission', () => {
    expect(resolveHomeRoute({ permissions: [] }, [])).toBe('/403')
    expect(resolveHomeRoute(null, [])).toBe('/403')
  })
})

describe('isPathAllowed', () => {
  it('honours the dashboard guard', () => {
    expect(isPathAllowed('/dashboard', ['dashboard.view'])).toBe(true)
    expect(isPathAllowed('/dashboard', ['production-orders.view'])).toBe(false)
  })

  it('matches detail URLs by prefix', () => {
    expect(isPathAllowed('/production/orders/123', ['production-orders.view'])).toBe(true)
    expect(isPathAllowed('/production/orders/123', ['production-orders.execute'])).toBe(false)
  })

  it('lets unknown paths through to the router', () => {
    expect(isPathAllowed('/some-future-page', [])).toBe(true)
  })
})

describe('filterSidebarItems', () => {
  it('drops links the role may not open but keeps groups and placeholders', () => {
    const sidebar = [
      sidebarItem('/dashboard', 0),
      sidebarItem(null, 1),
      sidebarItem('/operator/production', 2),
    ]
    const filtered = filterSidebarItems(sidebar, ['production-orders.execute'])
    expect(filtered.map((item) => item.path)).toEqual([null, '/operator/production'])
  })

  it('keeps a group as non-clickable when only its children are allowed', () => {
    const sidebar = [
      sidebarItem('/production/orders', 3, [sidebarItem('/quality-control', 0)]),
    ]
    const filtered = filterSidebarItems(sidebar, ['qc.view'])
    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.path).toBeNull()
    expect(filtered[0]?.children.map((child) => child.path)).toEqual(['/quality-control'])
  })
})
