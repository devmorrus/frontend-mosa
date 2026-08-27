import { AlertTriangle, Inbox, LoaderCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function MasterDataLoadingState({
  title = 'Memuat data',
  description = 'Mohon tunggu, data sedang disiapkan.',
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/85 p-10 text-center shadow-sm">
      <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-ink/45" />
      <h3 className="mt-4 font-display text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  )
}

export function MasterDataErrorState({
  title = 'Terjadi kendala saat memuat data',
  description,
  onRetry,
}: {
  title?: string
  description: string
  onRetry: () => void
}) {
  return (
    <div className="rounded-[28px] border border-red-100 bg-white/90 p-10 text-center shadow-sm">
      <AlertTriangle className="mx-auto h-9 w-9 text-red-500" />
      <h3 className="mt-4 font-display text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      <Button onClick={onRetry} variant="secondary" className="mt-5">
        <RefreshCcw size={16} />
        Coba lagi
      </Button>
    </div>
  )
}

export function MasterDataEmptyState({
  title = 'Belum ada data',
  description,
  action,
}: {
  title?: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
      <Inbox className="mx-auto h-10 w-10 text-slate-300" />
      <h3 className="mt-4 font-display text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      {action && <div className={cn('mt-5 flex justify-center')}>{action}</div>}
    </div>
  )
}
