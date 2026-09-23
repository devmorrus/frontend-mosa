import type { SidebarItem } from '@/types/auth'

export function normalizeSidebarPath(path: string): string {
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1)
  return path
}

export function collectAllSidebarPaths(items: SidebarItem[]): string[] {
  const paths: string[] = []
  function walk(item: SidebarItem) {
    if (item.path) paths.push(normalizeSidebarPath(item.path))
    item.children.forEach(walk)
  }
  items.forEach(walk)
  return paths
}

/**
 * Longest-prefix-wins active matching.
 * `/quality-control` tidak lagi aktif saat di `/quality-control/history`,
 * tapi tetap aktif untuk detail `/quality-control/:id` yang tidak ada di sidebar.
 */
export function isSidebarPathActive(itemPath: string, pathname: string, allPaths: string[]): boolean {
  const normalizedItem = normalizeSidebarPath(itemPath)
  const normalizedPath = normalizeSidebarPath(pathname)
  if (normalizedPath === normalizedItem) return true
  if (!normalizedPath.startsWith(`${normalizedItem}/`)) return false

  let longest = normalizedItem
  for (const candidate of allPaths) {
    if (normalizedPath === candidate || normalizedPath.startsWith(`${candidate}/`)) {
      if (candidate.length > longest.length) longest = candidate
    }
  }
  return longest === normalizedItem
}
