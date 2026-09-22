import {
  AlertCircle,
  Building2,
  Eye,
  Hash,
  LoaderCircle,
  Mail,
  MapPin,
  PencilLine,
  Phone,
  Save,
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
import type { SupplierFormValues } from '@/features/suppliers/types'

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Accent bar at the very top of the dialog — color varies per mode */
function AccentBar({ mode }: { mode: 'create' | 'edit' }) {
  return (
    <div
      className={`absolute inset-x-0 top-0 h-1 rounded-t-[24px] ${
        mode === 'create'
          ? 'bg-blue-600'
          : 'bg-amber-500'
      }`}
    />
  )
}

/** Header icon circle */
function HeaderIcon({ mode }: { mode: 'create' | 'edit' }) {
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
        mode === 'create' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      {mode === 'create' ? <Building2 size={19} /> : <PencilLine size={19} />}
    </div>
  )
}

/** Mode badge pill */
function ModeBadge({ mode }: { mode: 'create' | 'edit' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
        mode === 'create'
          ? 'bg-blue-100 text-blue-700'
          : 'bg-amber-100 text-amber-700'
      }`}
    >
      {mode === 'create' ? 'Baru' : 'Edit'}
    </span>
  )
}

/** Section heading with horizontal rule */
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

/** Label above a field */
function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
      {children}
      {required && <span className="text-red-400 normal-case">*</span>}
    </label>
  )
}

/** Helper text below a field */
function FieldHelper({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{children}</p>
}

/** Icon-prefixed input wrapper */
function IconInput({
  icon,
  children,
}: {
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </div>
      <div className="[&>input]:pl-11 [&>textarea]:pl-11">{children}</div>
    </div>
  )
}

/** Segmented status toggle — replaces native <select> */
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

const AVATAR_GRADIENTS: [string, string][] = [
  ['#063b8c', '#0b5ed7'],
  ['#0f4c81', '#1a6fb5'],
  ['#6b21a8', '#9333ea'],
  ['#b45309', '#d97706'],
  ['#0b5ed7', '#2c70c9'],
  ['#be123c', '#e11d48'],
  ['#1d4ed8', '#3b82f6'],
  ['#052e6d', '#174a9a'],
]

function getAvatarGradient(name: string): [string, string] {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const pair = AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
  return [pair[0], pair[1]]
}

function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '—'
  return trimmed
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

/** Mirrors how this supplier will appear as a row in the table, updated live. */
function SupplierPreview({ values }: { values: SupplierFormValues }) {
  const displayName = values.name.trim() || 'Nama supplier'
  const [from, to] = getAvatarGradient(displayName || 'Supplier')

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-bold tracking-wide text-white ring-2 ring-white shadow-[0_4px_12px_rgba(6,59,140,0.18)]"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        {getInitials(displayName)}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`truncate text-sm font-semibold ${values.name.trim() ? 'text-ink' : 'text-slate-400'}`}>
          {displayName}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="inline-block rounded-md bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-widest text-slate-500 ring-1 ring-slate-200">
            {values.code.trim() || 'CODE'}
          </span>
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

// ─── Main SupplierFormDialog ──────────────────────────────────────────────────

export function SupplierFormDialog({
  open,
  mode,
  values,
  errors,
  formError,
  isDetailLoading,
  submitting,
  onValuesChange,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  mode: 'create' | 'edit'
  values: SupplierFormValues
  errors: MasterDataFormErrors
  formError: string | null
  isDetailLoading: boolean
  submitting: boolean
  onValuesChange: (updater: (prev: SupplierFormValues) => SupplierFormValues) => void
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}) {
  const title = mode === 'create' ? 'Tambah Supplier' : 'Edit Supplier'
  const submitLabel = mode === 'create' ? 'Simpan Supplier' : 'Perbarui Supplier'

  const codeError = getFieldError(errors, 'code')
  const nameError = getFieldError(errors, 'name')
  const phoneError = getFieldError(errors, 'phone')
  const emailError = getFieldError(errors, 'email')
  const addressError = getFieldError(errors, 'address')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden rounded-[24px] p-0">
        {/* Accent bar */}
        <AccentBar mode={mode} />

        {/* Header */}
        <div className="px-6 pb-4 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <HeaderIcon mode={mode} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-semibold text-slate-900">{title}</h2>
                  <ModeBadge mode={mode} />
                </div>
                <DialogDescription className="mt-0.5 text-[13px] text-slate-500">
                  {mode === 'create'
                    ? 'Isi data pemasok baru untuk dipakai di Goods Receiving.'
                    : 'Perbarui informasi pemasok sesuai data terkini.'}
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Body */}
        <div className="max-h-[62vh] overflow-y-auto px-6 py-4">
          {isDetailLoading ? (
            <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 py-10 text-sm text-slate-500">
              <LoaderCircle size={18} className="animate-spin text-slate-400" />
              Memuat detail supplier...
            </div>
          ) : (
            <div className="space-y-4">
              {/* Error banner */}
              {formError && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}

              {/* Live preview */}
              <SupplierPreview values={values} />

              {/* ── Section: Identitas ── */}
              <SectionHeading>Identitas</SectionHeading>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Code */}
                <div className="min-w-0">
                  <FieldLabel required>Code</FieldLabel>
                  <IconInput icon={<Hash size={15} />}>
                    <Input
                      data-tour="supplier-code-input"
                      value={values.code}
                      onChange={(e) =>
                        onValuesChange((prev) => ({ ...prev, code: e.target.value }))
                      }
                      placeholder="SUP-001"
                      className="h-11"
                      aria-invalid={Boolean(codeError)}
                    />
                  </IconInput>
                  <MasterDataFormFieldError message={codeError} />
                  <FieldHelper>Kode unik, 2–50 karakter</FieldHelper>
                </div>

                {/* Status */}
                <div className="min-w-0">
                  <FieldLabel>Status</FieldLabel>
                  <StatusToggle
                    value={values.isActive}
                    onChange={(v) =>
                      onValuesChange((prev) => ({ ...prev, isActive: v }))
                    }
                  />
                  <FieldHelper>Inactive tidak bisa dipilih di Receiving baru</FieldHelper>
                </div>
              </div>

              {/* Name */}
              <div className="min-w-0">
                <FieldLabel required>Nama Supplier</FieldLabel>
                <IconInput icon={<Building2 size={15} />}>
                  <Input
                    data-tour="supplier-name-input"
                    value={values.name}
                    onChange={(e) =>
                      onValuesChange((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Supplier Nusantara Jaya"
                    className="h-11"
                    aria-invalid={Boolean(nameError)}
                  />
                </IconInput>
                <MasterDataFormFieldError message={nameError} />
              </div>

              {/* ── Section: Kontak & Lokasi ── */}
              <SectionHeading>Kontak & Lokasi</SectionHeading>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Phone */}
                <div className="min-w-0">
                  <FieldLabel>Phone</FieldLabel>
                  <IconInput icon={<Phone size={15} />}>
                    <Input
                      value={values.phone}
                      inputMode="tel"
                      onChange={(e) =>
                        onValuesChange((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="08xxxxxxxxxx"
                      className="h-11"
                      aria-invalid={Boolean(phoneError)}
                    />
                  </IconInput>
                  <MasterDataFormFieldError message={phoneError} />
                </div>

                {/* Email */}
                <div className="min-w-0">
                  <FieldLabel>Email</FieldLabel>
                  <IconInput icon={<Mail size={15} />}>
                    <Input
                      value={values.email}
                      inputMode="email"
                      onChange={(e) =>
                        onValuesChange((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="supplier@company.com"
                      className="h-11"
                      aria-invalid={Boolean(emailError)}
                    />
                  </IconInput>
                  <MasterDataFormFieldError message={emailError} />
                </div>
              </div>

              {/* Address */}
              <div className="min-w-0">
                <FieldLabel>Alamat</FieldLabel>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-3.5 text-slate-400">
                    <MapPin size={15} />
                  </div>
                  <Textarea
                    value={values.address}
                    onChange={(e) =>
                      onValuesChange((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="Jl. Raya Industri No. 12, Surabaya (opsional)"
                    className="min-h-[84px] pl-11"
                    rows={3}
                    aria-invalid={Boolean(addressError)}
                  />
                </div>
                <MasterDataFormFieldError message={addressError} />
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100" />

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={submitting || isDetailLoading}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            data-tour="supplier-save-btn"
            onClick={onSubmit}
            disabled={submitting || isDetailLoading}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-paper shadow-md transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 sm:min-w-[200px] ${
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