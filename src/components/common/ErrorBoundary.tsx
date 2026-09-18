import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Catches render-time JavaScript errors anywhere in the tree below it,
 * so one broken page can't blank out the entire application. API/network
 * errors are handled separately in `src/api/client.ts` — this is the
 * complementary half of the "Global Error Handler" for errors that happen
 * during render rather than during a request.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Foundation-level logging hook. Wire this to a real error-reporting
    // service (Sentry, etc.) when one is available.
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.assign('/')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-dvh w-full flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center">
          <h1 className="text-lg font-semibold text-slate-900">Terjadi kesalahan tak terduga</h1>
          <p className="max-w-sm text-sm text-slate-500">
            Halaman ini mengalami masalah. Coba muat ulang aplikasi; jika masalah berlanjut,
            hubungi tim teknis.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Muat ulang
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
