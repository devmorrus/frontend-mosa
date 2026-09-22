import { useEffect } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useUiStore, type Toast, type ToastVariant } from '@/stores/uiStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const VARIANT_STYLES: Record<ToastVariant, string> = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-blue-200 bg-blue-50 text-blue-800',
  info: 'border-slate-200 bg-white text-slate-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
}

const VARIANT_ICON: Record<ToastVariant, typeof Info> = {
  error: AlertTriangle,
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismissToast = useUiStore((state) => state.dismissToast)
  const Icon = VARIANT_ICON[toast.variant]

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(toast.id), 5000)
    return () => clearTimeout(timer)
  }, [toast.id, dismissToast])

  return (
    <Card
      role="alert"
      className={`flex w-full items-start gap-2 rounded-2xl px-3.5 py-3 shadow-lg ${VARIANT_STYLES[toast.variant]}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-sm leading-snug">{toast.message}</p>
      <Button
        type="button"
        onClick={() => dismissToast(toast.id)}
        aria-label="Tutup notifikasi"
        variant="ghost"
        size="sm"
        className="h-auto shrink-0 px-1 py-1 opacity-60 hover:bg-transparent hover:opacity-100"
      >
        <X size={16} />
      </Button>
    </Card>
  )
}

/**
 * Mounted once near the root. This is where API errors surfaced by the
 * central Axios interceptor (src/api/client.ts) become visible to the user,
 * without any individual page having to render its own error banner.
 */
export function ToastContainer() {
  const toasts = useUiStore((state) => state.toasts)

  if (toasts.length === 0) return null

  // z-[100]: toasts must paint above every overlay (dialog/sheet/dropdown
  // all sit at z-50 and Radix portals mount after this container in the DOM,
  // which previously hid validation warnings behind open modals).
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-4 sm:items-end">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full sm:w-96">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  )
}
