import { MoreHorizontal, PencilLine, RotateCcw, Phone, Mail, Hash } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'
import type { SupplierListItem } from '@/features/suppliers/types'

// ─── Avatar helpers ───────────────────────────────────────────────────────────

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
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function SupplierAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const [from, to] = getAvatarGradient(name)
  const dims = size === 'sm' ? 'h-8 w-8 text-[10px]' : 'h-10 w-10 text-xs'
  return (
    <div
      className={`relative flex ${dims} shrink-0 items-center justify-center rounded-2xl font-bold tracking-wide text-white ring-2 ring-white shadow-[0_4px_12px_rgba(6,59,140,0.18)]`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {getInitials(name)}
    </div>
  )
}

// ─── Status badge with pulse ──────────────────────────────────────────────────

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
          : 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200'
      }`}
    >
      <span className="relative flex h-2 w-2">
        {isActive && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-400'}`}
        />
      </span>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

// ─── Action dropdown ──────────────────────────────────────────────────────────

function ActionMenu({
  item,
  onEdit,
  onToggleStatus,
}: {
  item: SupplierListItem
  onEdit: (item: SupplierListItem) => void
  onToggleStatus: (item: SupplierListItem) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
          aria-label="Aksi supplier"
        >
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(item)}>
          <PencilLine size={15} className="text-slate-500" />
          <span>Edit Supplier</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onToggleStatus(item)}
          className="text-amber-700 focus:bg-amber-50 focus:text-amber-800"
        >
          <RotateCcw size={15} className="text-amber-500" />
          <span>Ubah Status</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Mobile card row (used below sm breakpoint instead of the table) ─────────

function SupplierCardRow({
  item,
  index,
  onEdit,
  onToggleStatus,
  canUpdate,
}: {
  item: SupplierListItem
  index: number
  onEdit: (item: SupplierListItem) => void
  onToggleStatus: (item: SupplierListItem) => void
  canUpdate: boolean
}) {
  return (
    <div className="relative flex gap-3 border-b border-slate-100 p-4 last:border-b-0">
      <span className="absolute left-0 top-0 h-full w-[3px] scale-y-0 bg-signal transition-transform duration-150 group-active:scale-y-100" />
      <SupplierAvatar name={item.name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-ink">{item.name}</div>
            <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-widest text-slate-500">
              <Hash size={9} />
              {item.code}
            </span>
          </div>
          {canUpdate && (
            <ActionMenu item={item} onEdit={onEdit} onToggleStatus={onToggleStatus} />
          )}
        </div>

        <div className="mt-2.5 flex flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Phone size={11} className="shrink-0 text-slate-400" />
            {item.phone ?? <span className="text-slate-300">—</span>}
          </span>
          <span className="inline-flex items-center gap-1.5 truncate text-xs text-slate-500">
            <Mail size={11} className="shrink-0 text-slate-400" />
            {item.email ?? <span className="text-slate-300">—</span>}
          </span>
        </div>

        <div className="mt-2.5">
          <StatusBadge isActive={item.isActive} />
        </div>
      </div>
      <span className="absolute right-4 top-4 text-[10px] font-medium text-slate-300">
        #{index + 1}
      </span>
    </div>
  )
}

// ─── Main SupplierTable ───────────────────────────────────────────────────────

export function SupplierTable({
  items,
  pagination,
  onPageChange,
  onEdit,
  onToggleStatus,
  canUpdate,
}: {
  items: SupplierListItem[]
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  onEdit: (item: SupplierListItem) => void
  onToggleStatus: (item: SupplierListItem) => void
  canUpdate: boolean
}) {
  const startIndex = (pagination.page - 1) * pagination.pageSize

  return (
    <Card className="overflow-hidden rounded-[24px] border border-slate-200/80 shadow-sm">
      {/* Card header */}
      <CardHeader className="border-b border-slate-100 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-ink">Supplier List</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              <span className="font-semibold text-ink">{pagination.totalItems}</span> supplier
              terdaftar pada sistem
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" />
            </span>
            Live data
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* ── Mobile: stacked cards ── */}
        <div className="divide-y divide-slate-100 sm:hidden">
          {items.map((item, index) => (
            <SupplierCardRow
              key={item.id}
              item={item}
              index={startIndex + index}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              canUpdate={canUpdate}
            />
          ))}
        </div>

        {/* ── Desktop: table ── */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="min-w-full">
            {/* thead */}
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="w-12 py-3 pl-6 pr-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  #
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Supplier
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Kontak
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Status
                </th>
                {canUpdate && (
                  <th className="w-20 py-3 pl-4 pr-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>

            {/* tbody */}
            <tbody className="divide-y divide-slate-100 bg-white">
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className="group relative transition-colors duration-150 hover:bg-slate-50/70"
                >
                  {/* Hover accent bar */}
                  <td className="relative w-12 py-4 pl-6 pr-3">
                    <span className="absolute inset-y-0 left-0 w-[3px] scale-y-0 rounded-r-full bg-signal transition-transform duration-150 group-hover:scale-y-100" />
                    <span className="text-xs font-medium text-slate-300">
                      {startIndex + index + 1}
                    </span>
                  </td>

                  {/* Code pill */}
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-widest text-slate-600 transition-colors group-hover:bg-slate-200/70">
                      {item.code}
                    </span>
                  </td>

                  {/* Supplier — avatar + name */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <SupplierAvatar name={item.name} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-ink">{item.name}</div>
                        <div className="mt-0.5 text-xs text-slate-400">Pemasok terdaftar</div>
                      </div>
                    </div>
                  </td>

                  {/* Contact stack */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone size={11} className="shrink-0 text-slate-400" />
                        {item.phone ?? <span className="text-slate-300">—</span>}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail size={11} className="shrink-0 text-slate-400" />
                        {item.email ?? <span className="text-slate-300">—</span>}
                      </span>
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-4">
                    <StatusBadge isActive={item.isActive} />
                  </td>

                  {/* Action dropdown */}
                  {canUpdate && (
                    <td className="w-20 py-4 pl-4 pr-6 text-center">
                      <ActionMenu
                        item={item}
                        onEdit={onEdit}
                        onToggleStatus={onToggleStatus}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <MasterDataPagination pagination={pagination} onPageChange={onPageChange} />
      </CardContent>
    </Card>
  )
}
