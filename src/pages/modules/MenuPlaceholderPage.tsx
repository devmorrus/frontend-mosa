import { useLocation } from 'react-router-dom'
import { Construction } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

function findMenuByPath(items: ReturnType<typeof useAuth>['sidebarItems'], pathname: string): ReturnType<typeof useAuth>['sidebarItems'][number] | null {
  for (const item of items) {
    if (item.path === pathname) return item
    if (item.children.length > 0) {
      const found = findMenuByPath(item.children, pathname)
      if (found) return found
    }
  }
  return null
}

export function MenuPlaceholderPage() {
  const location = useLocation()
  const sidebarItems = useAuth().sidebarItems
  const menu = findMenuByPath(sidebarItems, location.pathname)

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600">
        <Construction size={28} />
      </div>

      <h1 className="mt-6 font-display text-2xl font-semibold text-ink">
        {menu?.name ?? 'Halaman'}
      </h1>

      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        Halaman ini sedang dalam tahap pengembangan. Fitur fungsional akan segera
        tersedia setelah modul ini diselesaikan.
      </p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        Coming Soon
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-4 text-xs text-slate-400">
        <span className="font-mono text-slate-500">{location.pathname}</span>
      </div>
    </div>
  )
}
