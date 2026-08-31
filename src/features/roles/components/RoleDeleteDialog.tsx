import { AlertTriangle, LoaderCircle, ShieldAlert, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import type { RoleListItem } from '@/features/roles/types'

export function RoleDeleteDialog({
  open,
  role,
  submitting,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  role: RoleListItem | null
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  const isSystem = role?.isSystem ?? false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        {/* Accent bar */}
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-[28px] bg-gradient-to-r from-red-500 to-rose-400" />

        {/* Header */}
        <div className="px-7 pb-4 pt-8">
          <div className="flex items-start gap-3.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                isSystem
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {isSystem ? <ShieldAlert size={20} /> : <Trash2 size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-semibold text-ink">Hapus Role</h2>
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-red-700">
                  Hapus
                </span>
              </div>
              <DialogDescription className="mt-0.5 text-[13px] text-slate-500">
                {isSystem
                  ? 'Role sistem tidak dapat dihapus dari sistem.'
                  : 'Tindakan ini akan menghapus role secara permanen.'}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Body */}
        <div className="px-7 py-5">
          {isSystem ? (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Role Sistem Terlindungi</p>
                <p className="mt-1 text-sm text-amber-700">
                  Role <span className="font-semibold">{role?.name}</span> adalah role sistem yang dijamin oleh MOSA. 
                  Role ini tidak dapat dihapus untuk menjaga integritas sistem.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
                <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Konfirmasi Penghapusan</p>
                  <p className="mt-1 text-sm text-red-700">
                    Anda yakin ingin menghapus role{' '}
                    <span className="font-semibold">{role?.name}</span>?
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-ink">Catatan:</span> Role yang masih di-assign ke 
                  user tidak dapat dihapus. Anda perlu menghapus assignment terlebih dahulu.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Footer */}
        <div className="px-7 py-4">
          {isSystem ? (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-150 hover:bg-slate-50 active:scale-[0.98]"
            >
              Tutup
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-700 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-red-200 transition-all duration-150 hover:bg-red-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              {submitting ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <Trash2 size={15} />
              )}
              {submitting ? 'Menghapus...' : 'Hapus Role'}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
