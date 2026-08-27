import { Outlet } from 'react-router-dom'
import { BrandPanel } from '@/components/common/BrandPanel'

export function AuthLayout() {
  return (
    <div className="flex min-h-dvh w-full bg-canvas">
      <div className="relative flex min-h-dvh w-full overflow-hidden bg-paper">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[linear-gradient(180deg,rgba(18,48,46,0.02),rgba(18,48,46,0.08))] lg:block" />
        <BrandPanel />
        <div className="relative flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-20">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
