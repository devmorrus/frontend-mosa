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

export function MasterDataTableSkeleton({
  rows = 8,
  label = 'Memuat daftar data',
}: {
  rows?: number
  label?: string
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className="overflow-hidden rounded-[20px] border border-slate-200/75 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
    >
      <div className="border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="h-4 w-32 animate-pulse rounded-md bg-slate-200" />
            <div className="h-3 w-48 animate-pulse rounded-md bg-slate-100" />
          </div>
          <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>

      <div className="grid gap-3 bg-slate-50/60 p-4 sm:hidden">
        {Array.from({ length: Math.min(rows, 4) }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200/80 bg-white p-4">
            <div className="flex gap-3">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-xl bg-slate-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded-md bg-slate-200" />
                <div className="h-3 w-1/3 animate-pulse rounded-md bg-slate-100" />
                <div className="border-t border-slate-100 pt-3">
                  <div className="h-3 w-1/2 animate-pulse rounded-md bg-slate-100" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden sm:block">
        <div className="border-b border-slate-100 bg-slate-50/90 px-6 py-3">
          <div className="grid grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_7rem] gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-3 animate-pulse rounded bg-slate-200/80" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-100 bg-white">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="grid grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_7rem] items-center gap-4 px-6 py-4">
              <div className="h-3 w-6 animate-pulse rounded bg-slate-100" />
              <div className="h-6 w-3/4 animate-pulse rounded-lg bg-slate-100" />
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-slate-200" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-4 w-4/5 animate-pulse rounded-md bg-slate-200" />
                  <div className="h-3 w-3/5 animate-pulse rounded-md bg-slate-100" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-4/5 animate-pulse rounded-md bg-slate-100" />
                <div className="h-3 w-3/5 animate-pulse rounded-md bg-slate-100" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">{label}…</span>
    </div>
  )
}

export function MasterDataDetailSkeleton({
  label = 'Memuat detail data',
}: {
  label?: string
}) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className="space-y-5">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="h-4 w-40 animate-pulse rounded-md bg-slate-200" />
        <div className="mt-2 h-3 w-64 animate-pulse rounded-md bg-slate-100" />
      </div>
      <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded-md bg-slate-200" />
            <div className="h-3 w-1/2 animate-pulse rounded-md bg-slate-100" />
          </div>
          <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
              <div className="h-10 w-full animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="h-4 w-36 animate-pulse rounded-md bg-slate-200" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="h-4 w-2/5 animate-pulse rounded-md bg-slate-200" />
              <div className="mt-2 h-3 w-3/5 animate-pulse rounded-md bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">{label}…</span>
    </div>
  )
}

export function MasterDataErrorState({
  title = 'Terjadi kendala saat memuat data',
  description,
  traceId,
  onRetry,
}: {
  title?: string
  description: string
  traceId?: string | null
  onRetry: () => void
}) {
  return (
    <div className="rounded-[28px] border border-red-100 bg-white/90 p-10 text-center shadow-sm">
      <AlertTriangle className="mx-auto h-9 w-9 text-red-500" />
      <h3 className="mt-4 font-display text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      {traceId ? <p className="mt-2 font-mono text-xs text-slate-400">Trace ID: {traceId}</p> : null}
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
