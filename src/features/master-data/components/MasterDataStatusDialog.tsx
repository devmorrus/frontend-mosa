import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

export function MasterDataStatusDialog({
  open,
  entityLabel,
  nextStatusLabel,
  onOpenChange,
  onConfirm,
  submitting,
}: {
  open: boolean
  entityLabel: string
  nextStatusLabel: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  submitting: boolean
}) {
  const toActive = nextStatusLabel === 'Active'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm overflow-hidden p-0">
        {/* Top accent */}
        <div
          className={`h-1 w-full ${
            toActive
              ? 'bg-gradient-to-r from-blue-500 to-blue-400'
              : 'bg-gradient-to-r from-amber-500 to-orange-400'
          }`}
        />

        {/* Body — centered */}
        <div className="px-7 py-7 text-center">
          {/* Icon circle */}
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
              toActive ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            <RotateCcw size={24} />
          </div>

          {/* Title */}
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">
            Ubah Status
          </h2>

          {/* Entity name */}
          <p className="mt-1.5 text-sm text-slate-500">
            <span className="font-semibold text-ink">"{entityLabel}"</span>
          </p>

          {/* Description + next status badge */}
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Data ini akan diubah menjadi
          </p>
          <span
            className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold ${
              toActive
                ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
                : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                toActive ? 'bg-blue-500' : 'bg-amber-500'
              }`}
            />
            {nextStatusLabel}
          </span>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Perubahan ini tidak menghapus data dan dapat dibalik kapan saja.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 disabled:opacity-50"
          >
            Batalkan
          </button>

          <Button
            onClick={onConfirm}
            disabled={submitting}
            className={
              toActive
                ? 'bg-blue-700 shadow-blue-200 hover:bg-blue-800'
                : 'bg-amber-600 shadow-amber-200 hover:bg-amber-700'
            }
          >
            <RotateCcw size={15} className={submitting ? 'animate-spin' : ''} />
            {submitting ? 'Memproses...' : `Ya, ubah ke ${nextStatusLabel}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

