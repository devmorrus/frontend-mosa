import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/common/Sidebar'
import { Topbar } from '@/components/common/Topbar'

/**
 * Shell every authenticated page renders inside:
 *
 *   Sidebar | Topbar
 *           | Content area (Outlet)
 *
 * Individual feature pages (Supplier, Material, ...) only ever implement
 * their content — they never rebuild the sidebar/topbar/layout themselves.
 */
export function MainLayout() {
  return (
    <div className="flex h-dvh w-full bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
