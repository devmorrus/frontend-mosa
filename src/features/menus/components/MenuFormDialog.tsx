import {
  AlertCircle,
  ChevronRight,
  Eye,
  Globe,
  Key,
  Link,
  LoaderCircle,
  Menu,
  PencilLine,
  Save,
  ShieldCheck,
  Type,
} from 'lucide-react'
import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { MasterDataFormFieldError } from '@/features/master-data/components/MasterDataFormFieldError'
import { getFieldError } from '@/features/master-data/utils'
import type { MasterDataFormErrors } from '@/features/master-data/types'
import type { MenuFormValues, MenuTreeNode } from '@/features/menus/types'
import type { PermissionItem } from '@/api/roles.api'

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
      {mode === 'create' ? <Menu size={20} /> : <PencilLine size={20} />}
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
        <span className={`h-2 w-2 rounded-full transition-colors ${value ? 'bg-white' : 'bg-slate-300'}`} />
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
        <span className={`h-2 w-2 rounded-full transition-colors ${!value ? 'bg-slate-400' : 'bg-slate-300'}`} />
        Inactive
      </button>
    </div>
  )
}

// ─── Parent tree picker ──────────────────────────────────────────────────────

function ParentOption({
  node,
  level,
  currentId,
  onSelect,
}: {
  node: MenuTreeNode
  level: number
  currentId: string | null
  onSelect: (id: string | null) => void
}) {
  const isCurrent = node.id === currentId

  return (
    <>
      <button
        type="button"
        disabled={isCurrent}
        onClick={() => onSelect(node.id)}
        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
          isCurrent
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'text-slate-700 hover:bg-slate-50'
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        <span className="text-xs text-slate-400">
          {level === 0 ? (
            <ShieldCheck size={13} />
          ) : (
            <ChevronRight size={12} />
          )}
        </span>
        <span className="truncate">{node.name}</span>
        {node.isSystem && (
          <span className="ml-auto inline-flex items-center rounded bg-purple-50 px-1 py-0.5 text-[8px] font-bold uppercase tracking-widest text-purple-600">
            Sys
          </span>
        )}
      </button>
      {node.children.map((child) => (
        <ParentOption
          key={child.id}
          node={child}
          level={level + 1}
          currentId={currentId}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}

// ─── Menu preview ────────────────────────────────────────────────────────────

function MenuPreview({
  values,
  parentName,
}: {
  values: MenuFormValues
  parentName: string | null
}) {
  const displayName = values.name.trim() || 'Nama menu'

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-200/80 text-slate-500 ring-2 ring-white shadow-[0_4px_12px_rgba(18,48,46,0.10)]">
        <Menu size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`truncate text-sm font-semibold ${values.name.trim() ? 'text-ink' : 'text-slate-400'}`}>
          {displayName}
        </div>
        <div className="mt-0.5 flex items-center gap-2 flex-wrap">
          <span className="inline-block rounded-md bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-slate-500 ring-1 ring-slate-200">
            {values.code.trim() || 'code'}
          </span>
          {values.path.trim() && (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
              <Globe size={9} />
              {values.path.trim()}
            </span>
          )}
          {parentName && (
            <span className="text-[10px] text-slate-400">in {parentName}</span>
          )}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
              values.isActive ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${values.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
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

// ─── Main MenuFormDialog ──────────────────────────────────────────────────────

export function MenuFormDialog({
  open,
  mode,
  values,
  errors,
  formError,
  isDetailLoading,
  submitting,
  menuTree,
  availablePermissions,
  onValuesChange,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  mode: 'create' | 'edit'
  values: MenuFormValues
  errors: MasterDataFormErrors
  formError: string | null
  isDetailLoading: boolean
  submitting: boolean
  menuTree: MenuTreeNode[]
  availablePermissions: PermissionItem[]
  onValuesChange: (updater: (prev: MenuFormValues) => MenuFormValues) => void
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}) {
  const title = mode === 'create' ? 'Tambah Menu' : 'Edit Menu'
  const submitLabel = mode === 'create' ? 'Simpan Menu' : 'Perbarui Menu'

  // Find parent name for preview
  function findNodeName(nodes: MenuTreeNode[], id: string): string | null {
    for (const node of nodes) {
      if (node.id === id) return node.name
      const found = findNodeName(node.children, id)
      if (found) return found
    }
    return null
  }
  const parentName = values.parentId ? findNodeName(menuTree, values.parentId) : null

  // Group permissions by module
  const permissionsByModule = availablePermissions.reduce<Record<string, PermissionItem[]>>((acc, p) => {
    const module = p.code.split('.')[0]
    if (!acc[module]) acc[module] = []
    acc[module].push(p)
    return acc
  }, {})

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
                    ? 'Isi data menu baru yang akan ditampilkan di sidebar.'
                    : 'Perbarui informasi menu sesuai kebutuhan.'}
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
              Memuat detail menu...
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
              <MenuPreview values={values} parentName={parentName} />

              {/* ── Section: Identitas ── */}
              <SectionHeading>Identitas</SectionHeading>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Code */}
                <div>
                  <FieldLabel required>Code</FieldLabel>
                  <IconInput icon={<Type size={15} />}>
                    <Input
                      value={values.code}
                      onChange={(e) =>
                        onValuesChange((prev) => ({ ...prev, code: e.target.value }))
                      }
                      placeholder="my-menu"
                      className="h-12"
                      disabled={mode === 'edit'}
                    />
                  </IconInput>
                  <MasterDataFormFieldError message={getFieldError(errors, 'code')} />
                  <FieldHelper>
                    {mode === 'edit'
                      ? 'Code tidak dapat diubah setelah dibuat.'
                      : 'Huruf kecil, angka, strip. Contoh: my-menu'}
                  </FieldHelper>
                </div>

                {/* Name */}
                <div>
                  <FieldLabel required>Nama</FieldLabel>
                  <IconInput icon={<Menu size={15} />}>
                    <Input
                      value={values.name}
                      onChange={(e) =>
                        onValuesChange((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="My Menu"
                      className="h-12"
                    />
                  </IconInput>
                  <MasterDataFormFieldError message={getFieldError(errors, 'name')} />
                  <FieldHelper>Nama tampilan di sidebar (2-100 karakter)</FieldHelper>
                </div>
              </div>

              {/* ── Section: Navigasi ── */}
              <SectionHeading>Navigasi</SectionHeading>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Path */}
                <div>
                  <FieldLabel>Path</FieldLabel>
                  <IconInput icon={<Globe size={15} />}>
                    <Input
                      value={values.path}
                      onChange={(e) =>
                        onValuesChange((prev) => ({ ...prev, path: e.target.value }))
                      }
                      placeholder="/dashboard"
                      className="h-12"
                    />
                  </IconInput>
                  <MasterDataFormFieldError message={getFieldError(errors, 'path')} />
                  <FieldHelper>URL path, dimulai dengan /</FieldHelper>
                </div>

                {/* Sort Order */}
                <div>
                  <FieldLabel>Sort Order</FieldLabel>
                  <IconInput icon={<Link size={15} />}>
                    <Input
                      type="number"
                      min={0}
                      value={values.sortOrder}
                      onChange={(e) =>
                        onValuesChange((prev) => ({
                          ...prev,
                          sortOrder: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="h-12"
                    />
                  </IconInput>
                  <MasterDataFormFieldError message={getFieldError(errors, 'sortOrder')} />
                  <FieldHelper>Urutan tampilan (0 = paling atas)</FieldHelper>
                </div>
              </div>

              {/* Parent */}
              <div>
                <FieldLabel>Parent Menu</FieldLabel>
                <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                  {/* Root level option */}
                  <button
                    type="button"
                    onClick={() => onValuesChange((prev) => ({ ...prev, parentId: null }))}
                    className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                      values.parentId === null
                        ? 'bg-ink/5 text-ink font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400">
                      {values.parentId === null && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="font-medium">(Root level)</span>
                  </button>

                  {menuTree
                    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
                    .map((node) => (
                      <ParentOption
                        key={node.id}
                        node={node}
                        level={0}
                        currentId={values.parentId}
                        onSelect={(id) => onValuesChange((prev) => ({ ...prev, parentId: id }))}
                      />
                    ))}
                </div>
                <FieldHelper>Tentukan parent menu untuk membuat hierarchy</FieldHelper>
              </div>

              {/* Icon */}
              <div>
                <FieldLabel>Icon Name</FieldLabel>
                <IconInput icon={<PencilLine size={15} />}>
                  <Input
                    value={values.icon}
                    onChange={(e) =>
                      onValuesChange((prev) => ({ ...prev, icon: e.target.value }))
                    }
                    placeholder="e.g. Home, Users, Settings"
                    className="h-12"
                  />
                </IconInput>
                <MasterDataFormFieldError message={getFieldError(errors, 'icon')} />
                <FieldHelper>Nama icon untuk sidebar (opsional)</FieldHelper>
              </div>

              {/* ── Section: Akses ── */}
              <SectionHeading>Akses</SectionHeading>

              {/* Required Permission Code */}
              <div>
                <FieldLabel>Required Permission Code</FieldLabel>
                <select
                  value={values.requiredPermissionCode}
                  onChange={(e) =>
                    onValuesChange((prev) => ({
                      ...prev,
                      requiredPermissionCode: e.target.value,
                    }))
                  }
                  className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm transition-colors focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-ink/10"
                >
                  <option value="">— Tidak ada permission —</option>
                  {Object.entries(permissionsByModule).map(([module, perms]) => (
                    <optgroup key={module} label={module}>
                      {perms.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.code}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <MasterDataFormFieldError message={getFieldError(errors, 'requiredPermissionCode')} />
                <FieldHelper>Permission yang dibutuhkan untuk mengakses menu ini</FieldHelper>
              </div>

              {/* ── Section: Status ── */}
              <SectionHeading>Status</SectionHeading>
              <StatusToggle
                value={values.isActive}
                onChange={(v) => onValuesChange((prev) => ({ ...prev, isActive: v }))}
              />
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
