import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ToastContainer } from '@/components/common/ToastContainer'
import { useSessionBootstrap } from '@/hooks/useSessionBootstrap'
import { AppRoutes } from '@/routes/AppRoutes'

function AppShell() {
  // Restores session (user + auth state) from a stored token on every load.
  useSessionBootstrap()

  return (
    <>
      <ToastContainer />
      <AppRoutes />
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
