import { create } from 'zustand'

export type ToastVariant = 'error' | 'success' | 'info' | 'warning'

export interface Toast {
  id: string
  variant: ToastVariant
  message: string
}

interface UiState {
  toasts: Toast[]
  /** Sidebar open/closed on mobile & tablet (desktop uses a persistent sidebar). */
  isMobileSidebarOpen: boolean
  pushToast: (variant: ToastVariant, message: string) => void
  dismissToast: (id: string) => void
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
  toggleMobileSidebar: () => void
}

/**
 * Global UI state. This is where the centralized API error handler
 * (see src/api/client.ts) reports errors so any screen can surface them
 * as a toast, without every component wiring its own error UI.
 */
export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  isMobileSidebarOpen: false,

  pushToast: (variant, message) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: crypto.randomUUID(), variant, message },
      ],
    })),

  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  openMobileSidebar: () => set({ isMobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
}))
