import { MoreHorizontal, PencilLine, RotateCcw, ShieldCheck, KeyRound, User } from 'lucide-react'
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
import type { UserListItem } from '@/features/users/types'

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

function UserAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
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

// ─── Role badges ──────────────────────────────────────────────────────────────

function RoleBadges({ roles }: { roles: UserListItem['roles'] }) {
  if (roles.length === 0) {
    return <span className="text-xs text-slate-300">—</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {roles.slice(0, 2).map((role) => (
        <span
          key={role.id}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
        >
          <ShieldCheck size={9} className="text-slate-400" />
          {role.name}
        </span>
      ))}
      {roles.length > 2 && (
        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
          +{roles.length - 2}
        </span>
      )}
    </div>
  )
}

// ─── Action dropdown ──────────────────────────────────────────────────────────

function ActionMenu({
  item,
  onDetail,
  onEdit,
  onToggleStatus,
  onRoles,
  onPassword,
  onRevokeSessions,
}: {
  item: UserListItem
  onDetail: (item: UserListItem) => void
  onEdit: (item: UserListItem) => void
  onToggleStatus: (item: UserListItem) => void
  onRoles: (item: UserListItem) => void
  onPassword: (item: UserListItem) => void
  onRevokeSessions: (item: UserListItem) => void
}) {
  return (
        <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
          aria-label="Aksi user"
        >
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onDetail(item)}>
          <User size={15} className="text-slate-500" />
          <span>Lihat Detail</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(item)}>
          <PencilLine size={15} className="text-slate-500" />
          <span>Edit Profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRoles(item)}>
          <ShieldCheck size={15} className="text-slate-500" />
          <span>Ubah Roles</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPassword(item)}>
          <KeyRound size={15} className="text-slate-500" />
          <span>Ganti Password</span>
        </DropdownMenuItem>
        <DropdownMenuItem data-tour="user-revoke-session" onClick={() => onRevokeSessions(item)}>
          <RotateCcw size={15} className="text-slate-500" />
          <span>Revoke Sessions</span>
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

// ─── Mobile card row ─────────────────────────────────────────────────────────

function UserCardRow({
  item,
  index,
  onEdit,
  onDetail,
  onToggleStatus,
  onRoles,
  onPassword,
  onRevokeSessions,
  canUpdate,
}: {
  item: UserListItem
  index: number
  onEdit: (item: UserListItem) => void
  onDetail: (item: UserListItem) => void
  onToggleStatus: (item: UserListItem) => void
  onRoles: (item: UserListItem) => void
  onPassword: (item: UserListItem) => void
  onRevokeSessions: (item: UserListItem) => void
  canUpdate: boolean
}) {
  return (
    <div className="relative flex gap-3 border-b border-slate-100 p-4 last:border-b-0">
      <span className="absolute left-0 top-0 h-full w-[3px] scale-y-0 bg-signal transition-transform duration-150 group-active:scale-y-100" />
      <UserAvatar name={item.fullName} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-ink">{item.fullName}</div>
            <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-widest text-slate-500">
              <User size={9} />
              {item.username}
            </span>
          </div>
          {canUpdate && (
            <ActionMenu
              item={item}
              onDetail={onDetail}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onRoles={onRoles}
              onPassword={onPassword}
              onRevokeSessions={onRevokeSessions}
            />
          )}
        </div>

        <div data-tour="user-role" className="mt-2.5">
          <RoleBadges roles={item.roles} />
        </div>

            <div data-tour="user-status" className="mt-2.5">
              <StatusBadge isActive={item.isActive} />
            </div>
            <div className="mt-2 text-xs text-slate-400">
              {item.lastLoginAtUtc ? `Login terakhir: ${new Date(item.lastLoginAtUtc).toLocaleString('id-ID')}` : 'Belum ada login tercatat'}
            </div>
          </div>
      <span className="absolute right-4 top-4 text-[10px] font-medium text-slate-300">
        #{index + 1}
      </span>
    </div>
  )
}

// ─── Main UserTable ───────────────────────────────────────────────────────────

export function UserTable({
  items,
  pagination,
  onPageChange,
  onEdit,
  onDetail,
  onToggleStatus,
  onRoles,
  onPassword,
  onRevokeSessions,
  canUpdate,
}: {
  items: UserListItem[]
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  onEdit: (item: UserListItem) => void
  onDetail: (item: UserListItem) => void
  onToggleStatus: (item: UserListItem) => void
  onRoles: (item: UserListItem) => void
  onPassword: (item: UserListItem) => void
  onRevokeSessions: (item: UserListItem) => void
  canUpdate: boolean
}) {
  const startIndex = (pagination.page - 1) * pagination.pageSize

  return (
    <Card className="overflow-hidden rounded-[24px] border border-slate-200/80 shadow-sm">
      {/* Card header */}
      <CardHeader className="border-b border-slate-100 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-ink">User List</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              <span className="font-semibold text-ink">{pagination.totalItems}</span> user
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
              <UserCardRow
                key={item.id}
                item={item}
                index={startIndex + index}
                onEdit={onEdit}
                onDetail={onDetail}
                onToggleStatus={onToggleStatus}
                onRoles={onRoles}
                onPassword={onPassword}
                onRevokeSessions={onRevokeSessions}
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
                  Username
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  User
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Roles
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

                  {/* Username pill */}
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-widest text-slate-600 transition-colors group-hover:bg-slate-200/70">
                      {item.username}
                    </span>
                  </td>

                  {/* User — avatar + name */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={item.fullName} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-ink">{item.fullName}</div>
                      </div>
                    </div>
                  </td>

                  {/* Roles */}
                  <td className="px-4 py-4" data-tour="user-role">
                    <RoleBadges roles={item.roles} />
                  </td>

                  {/* Status badge */}
                      <td className="px-4 py-4" data-tour="user-status">
                        <StatusBadge isActive={item.isActive} />
                        <div className="mt-2 text-[11px] text-slate-400">
                          {item.lastLoginAtUtc
                            ? `Login terakhir: ${new Date(item.lastLoginAtUtc).toLocaleDateString('id-ID')}`
                            : 'Belum ada login tercatat'}
                        </div>
                      </td>

                  {/* Action dropdown */}
                  {canUpdate && (
                      <td className="w-20 py-4 pl-4 pr-6 text-center">
                        <ActionMenu
                          item={item}
                          onDetail={onDetail}
                          onEdit={onEdit}
                          onToggleStatus={onToggleStatus}
                          onRoles={onRoles}
                          onPassword={onPassword}
                          onRevokeSessions={onRevokeSessions}
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
