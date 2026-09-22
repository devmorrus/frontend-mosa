import { Hash, Pencil, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'
import type { WarehouseListItem } from '@/features/warehouses/types'

const AVATAR_GRADIENTS: [string, string][] = [
  ['#063b8c', '#0b5ed7'],
  ['#334155', '#0b5ed7'],
  ['#1e3a8a', '#4f46e5'],
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
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function WarehouseAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const [from, to] = getAvatarGradient(name)
  const dims = size === 'sm' ? 'h-8 w-8 text-[10px]' : 'h-9 w-9 text-xs'
  return (
    <div
      className={`relative flex ${dims} shrink-0 items-center justify-center rounded-xl font-bold tracking-wide text-white ring-1 ring-black/5 shadow-sm`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {getInitials(name)}
    </div>
  )
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-colors ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
          : 'bg-slate-100 text-slate-500 ring-slate-200'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

function ActionMenu({
  item,
  onEdit,
  onToggleStatus,
}: {
  item: WarehouseListItem
  onEdit: (item: WarehouseListItem) => void
  onToggleStatus: (item: WarehouseListItem) => void
}) {
  return (
    <div className="flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onEdit(item)}
        aria-label={`Edit ${item.name}`}
        title="Edit warehouse"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
      >
        <Pencil size={15} />
      </button>
      <button
        type="button"
        onClick={() => onToggleStatus(item)}
        aria-label={`Ubah status ${item.name} ke ${item.isActive ? 'Inactive' : 'Active'}`}
        title={`Ubah status ke ${item.isActive ? 'Inactive' : 'Active'}`}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
      >
        <RotateCcw size={15} />
      </button>
    </div>
  )
}

function WarehouseCardRow({
  item,
  onEdit,
  onToggleStatus,
  canUpdate,
}: {
  item: WarehouseListItem
  index: number
  onEdit: (item: WarehouseListItem) => void
  onToggleStatus: (item: WarehouseListItem) => void
  canUpdate: boolean
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <WarehouseAvatar name={item.name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">{item.name}</div>
              <span className="mt-1 inline-flex max-w-full items-center gap-1 truncate rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-slate-500">
                <Hash size={9} className="shrink-0" />
                <span className="truncate">{item.code}</span>
              </span>
            </div>
            {canUpdate && (
              <ActionMenu item={item} onEdit={onEdit} onToggleStatus={onToggleStatus} />
            )}
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-400">Lokasi terdaftar</div>

          <div className="mt-3">
            <StatusBadge isActive={item.isActive} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function WarehouseTable({
  items,
  pagination,
  onPageChange,
  onEdit,
  onToggleStatus,
  canUpdate,
}: {
  items: WarehouseListItem[]
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  onEdit: (item: WarehouseListItem) => void
  onToggleStatus: (item: WarehouseListItem) => void
  canUpdate: boolean
}) {
  const startIndex = (pagination.page - 1) * pagination.pageSize
  const endIndex = Math.min(startIndex + items.length, pagination.totalItems)

  return (
    <Card className="overflow-hidden rounded-[20px] border border-slate-200/75 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <CardHeader className="border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold text-slate-900">Warehouse List</h2>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              <span className="font-semibold text-slate-900">{pagination.totalItems}</span> warehouse terdaftar
              {pagination.totalItems > 0 ? <span className="text-slate-400"> • Menampilkan {startIndex + 1}–{endIndex}</span> : null}
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live data
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid gap-3 bg-slate-50/60 p-4 sm:hidden">
          {items.map((item) => (
            <WarehouseCardRow
              key={item.id}
              item={item}
              index={0}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              canUpdate={canUpdate}
            />
          ))}
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/90">
                <th className="w-14 whitespace-nowrap py-3 pl-6 pr-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  #
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Code
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Warehouse
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Status
                </th>
                {canUpdate && (
                  <th className="w-28 whitespace-nowrap py-3 pl-4 pr-6 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className="transition-colors duration-150 hover:bg-blue-50/40"
                >
                  <td className="w-14 py-4 pl-6 pr-3 align-top">
                    <span className="text-xs font-medium tabular-nums text-slate-300">
                      {startIndex + index + 1}
                    </span>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <span title={item.code} className="inline-flex max-w-[160px] items-center truncate rounded-lg bg-slate-100 px-2 py-1 font-mono text-[11px] font-semibold tracking-wider text-slate-600">
                      <span className="truncate">{item.code}</span>
                    </span>
                  </td>

                  <td className="min-w-[220px] px-4 py-4 align-top">
                    <div className="flex items-center gap-3">
                      <WarehouseAvatar name={item.name} />
                      <div className="min-w-0">
                        <div title={item.name} className="truncate text-sm font-semibold text-slate-900">{item.name}</div>
                        <div className="mt-0.5 truncate text-xs text-slate-400">Lokasi terdaftar</div>
                      </div>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 align-top">
                    <StatusBadge isActive={item.isActive} />
                  </td>

                  {canUpdate && (
                    <td className="w-28 whitespace-nowrap py-4 pl-4 pr-6 text-center align-top">
                      <ActionMenu item={item} onEdit={onEdit} onToggleStatus={onToggleStatus} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 bg-white">
          <MasterDataPagination pagination={pagination} onPageChange={onPageChange} />
        </div>
      </CardContent>
    </Card>
  )
}
