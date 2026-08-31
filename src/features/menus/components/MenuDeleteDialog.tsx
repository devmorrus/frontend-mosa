import { AlertTriangle, LoaderCircle, ShieldCheck, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import type { MenuTreeNode } from '@/features/menus/types'

// ─── Sub-components ──────────────────────────────────────────────────────────

function WarningItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-amber-50 px-3.5 py-2.5">
      <span className="mt-0.5 shrink-0 text-amber-500">{icon}</span>
      <span className="text-[13px] leading-relaxed text-amber-700">{text}</span>
    </div>
  )
}

// ─── Main MenuDeleteDialog ────────────────────────────────────────────────────

export function MenuDeleteDialog({
  open,
  menu,
  error,
  submitting,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  menu: MenuTreeNode | null
  error: string | null
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  if (!menu) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm overflow-hidden p-0">
        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-rose-400" />

        {/* Body — centered */}
        <div className="px-7 py-7 text-center">
          {/* Icon circle */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 size={24} />
          </div>

          {/* Title */}
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">
            Hapus Menu
          </h2>

          {/* Entity name */}
          <p className="mt-1.5 text-sm text-slate-500">
            <span className="font-semibold text-ink">"{menu.name}"</span>
            <span className="ml-1 font-mono text-[10px] text-slate-400">({menu.code})</span>
          </p>

          {/* Warning messages */}
          <div className="mt-4 space-y-2 text-left">
            {menu.isSystem && (
              <WarningItem
                icon={<ShieldCheck size={14} />}
                text="Menu sistem tidak dapat dihapus. Menu ini diperlukan untuk operasi inti aplikasi."
              />
            )}
            {menu.children.length > 0 && (
              <WarningItem
                icon={<AlertTriangle size={14} />}
                text={`Menu masih memiliki ${menu.children.length} sub-menu. Hapus atau pindahkan sub-menu terlebih dahulu.`}
              />
            )}
            {!menu.isSystem && menu.children.length === 0 && (
              <p className="text-[13px] text-slate-500">
                Apakah Anda yakin ingin menghapus menu ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            )}
          </div>
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
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting || menu.isSystem || menu.children.length > 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-200 transition-all hover:bg-red-700 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}
            {submitting ? 'Menghapus...' : 'Hapus Menu'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
