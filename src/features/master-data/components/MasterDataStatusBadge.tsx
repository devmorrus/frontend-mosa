import { Badge } from '@/components/ui/badge'

export function MasterDataStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      className={
        isActive
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 bg-slate-100 text-slate-600'
      }
    >
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  )
}
