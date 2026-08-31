import { Check, LoaderCircle, Save, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import type { PermissionGroup } from '@/features/roles/types'

export function RolePermissionsDialog({
  open,
  roleName,
  currentPermissionIds,
  permissionGroups,
  submitting,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  roleName: string
  currentPermissionIds: string[]
  permissionGroups: PermissionGroup[]
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (permissionIds: string[]) => void
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(currentPermissionIds))

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(currentPermissionIds))
    }
  }, [open, currentPermissionIds])

  function togglePermission(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleModule(_module: string, modulePermissionIds: string[]) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      const allSelected = modulePermissionIds.every((id) => next.has(id))
      if (allSelected) {
        for (const id of modulePermissionIds) {
          next.delete(id)
        }
      } else {
        for (const id of modulePermissionIds) {
          next.add(id)
        }
      }
      return next
    })
  }

  function handleSubmit() {
    onSubmit(Array.from(selectedIds))
  }

  const totalPermissions = permissionGroups.reduce((acc, g) => acc + g.permissions.length, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        {/* Accent bar */}
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-[28px] bg-gradient-to-r from-indigo-500 to-violet-400" />

        {/* Header */}
        <div className="px-7 pb-4 pt-8">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
              <Shield size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-semibold text-ink">Kelola Permissions</h2>
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-700">
                  Permissions
                </span>
              </div>
              <DialogDescription className="mt-0.5 text-[13px] text-slate-500">
                Pilih permissions untuk role <span className="font-semibold text-ink">{roleName}</span>.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Summary bar */}
        <div className="flex items-center justify-between bg-indigo-50/50 px-7 py-3">
          <span className="text-xs font-medium text-slate-600">
            <span className="font-bold text-ink">{selectedIds.size}</span> dari{' '}
            <span className="font-bold text-ink">{totalPermissions}</span> permissions dipilih
          </span>
          <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{
                width: totalPermissions > 0 ? `${(selectedIds.size / totalPermissions) * 100}%` : '0%',
              }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[50vh] overflow-y-auto px-7 py-5">
          {permissionGroups.length === 0 ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 py-10 text-sm text-slate-500">
              <LoaderCircle size={18} className="animate-spin text-slate-400" />
              Memuat daftar permissions...
            </div>
          ) : (
            <div className="space-y-4">
              {permissionGroups.map((group) => {
                const moduleIds = group.permissions.map((p) => p.id)
                const allSelected = moduleIds.every((id) => selectedIds.has(id))
                const someSelected = moduleIds.some((id) => selectedIds.has(id))

                return (
                  <div key={group.module} className="rounded-xl border border-slate-200 overflow-hidden">
                    {/* Module header */}
                    <button
                      type="button"
                      onClick={() => toggleModule(group.module, moduleIds)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold transition-colors ${
                        allSelected
                          ? 'bg-indigo-50 text-indigo-800'
                          : someSelected
                            ? 'bg-indigo-50/50 text-ink'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          allSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : someSelected
                              ? 'border-indigo-400 bg-indigo-100 text-indigo-700'
                              : 'border-slate-300 bg-white'
                        }`}
                      >
                        {allSelected && (
                          <Check size={12} />
                        )}
                        {someSelected && !allSelected && (
                          <div className="h-2 w-2 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <span className="capitalize">{group.module}</span>
                      <span className="ml-auto text-[10px] font-medium text-slate-400">
                        {moduleIds.filter((id) => selectedIds.has(id)).length}/{moduleIds.length}
                      </span>
                    </button>

                    {/* Permissions in module */}
                    <div className="divide-y divide-slate-100 border-t border-slate-100">
                      {group.permissions.map((perm) => {
                        const isSelected = selectedIds.has(perm.id)
                        return (
                          <button
                            key={perm.id}
                            type="button"
                            onClick={() => togglePermission(perm.id)}
                            className={`flex w-full items-center gap-3 px-4 py-2.5 pl-12 text-left text-sm transition-colors ${
                              isSelected
                                ? 'bg-white text-ink'
                                : 'bg-white text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <div
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check size={10} />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-medium">{perm.name}</span>
                              <span className="ml-2 font-mono text-[10px] text-slate-400">{perm.code}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
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
            disabled={submitting || permissionGroups.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3.5 text-sm font-semibold text-paper shadow-md shadow-ink/20 transition-all duration-150 hover:bg-ink-light hover:shadow-lg active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {submitting ? 'Menyimpan...' : 'Simpan Permissions'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
