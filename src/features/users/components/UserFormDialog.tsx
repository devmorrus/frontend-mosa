import {
  AlertCircle,
  Eye,
  EyeOff,
  Hash,
  KeyRound,
  LoaderCircle,
  PencilLine,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { MasterDataFormFieldError } from '@/features/master-data/components/MasterDataFormFieldError'
import { getFieldError } from '@/features/master-data/utils'
import type { MasterDataFormErrors } from '@/features/master-data/types'
import type { RoleLookupResponse, UserFormValues } from '@/features/users/types'

// ─── Sub-components ──────────────────────────────────────────────────────────

function AccentBar({ mode }: { mode: 'create' | 'edit' }) {
  return (
    <div
      className={`absolute inset-x-0 top-0 h-1 rounded-t-[28px] ${
        mode === 'create'
          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
          : 'bg-gradient-to-r from-amber-500 to-orange-400'
      }`}
    />
  )
}

function HeaderIcon({ mode }: { mode: 'create' | 'edit' }) {
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
        mode === 'create' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      {mode === 'create' ? <User size={20} /> : <PencilLine size={20} />}
    </div>
  )
}

function ModeBadge({ mode }: { mode: 'create' | 'edit' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
        mode === 'create'
          ? 'bg-emerald-100 text-emerald-700'
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
      <div className="[&>input]:pl-11">{children}</div>
    </div>
  )
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
            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
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

// ─── Avatar preview helpers ───────────────────────────────────────────────────

const AVATAR_GRADIENTS: [string, string][] = [
  ['#12302e', '#1c433f'],
  ['#0f4c81', '#1a6fb5'],
  ['#6b21a8', '#9333ea'],
  ['#b45309', '#d97706'],
  ['#0f766e', '#0d9488'],
  ['#be123c', '#e11d48'],
  ['#1d4ed8', '#3b82f6'],
  ['#166534', '#16a34a'],
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

function UserPreview({
  values,
  selectedRoleNames,
}: {
  values: UserFormValues
  selectedRoleNames: string[]
}) {
  const displayName = values.fullName.trim() || 'Nama lengkap'
  const [from, to] = getAvatarGradient(displayName)

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3.5">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-bold tracking-wide text-white ring-2 ring-white shadow-[0_4px_12px_rgba(18,48,46,0.18)]"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        {getInitials(displayName)}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`truncate text-sm font-semibold ${values.fullName.trim() ? 'text-ink' : 'text-slate-400'}`}>
          {displayName}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="inline-block rounded-md bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-widest text-slate-500 ring-1 ring-slate-200">
            {values.username.trim() || 'USERNAME'}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
              values.isActive ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${values.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {values.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        {selectedRoleNames.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {selectedRoleNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600"
              >
                <ShieldCheck size={8} className="text-slate-400" />
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
      <span className="hidden shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-slate-300 sm:flex">
        <Eye size={11} />
        Preview
      </span>
    </div>
  )
}

// ─── Main UserFormDialog ──────────────────────────────────────────────────────

export function UserFormDialog({
  open,
  mode,
  values,
  errors,
  formError,
  isDetailLoading,
  submitting,
  availableRoles,
  onValuesChange,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  mode: 'create' | 'edit'
  values: UserFormValues
  errors: MasterDataFormErrors
  formError: string | null
  isDetailLoading: boolean
  submitting: boolean
  availableRoles: RoleLookupResponse[]
  onValuesChange: (updater: (prev: UserFormValues) => UserFormValues) => void
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const title = mode === 'create' ? 'Tambah User' : 'Edit Profil User'
  const submitLabel = mode === 'create' ? 'Simpan User' : 'Perbarui Profil'

  const selectedRoleNames = availableRoles
    .filter((r) => values.roleIds.includes(r.id))
    .map((r) => r.name)

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
                    ? 'Isi data user baru yang akan terdaftar di sistem.'
                    : 'Perbarui informasi profil user sesuai data terkini.'}
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
              Memuat detail user...
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
              <UserPreview values={values} selectedRoleNames={selectedRoleNames} />

              {/* ── Section: Identitas ── */}
              <SectionHeading>Identitas</SectionHeading>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Username */}
                <div>
                  <FieldLabel required>Username</FieldLabel>
                  <IconInput icon={<Hash size={15} />}>
                    <Input
                      value={values.username}
                      onChange={(e) =>
                        onValuesChange((prev) => ({ ...prev, username: e.target.value }))
                      }
                      placeholder="john.doe"
                      className="h-12"
                      disabled={mode === 'edit'}
                    />
                  </IconInput>
                  <MasterDataFormFieldError message={getFieldError(errors, 'username')} />
                  <FieldHelper>Username unik untuk login (3-50 karakter)</FieldHelper>
                </div>

                {/* Status */}
                <div>
                  <FieldLabel>Status</FieldLabel>
                  <StatusToggle
                    value={values.isActive}
                    onChange={(v) =>
                      onValuesChange((prev) => ({ ...prev, isActive: v }))
                    }
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <FieldLabel required>Nama Lengkap</FieldLabel>
                <IconInput icon={<User size={15} />}>
                  <Input
                    value={values.fullName}
                    onChange={(e) =>
                      onValuesChange((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    placeholder="John Doe"
                    className="h-12"
                  />
                </IconInput>
                <MasterDataFormFieldError message={getFieldError(errors, 'fullName')} />
                <FieldHelper>Nama lengkap user (3-150 karakter)</FieldHelper>
              </div>

              {/* ── Section: Password (create only) ── */}
              {mode === 'create' && (
                <>
                  <SectionHeading>Password</SectionHeading>
                  <div>
                    <FieldLabel required>Password</FieldLabel>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <KeyRound size={15} />
                      </div>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={values.password}
                        onChange={(e) =>
                          onValuesChange((prev) => ({ ...prev, password: e.target.value }))
                        }
                        placeholder="Minimal 8 karakter"
                        className="h-12 pl-11 pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <MasterDataFormFieldError message={getFieldError(errors, 'password')} />
                    <FieldHelper>8-128 karakter, harus mengandung huruf dan angka</FieldHelper>
                  </div>
                </>
              )}

              {/* ── Section: Roles ── */}
              <SectionHeading>Roles</SectionHeading>

              {availableRoles.length === 0 ? (
                <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 py-6 text-sm text-slate-400">
                  <LoaderCircle size={16} className="animate-spin" />
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {availableRoles.map((role) => {
                    const isSelected = values.roleIds.includes(role.id)
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => {
                          onValuesChange((prev) => ({
                            ...prev,
                            roleIds: isSelected
                              ? prev.roleIds.filter((id) => id !== role.id)
                              : [...prev.roleIds, role.id],
                          }))
                        }}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                          isSelected
                            ? 'border-ink/20 bg-ink/5 text-ink'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                            isSelected
                              ? 'border-ink bg-ink text-white'
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
                        <div className="min-w-0">
                          <div className="text-xs font-semibold">{role.name}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
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
                ? 'bg-emerald-700 shadow-emerald-200 hover:bg-emerald-800'
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
