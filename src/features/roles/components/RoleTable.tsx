import { MoreHorizontal, PencilLine, RotateCcw, Shield, ShieldCheck, Trash2 } from 'lucide-react'
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
import type { RoleListItem } from '@/features/roles/types'

// ─── Status badge with pulse ──────────────────────────────────────────────────

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
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

// ─── System badge ─────────────────────────────────────────────────────────────

function SystemBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-purple-700 ring-1 ring-inset ring-purple-200">
      <ShieldCheck size={10} />
      System
    </span>
  )
}

// ─── Action dropdown ──────────────────────────────────────────────────────────

function ActionMenu({
  item,
  onEdit,
  onPermissions,
  onToggleStatus,
  onDelete,
}: {
  item: RoleListItem
  onEdit: (item: RoleListItem) => void
  onPermissions: (item: RoleListItem) => void
  onToggleStatus: (item: RoleListItem) => void
  onDelete: (item: RoleListItem) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
          aria-label="Aksi role"
        >
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(item)}>
          <PencilLine size={15} className="text-slate-500" />
          <span>Edit Role</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPermissions(item)}>
          <Shield size={15} className="text-slate-500" />
          <span>Ubah Permissions</span>
        </DropdownMenuItem>
        {!item.isSystem && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onToggleStatus(item)}
              className="text-amber-700 focus:bg-amber-50 focus:text-amber-800"
            >
              <RotateCcw size={15} className="text-amber-500" />
              <span>Ubah Status</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(item)}
              className="text-red-700 focus:bg-red-50 focus:text-red-800"
            >
              <Trash2 size={15} className="text-red-500" />
              <span>Hapus Role</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Mobile card row ─────────────────────────────────────────────────────────

function RoleCardRow({
  item,
  index,
  onEdit,
  onPermissions,
  onToggleStatus,
  onDelete,
  canManage,
}: {
  item: RoleListItem
  index: number
  onEdit: (item: RoleListItem) => void
  onPermissions: (item: RoleListItem) => void
  onToggleStatus: (item: RoleListItem) => void
  onDelete: (item: RoleListItem) => void
  canManage: boolean
}) {
  return (
    <div className="relative flex gap-3 border-b border-slate-100 p-4 last:border-b-0">
      <span className="absolute left-0 top-0 h-full w-[3px] scale-y-0 bg-signal transition-transform duration-150 group-active:scale-y-100" />
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        <ShieldCheck size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="truncate text-sm font-semibold text-ink">{item.name}</div>
              {item.isSystem && <SystemBadge />}
            </div>
            {item.description && (
              <div className="mt-1 truncate text-xs text-slate-400">{item.description}</div>
            )}
          </div>
          {canManage && (
            <ActionMenu
              item={item}
              onEdit={onEdit}
              onPermissions={onPermissions}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
            />
          )}
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

// ─── Main RoleTable ───────────────────────────────────────────────────────────

export function RoleTable({
  items,
  pagination,
  onPageChange,
  onEdit,
  onPermissions,
  onToggleStatus,
  onDelete,
  canManage,
}: {
  items: RoleListItem[]
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  onEdit: (item: RoleListItem) => void
  onPermissions: (item: RoleListItem) => void
  onToggleStatus: (item: RoleListItem) => void
  onDelete: (item: RoleListItem) => void
  canManage: boolean
}) {
  const startIndex = (pagination.page - 1) * pagination.pageSize

  return (
    <Card className="overflow-hidden rounded-[24px] border border-slate-200/80 shadow-sm">
      {/* Card header */}
      <CardHeader className="border-b border-slate-100 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-ink">Role List</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              <span className="font-semibold text-ink">{pagination.totalItems}</span> role
              terdaftar pada sistem
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Live data
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* ── Mobile: stacked cards ── */}
        <div className="divide-y divide-slate-100 sm:hidden">
          {items.map((item, index) => (
            <RoleCardRow
              key={item.id}
              item={item}
              index={startIndex + index}
              onEdit={onEdit}
              onPermissions={onPermissions}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
              canManage={canManage}
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
                  Role
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Deskripsi
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Status
                </th>
                {canManage && (
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

                  {/* Role name + system badge */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                        <ShieldCheck size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="truncate text-sm font-semibold text-ink">{item.name}</div>
                          {item.isSystem && <SystemBadge />}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="px-4 py-4">
                    <div className="truncate text-sm text-slate-500 max-w-[200px]">
                      {item.description ?? <span className="text-slate-300">—</span>}
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-4">
                    <StatusBadge isActive={item.isActive} />
                  </td>

                  {/* Action dropdown */}
                  {canManage && (
                    <td className="w-20 py-4 pl-4 pr-6 text-center">
                      <ActionMenu
                        item={item}
                        onEdit={onEdit}
                        onPermissions={onPermissions}
                        onToggleStatus={onToggleStatus}
                        onDelete={onDelete}
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
