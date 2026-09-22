import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function WarehouseStatusDialog({
  open,
  warehouseName,
  warehouseCode,
  nextStatusLabel,
  onOpenChange,
  onConfirm,
  submitting,
}: {
  open: boolean
  warehouseName: string
  warehouseCode: string
  nextStatusLabel: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  submitting: boolean
}) {
  const toActive = nextStatusLabel === 'Active'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm overflow-hidden rounded-[24px] p-0">
        <div className={cn('h-1 w-full', toActive ? 'bg-blue-600' : 'bg-amber-500')} />

        <div className="px-6 py-6 text-center">
          <div
            className={cn(
              'mx-auto flex h-12 w-12 items-center justify-center rounded-xl',
              toActive ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600',
            )}
          >
            <RotateCcw size={22} className={submitting ? 'animate-spin' : ''} />
          </div>

          <h2 className="mt-4 font-display text-lg font-semibold text-slate-900">Ubah Status</h2>

          <p className="mt-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-900">“{warehouseName}”</span>
          </p>
          {warehouseCode ? (
            <p className="mt-1">
              <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-slate-500">
                {warehouseCode}
              </span>
            </p>
          ) : null}

          <p className="mt-3 text-sm leading-6 text-slate-500">Data ini akan diubah menjadi</p>
          <span
            className={cn(
              'mt-2 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold ring-1 ring-inset',
              toActive
                ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                : 'bg-amber-50 text-amber-700 ring-amber-200',
            )}
          >
            <span className={cn('h-2 w-2 rounded-full', toActive ? 'bg-emerald-500' : 'bg-amber-500')} />
            {nextStatusLabel}
          </span>

          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            {toActive
              ? 'Warehouse akan aktif kembali dan bisa dipakai operasional.'
              : 'Warehouse akan nonaktif dan tidak bisa dipilih di transaksi baru. Data stok lama tetap aman.'}
          </p>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="flex items-center justify-between gap-2 px-6 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="h-11 rounded-xl px-4 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            Batal
          </button>

          <Button
            onClick={onConfirm}
            disabled={submitting}
            className={cn(
              'h-11',
              toActive
                ? 'bg-blue-700 shadow-blue-200 hover:bg-blue-800'
                : 'bg-amber-600 shadow-amber-200 hover:bg-amber-700',
            )}
          >
            <RotateCcw size={15} className={submitting ? 'animate-spin' : ''} />
            {submitting ? 'Memproses...' : toActive ? 'Ya, aktifkan' : 'Ya, nonaktifkan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
