import { LoaderCircle, Save, ShieldCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import type { RoleLookupResponse } from '@/features/users/types'

export function UserRolesDialog({
  open,
  username,
  currentRoleIds,
  availableRoles,
  submitting,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  username: string
  currentRoleIds: string[]
  availableRoles: RoleLookupResponse[]
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (roleIds: string[]) => void
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(currentRoleIds))

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(currentRoleIds))
    }
  }, [open, currentRoleIds])

  function toggleRole(roleId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(roleId)) {
        next.delete(roleId)
      } else {
        next.add(roleId)
      }
      return next
    })
  }

  function handleSubmit() {
    onSubmit(Array.from(selectedIds))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-tour="user-role-dialog" className="max-w-lg overflow-hidden p-0">
        {/* Accent bar */}
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-[28px] bg-gradient-to-r from-blue-500 to-indigo-400" />

        {/* Header */}
        <div className="px-7 pb-4 pt-8">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-semibold text-ink">Ubah Roles</h2>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-700">
                  Roles
                </span>
              </div>
              <DialogDescription className="mt-0.5 text-[13px] text-slate-500">
                Pilih role yang akan diberikan kepada <span className="font-semibold text-ink">{username}</span>.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Body */}
        <div className="max-h-[50vh] overflow-y-auto px-7 py-5">
          {availableRoles.length === 0 ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 py-10 text-sm text-slate-500">
              <LoaderCircle size={18} className="animate-spin text-slate-400" />
              Memuat daftar role...
            </div>
          ) : (
            <div className="grid gap-2">
              {availableRoles.map((role) => {
                const isSelected = selectedIds.has(role.id)
                return (
                  <button
                    key={role.id}
                    type="button"
                    data-tour="user-role-option"
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                      isSelected
                        ? 'border-blue-200 bg-blue-50 text-ink'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    }`}
                    onClick={() => toggleRole(role.id)}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold">{role.name}</div>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-semibold text-blue-600">Dipilih</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Footer */}
        <div className="px-7 py-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || availableRoles.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3.5 text-sm font-semibold text-paper shadow-md shadow-ink/20 transition-all duration-150 hover:bg-ink-light hover:shadow-lg active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {submitting ? 'Menyimpan...' : 'Simpan Roles'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
