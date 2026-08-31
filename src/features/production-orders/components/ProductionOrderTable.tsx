import { Link } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import { ProductionOrderStatusBadge } from '@/features/production-orders/components/ProductionOrderStatusBadge'
import type { ProductionOrderListItem } from '@/features/production-orders/types'
import { formatDateLabel } from '@/features/production-orders/validation'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'

interface ProductionOrderTableProps {
  items: ProductionOrderListItem[]
  pagination: PaginationMeta
  isRefreshing: boolean
  onPageChange: (page: number) => void
  canUpdate: boolean
}

export function ProductionOrderTable({
  items,
  pagination,
  isRefreshing,
  onPageChange,
  canUpdate,
}: ProductionOrderTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle>Production Order List</CardTitle>
          <p className="mt-2 text-sm text-slate-500">
            {pagination.totalItems} production order terdaftar pada sistem.
          </p>
        </div>
        {isRefreshing ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
            <LoaderCircle size={14} className="animate-spin" />
            Menyegarkan data...
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/80 text-left">
                {[
                  'PO Number',
                  'Product',
                  'Recipe',
                  'Target',
                  'Warehouse',
                  'Schedule',
                  'Operator',
                  'Status',
                  'Action',
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isDraft = item.status === 1
                const isMaterialShortage = item.status === 2
                const canEdit = (isDraft || isMaterialShortage) && canUpdate

                return (
                  <tr key={item.id} className="border-b border-slate-200/70 bg-white">
                    <td className="px-6 py-4 text-sm font-semibold text-ink">
                      {item.productionOrderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.recipeVersion.recipeName} v{item.recipeVersion.versionNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.targetOutput} {item.unitOfMeasure.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.warehouse.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDateLabel(item.scheduledDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.assignedOperator?.fullName ?? '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <ProductionOrderStatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button asChild variant="secondary" size="sm">
                        <Link to={`/production/orders/${item.id}`}>
                          {canEdit ? 'Edit Draft' : 'View Detail'}
                        </Link>
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <MasterDataPagination pagination={pagination} onPageChange={onPageChange} />
      </CardContent>
    </Card>
  )
}
