import { MoreHorizontal, PencilLine, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import type { ColumnDefinition, MasterDataPagination as PaginationMeta } from '@/features/master-data/types'

export function MasterDataTable<T>({
  title,
  itemLabel,
  items,
  columns,
  pagination,
  onPageChange,
  onEdit,
  onToggleStatus,
  canUpdate,
  getRowKey,
}: {
  title: string
  itemLabel: string
  items: T[]
  columns: ColumnDefinition<T>[]
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  onEdit: (item: T) => void
  onToggleStatus: (item: T) => void
  canUpdate: boolean
  getRowKey: (item: T) => string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-2 text-sm text-slate-500">
            {pagination.totalItems} {itemLabel} terdaftar pada sistem.
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 sm:inline-flex">
          <MoreHorizontal size={14} />
          Reusable table
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="border-y border-slate-200/80 bg-slate-50/80 text-left">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 ${column.className ?? ''}`}
                  >
                    {column.header}
                  </th>
                ))}
                {canUpdate && (
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={getRowKey(item)} className="border-b border-slate-200/70 bg-white">
                  {columns.map((column) => (
                    <td key={column.key} className={`px-6 py-4 align-top text-sm text-slate-600 ${column.className ?? ''}`}>
                      {column.render(item)}
                    </td>
                  ))}
                  {canUpdate && (
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => onEdit(item)}>
                          <PencilLine size={15} />
                          Edit
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => onToggleStatus(item)}>
                          <RotateCcw size={15} />
                          Ubah status
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <MasterDataPagination pagination={pagination} onPageChange={onPageChange} />
      </CardContent>
    </Card>
  )
}
