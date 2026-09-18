import {
  ChevronRight,
  FileText,
  FolderClosed,
  FolderOpen,
  Globe,
  Key,
  MoreHorizontal,
  PencilLine,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { MenuTreeNode } from '@/features/menus/types'

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        isActive
          ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
          : 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-400'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

// ─── System badge ─────────────────────────────────────────────────────────────

function SystemBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-purple-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-purple-700">
      <ShieldCheck size={8} />
      System
    </span>
  )
}

// ─── Action dropdown ──────────────────────────────────────────────────────────

function NodeActions({
  node,
  onEdit,
  onAddChild,
  onDelete,
  canUpdate,
  canCreate,
  canDelete,
}: {
  node: MenuTreeNode
  onEdit: (node: MenuTreeNode) => void
  onAddChild: (parentId: string) => void
  onDelete: (node: MenuTreeNode) => void
  canUpdate: boolean
  canCreate: boolean
  canDelete: boolean
}) {
  const canAct = canUpdate || canCreate || (canDelete && !node.isSystem)
  if (!canAct) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
          aria-label="Aksi menu"
        >
          <MoreHorizontal size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canUpdate && (
          <DropdownMenuItem onClick={() => onEdit(node)}>
            <PencilLine size={14} className="text-slate-500" />
            <span>Edit Menu</span>
          </DropdownMenuItem>
        )}
        {canCreate && (
          <DropdownMenuItem onClick={() => onAddChild(node.id)}>
            <Plus size={14} className="text-slate-500" />
            <span>Tambah Sub-menu</span>
          </DropdownMenuItem>
        )}
        {canDelete && !node.isSystem && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(node)}
              className="text-red-700 focus:bg-red-50 focus:text-red-800"
            >
              <Trash2 size={14} className="text-red-500" />
              <span>Hapus</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Single tree node ─────────────────────────────────────────────────────────

function TreeNode({
  node,
  level,
  expandedIds,
  onToggleExpand,
  onEdit,
  onAddChild,
  onDelete,
  canUpdate,
  canCreate,
  canDelete,
  filterText,
}: {
  node: MenuTreeNode
  level: number
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
  onEdit: (node: MenuTreeNode) => void
  onAddChild: (parentId: string) => void
  onDelete: (node: MenuTreeNode) => void
  canUpdate: boolean
  canCreate: boolean
  canDelete: boolean
  filterText: string
}) {
  const isExpanded = expandedIds.has(node.id)
  const hasChildren = node.children.length > 0
  const indent = level * 24

  // Filter check
  const matchesFilter = filterText.length === 0 ||
    node.name.toLowerCase().includes(filterText) ||
    node.code.toLowerCase().includes(filterText)

  // If has children, check if any descendant matches
  const hasMatchingDescendant = filterText.length > 0 && hasChildren && node.children.some((child) => {
    function matches(n: MenuTreeNode): boolean {
      return n.name.toLowerCase().includes(filterText) ||
        n.code.toLowerCase().includes(filterText) ||
        n.children.some(matches)
    }
    return matches(child)
  })

  if (!matchesFilter && !hasMatchingDescendant) return null

  return (
    <div>
      {/* Node row */}
      <div
        className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 ${
          !node.isActive ? 'opacity-60' : ''
        }`}
        style={{ paddingLeft: `${12 + indent}px` }}
      >
        {/* Expand/collapse toggle */}
        <button
          type="button"
          onClick={() => hasChildren && onToggleExpand(node.id)}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors ${
            hasChildren
              ? 'text-slate-500 hover:bg-slate-200/70'
              : 'text-transparent cursor-default'
          }`}
        >
          {hasChildren ? (
            <ChevronRight
              size={14}
              className={`transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
            />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          )}
        </button>

        {/* Icon */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          {hasChildren ? (
            isExpanded ? <FolderOpen size={15} /> : <FolderClosed size={15} />
          ) : node.path ? (
            <Globe size={15} />
          ) : (
            <FileText size={15} />
          )}
        </div>

        {/* Name + code + details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-ink">{node.name}</span>
            {node.isSystem && <SystemBadge />}
            {!node.isActive && (
              <span className="text-[10px] font-medium text-slate-400">(inactive)</span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-slate-500">
              {node.code}
            </span>
            {node.path && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                <Globe size={9} />
                {node.path}
              </span>
            )}
            {node.requiredPermissionCode && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                <Key size={9} />
                {node.requiredPermissionCode}
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        <StatusBadge isActive={node.isActive} />

        {/* Actions */}
        <NodeActions
          node={node}
          onEdit={onEdit}
          onAddChild={onAddChild}
          onDelete={onDelete}
          canUpdate={canUpdate}
          canCreate={canCreate}
          canDelete={canDelete}
        />
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Connecting line */}
          <div
            className="absolute bottom-0 top-0 w-px bg-slate-200"
            style={{ left: `${12 + indent + 18}px` }}
          />
          {node.children
            .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
            .map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onAddChild={onAddChild}
                onDelete={onDelete}
                canUpdate={canUpdate}
                canCreate={canCreate}
                canDelete={canDelete}
                filterText={filterText}
              />
            ))}
        </div>
      )}
    </div>
  )
}

// ─── Main MenuTree ────────────────────────────────────────────────────────────

export function MenuTree({
  items,
  expandedIds,
  onToggleExpand,
  onEdit,
  onAddChild,
  onDelete,
  canUpdate,
  canCreate,
  canDelete,
  filterText,
}: {
  items: MenuTreeNode[]
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
  onEdit: (node: MenuTreeNode) => void
  onAddChild: (parentId: string) => void
  onDelete: (node: MenuTreeNode) => void
  canUpdate: boolean
  canCreate: boolean
  canDelete: boolean
  filterText: string
}) {
  return (
    <Card className="overflow-hidden rounded-[24px] border border-slate-200/80 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-ink">Menu Tree</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Struktur hierarki menu sistem
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

      <CardContent className="p-2">
        <div className="space-y-0.5">
          {items
            .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
            .map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                level={0}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onAddChild={onAddChild}
                onDelete={onDelete}
                canUpdate={canUpdate}
                canCreate={canCreate}
                canDelete={canDelete}
                filterText={filterText}
              />
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
