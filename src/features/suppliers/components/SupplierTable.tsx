import { MoreHorizontal, PencilLine, RotateCcw, Phone, Mail } from 'lucide-react'
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
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function SupplierAvatar({ name }: { name: string }) {
  const [from, to] = getAvatarGradient(name)
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tracking-wide text-white shadow-sm"
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
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200'
          : 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200'
      }`}
    >
      <span className="relative flex h-2 w-2">
        {isActive && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
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
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live data
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
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
                  <th className="py-3 pl-4 pr-6 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
                  className="group transition-colors duration-150 hover:bg-slate-50/70"
                >
                  {/* Row number */}
                  <td className="w-12 py-4 pl-6 pr-3">
                    <span className="text-xs font-medium text-slate-300">
                      {startIndex + index + 1}
                    </span>
                  </td>

                  {/* Code pill */}
                  <td className="px-4 py-4">
                    <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-widest text-slate-600">
                      {item.code}
                    </span>
                  </td>

                  {/* Supplier — avatar + name */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <SupplierAvatar name={item.name} />
                      <div>
                        <div className="text-sm font-semibold text-ink">{item.name}</div>
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
                    <td className="py-4 pl-4 pr-6 text-right">
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
