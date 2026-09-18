import {
  AlertCircle,
  Eye,
  LoaderCircle,
  PencilLine,
  Save,
  ShieldCheck,
} from 'lucide-react'
import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MasterDataFormFieldError } from '@/features/master-data/components/MasterDataFormFieldError'
import { getFieldError } from '@/features/master-data/utils'
import type { MasterDataFormErrors } from '@/features/master-data/types'
import type { RoleFormValues } from '@/features/roles/types'

// ─── Sub-components ──────────────────────────────────────────────────────────

function AccentBar({ mode }: { mode: 'create' | 'edit' }) {
  return (
    <div
      className={`absolute inset-x-0 top-0 h-1 rounded-t-[28px] ${
        mode === 'create'
          ? 'bg-gradient-to-r from-blue-500 to-blue-400'
          : 'bg-gradient-to-r from-amber-500 to-orange-400'
      }`}
    />
  )
}

function HeaderIcon({ mode }: { mode: 'create' | 'edit' }) {
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
        mode === 'create' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      {mode === 'create' ? <ShieldCheck size={20} /> : <PencilLine size={20} />}
    </div>
  )
}

function ModeBadge({ mode }: { mode: 'create' | 'edit' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
        mode === 'create'
          ? 'bg-blue-100 text-blue-700'
          : 'bg-amber-100 text-amber-700'
      }`}
    >
      {mode === 'create' ? '✦ Baru' : '✎ Edit'}
    </span>
  )
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {children}
      </span>
      <div className="h-px flex-1 bg-slate-100" />
    </div>
  )
}

function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
      {children}
      {required && <span className="text-red-400 normal-case">*</span>}
    </label>
  )
}

function FieldHelper({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{children}</p>
}

function StatusToggle({
  value,
  onChange,
}: {
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex rounded-2xl border border-slate-200 bg-slate-50/80 p-1 gap-1">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 ${
          value
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full transition-colors ${
            value ? 'bg-white' : 'bg-slate-300'
          }`}
        />
        Active
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 ${
          !value
            ? 'bg-slate-700 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full transition-colors ${
            !value ? 'bg-slate-400' : 'bg-slate-300'
          }`}
        />
        Inactive
      </button>
    </div>
  )
}

// ─── Live preview card ────────────────────────────────────────────────────────

function RolePreview({
  values,
  isSystem,
}: {
  values: RoleFormValues
  isSystem: boolean
}) {
  const displayName = values.name.trim() || 'Nama role'

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 ring-2 ring-white shadow-[0_4px_12px_rgba(6,59,140,0.18)]">
        <ShieldCheck size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className={`truncate text-sm font-semibold ${values.name.trim() ? 'text-ink' : 'text-slate-400'}`}>
            {displayName}
          </div>
          {isSystem && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-purple-700">
              <ShieldCheck size={8} />
              System
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          {values.description.trim() && (
            <span className="truncate text-xs text-slate-400 max-w-[200px]">
              {values.description}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
              values.isActive ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${values.isActive ? 'bg-blue-500' : 'bg-slate-400'}`} />
            {values.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      <span className="hidden shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-slate-300 sm:flex">
        <Eye size={11} />
        Preview
      </span>
    </div>
  )
}

// ─── Main RoleFormDialog ──────────────────────────────────────────────────────

export function RoleFormDialog({
  open,
  mode,
  values,
  errors,
  formError,
  isDetailLoading,
  submitting,
  isSystem,
  onValuesChange,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  mode: 'create' | 'edit'
  values: RoleFormValues
  errors: MasterDataFormErrors
  formError: string | null
  isDetailLoading: boolean
  submitting: boolean
  isSystem: boolean
  onValuesChange: (updater: (prev: RoleFormValues) => RoleFormValues) => void
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}) {
  const title = mode === 'create' ? 'Tambah Role' : 'Edit Role'
  const submitLabel = mode === 'create' ? 'Simpan Role' : 'Perbarui Role'
  const showStatusToggle = !(mode === 'edit' && isSystem)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden p-0">
        {/* Accent bar */}
        <AccentBar mode={mode} />

        {/* Header */}
        <div className="px-7 pb-4 pt-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <HeaderIcon mode={mode} />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
                  <ModeBadge mode={mode} />
                </div>
                <DialogDescription className="mt-0.5 text-[13px] text-slate-500">
                  {mode === 'create'
                    ? 'Buat role baru untuk pengelolaan akses pengguna.'
                    : 'Perbarui informasi role sesuai kebutuhan.'}
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto px-7 py-5">
          {isDetailLoading ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 py-10 text-sm text-slate-500">
              <LoaderCircle size={18} className="animate-spin text-slate-400" />
              Memuat detail role...
            </div>
          ) : (
            <div className="space-y-5">
              {/* Error banner */}
              {formError && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}

              {/* Live preview */}
              <RolePreview values={values} isSystem={isSystem} />

              {/* ── Section: Identitas ── */}
              <SectionHeading>Identitas</SectionHeading>

              {/* Name */}
              <div>
                <FieldLabel required>Nama Role</FieldLabel>
                <Input
                  value={values.name}
                  onChange={(e) =>
                    onValuesChange((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Contoh: Quality Control"
                  className="h-12"
                  disabled={isSystem}
                />
                <MasterDataFormFieldError message={getFieldError(errors, 'name')} />
                {isSystem ? (
                  <FieldHelper>Nama sistem tidak dapat diubah</FieldHelper>
                ) : (
                  <FieldHelper>Nama unik role (3-100 karakter)</FieldHelper>
                )}
              </div>

              {/* Description */}
              <div>
                <FieldLabel>Deskripsi</FieldLabel>
                <Textarea
                  value={values.description}
                  onChange={(e) =>
                    onValuesChange((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Deskripsi singkat mengenai fungsi role ini (opsional)"
                  rows={3}
                />
                <MasterDataFormFieldError message={getFieldError(errors, 'description')} />
                <FieldHelper>Deskripsi role (maksimal 300 karakter, opsional)</FieldHelper>
              </div>

              {/* ── Section: Status ── */}
              {showStatusToggle && (
                <>
                  <SectionHeading>Status</SectionHeading>
                  <div>
                    <FieldLabel>Status</FieldLabel>
                    <StatusToggle
                      value={values.isActive}
                      onChange={(v) =>
                        onValuesChange((prev) => ({ ...prev, isActive: v }))
                      }
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Footer */}
        <div className="px-7 py-4">
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || isDetailLoading}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-paper shadow-md transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${
              mode === 'create'
                ? 'bg-blue-700 shadow-blue-200 hover:bg-blue-800'
                : 'bg-ink shadow-ink/20 hover:bg-ink-light'
            }`}
          >
            {submitting ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {submitting ? 'Menyimpan...' : submitLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
