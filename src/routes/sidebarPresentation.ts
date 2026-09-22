import type { SidebarItem } from '@/types/auth'

function isReportsItem(item: SidebarItem) {
  return item.code === 'reports' || item.path === '/reports'
}

/** Keep report selection inside the Reports page instead of the global sidebar. */
export function collapseReportsSidebarItem(items: SidebarItem[]): SidebarItem[] {
  return items.map((item) => {
    if (isReportsItem(item)) {
      return { ...item, path: item.path ?? '/reports', children: [] }
    }

    return { ...item, children: collapseReportsSidebarItem(item.children) }
  })
}
