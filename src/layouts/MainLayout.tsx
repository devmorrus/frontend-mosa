import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/common/Sidebar'
import { Topbar } from '@/components/common/Topbar'
import { TutorialController } from '@/components/tutorial/TutorialController'

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
    <div className="flex h-dvh w-full bg-[linear-gradient(180deg,#ffffff_0%,#eaf3ff_100%)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <TutorialController />
    </div>
  )
}
