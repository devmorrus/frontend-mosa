import { Badge } from '@/components/ui/badge'
import {
  ProductionOrderStatus,
  type ProductionOrderStatus as ProductionOrderStatusType,
} from '@/features/production-orders/types'
import { getProductionOrderStatusLabel } from '@/features/production-orders/validation'

const STATUS_CLASSNAME: Record<ProductionOrderStatusType, string> = {
  [ProductionOrderStatus.Draft]: 'border-slate-300 bg-slate-100 text-slate-700',
  [ProductionOrderStatus.MaterialShortage]: 'border-rose-300 bg-rose-100 text-rose-800',
  [ProductionOrderStatus.Ready]: 'border-blue-300 bg-blue-100 text-blue-800',
  [ProductionOrderStatus.Scheduled]: 'border-sky-300 bg-sky-100 text-sky-800',
  [ProductionOrderStatus.Released]: 'border-violet-300 bg-violet-100 text-violet-800',
  [ProductionOrderStatus.InProgress]: 'border-amber-300 bg-amber-100 text-amber-800',
  [ProductionOrderStatus.WaitingQc]: 'border-orange-300 bg-orange-100 text-orange-800',
  [ProductionOrderStatus.Completed]: 'border-blue-300 bg-blue-100 text-blue-800',
  [ProductionOrderStatus.Cancelled]: 'border-stone-300 bg-stone-100 text-stone-700',
}

export function ProductionOrderStatusBadge({
  status,
}: {
  status: ProductionOrderStatusType
}) {
  return (
    <Badge variant="default" className={STATUS_CLASSNAME[status]}>
      {getProductionOrderStatusLabel(status)}
    </Badge>
  )
}
