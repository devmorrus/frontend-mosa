import {
  AlertCircle,
  Boxes,
  Eye,
  Hash,
  LoaderCircle,
  PencilLine,
  Save,
  Scale,
  TimerReset,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { MasterDataFormFieldError } from '@/features/master-data/components/MasterDataFormFieldError'
import type { MasterDataFormErrors } from '@/features/master-data/types'
import { getFieldError } from '@/features/master-data/utils'
import type { ProductFormValues } from '@/features/products/types'
import type { UnitOfMeasureOption } from '@/features/unit-of-measures/types'

function buildUnitOptionLabel(option: UnitOfMeasureOption) {
  return option.symbol
    ? `${option.name} (${option.code} / ${option.symbol})`
    : `${option.name} (${option.code})`
}

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
      {mode === 'create' ? <Boxes size={20} /> : <PencilLine size={20} />}
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
      {mode === 'create' ? 'Baru' : 'Edit'}
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
      <div className="[&>input]:pl-11 [&>select]:pl-11">{children}</div>
    </div>
  )
}

function StatusToggle({
  value,
  onChange,
}: {
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-50/80 p-1">
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
            !value ? 'bg-slate-200' : 'bg-slate-300'
          }`}
        />
        Inactive
      </button>
    </div>
  )
}

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
  if (!trimmed) return 'PR'
  return trimmed
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function ProductPreview({
  values,
  currentUnit,
}: {
  values: ProductFormValues
  currentUnit: UnitOfMeasureOption | null
}) {
  const displayName = values.name.trim() || 'Nama product'
  const [from, to] = getAvatarGradient(displayName)
  const unitLabel = currentUnit ? currentUnit.code : 'Pilih UOM'
  const shelfLifeLabel = values.shelfLifeDays.trim()
    ? `${values.shelfLifeDays.trim()} hari`
    : 'Tidak diatur'

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-bold tracking-wide text-white ring-2 ring-white shadow-[0_4px_12px_rgba(6,59,140,0.18)]"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        >
          {getInitials(displayName)}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={`truncate text-sm font-semibold ${
              values.name.trim() ? 'text-ink' : 'text-slate-400'
            }`}
          >
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
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  values.isActive ? 'bg-blue-500' : 'bg-slate-400'
                }`}
              />
              {values.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <span className="hidden shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-slate-300 sm:flex">
          <Eye size={11} />
          Preview
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-slate-500 ring-1 ring-slate-200">
          <Scale size={11} className="text-slate-400" />
          UOM: {unitLabel}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] text-slate-500 ring-1 ring-slate-200">
          <TimerReset size={11} className="text-slate-400" />
          Shelf life: {shelfLifeLabel}
        </span>
      </div>
    </div>
  )
}

export function ProductFormDialog({
  open,
  mode,
  values,
  errors,
  formError,
  uomError,
  isUomLoading,
  isDetailLoading,
  submitting,
  unitOptions,
  currentUnit,
  onValuesChange,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  mode: 'create' | 'edit'
  values: ProductFormValues
  errors: MasterDataFormErrors
  formError: string | null
  uomError: string | null
  isUomLoading: boolean
  isDetailLoading: boolean
  submitting: boolean
  unitOptions: UnitOfMeasureOption[]
  currentUnit: UnitOfMeasureOption | null
  onValuesChange: (updater: (prev: ProductFormValues) => ProductFormValues) => void
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}) {
  const title = mode === 'create' ? 'Tambah Product' : 'Edit Product'
  const submitLabel = mode === 'create' ? 'Simpan Product' : 'Perbarui Product'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden p-0">
        <AccentBar mode={mode} />

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
                    ? 'Isi data product baru agar siap dipakai lintas modul.'
                    : 'Perbarui informasi product sesuai kebutuhan operasional terkini.'}
                </DialogDescription>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="max-h-[60vh] overflow-y-auto px-7 py-5">
          {isDetailLoading ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 py-10 text-sm text-slate-500">
              <LoaderCircle size={18} className="animate-spin text-slate-400" />
              Memuat detail product...
            </div>
          ) : (
            <div className="space-y-5">
              {formError && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}

              {uomError && (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                  <p className="text-sm text-amber-800">{uomError}</p>
                </div>
              )}

              <ProductPreview values={values} currentUnit={currentUnit} />

              <SectionHeading>Identitas</SectionHeading>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel required>Code</FieldLabel>
                  <IconInput icon={<Hash size={15} />}>
                    <Input
                      value={values.code}
                      onChange={(event) =>
                        onValuesChange((prev) => ({ ...prev, code: event.target.value }))
                      }
                      placeholder="PRD-001"
                      className="h-12"
                    />
                  </IconInput>
                  <MasterDataFormFieldError message={getFieldError(errors, 'code')} />
                  <FieldHelper>Kode unik untuk identifikasi product</FieldHelper>
                </div>

                <div>
                  <FieldLabel>Status</FieldLabel>
                  <StatusToggle
                    value={values.isActive}
                    onChange={(value) =>
                      onValuesChange((prev) => ({ ...prev, isActive: value }))
                    }
                  />
                </div>
              </div>

              <div>
                <FieldLabel required>Nama Product</FieldLabel>
                <IconInput icon={<Boxes size={15} />}>
                  <Input
                    value={values.name}
                    onChange={(event) =>
                      onValuesChange((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Frozen Croissant Butter"
                    className="h-12"
                  />
                </IconInput>
                <MasterDataFormFieldError message={getFieldError(errors, 'name')} />
                <FieldHelper>Nama product yang dipakai lintas modul operasional</FieldHelper>
              </div>

              <SectionHeading>Konfigurasi</SectionHeading>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel required>Unit Of Measure</FieldLabel>
                  <IconInput icon={<Scale size={15} />}>
                    <select
                      value={values.unitOfMeasureId}
                      onChange={(event) =>
                        onValuesChange((prev) => ({
                          ...prev,
                          unitOfMeasureId: event.target.value,
                        }))
                      }
                      disabled={isUomLoading}
                      className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white pr-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      <option value="">{isUomLoading ? 'Memuat UOM...' : 'Pilih UOM aktif'}</option>
                      {unitOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {buildUnitOptionLabel(option)}
                        </option>
                      ))}
                    </select>
                  </IconInput>
                  <MasterDataFormFieldError message={getFieldError(errors, 'unitOfMeasureId')} />
                  <FieldHelper>Satuan output atau stock utama untuk product</FieldHelper>
                </div>

                <div>
                  <FieldLabel>Shelf Life Days</FieldLabel>
                  <IconInput icon={<TimerReset size={15} />}>
                    <Input
                      type="number"
                      min={0}
                      value={values.shelfLifeDays}
                      onChange={(event) =>
                        onValuesChange((prev) => ({
                          ...prev,
                          shelfLifeDays: event.target.value,
                        }))
                      }
                      placeholder="Kosongkan jika tidak ada shelf life"
                      className="h-12"
                    />
                  </IconInput>
                  <MasterDataFormFieldError message={getFieldError(errors, 'shelfLifeDays')} />
                  <FieldHelper>Jumlah hari masa simpan bila diterapkan</FieldHelper>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-slate-100" />

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
