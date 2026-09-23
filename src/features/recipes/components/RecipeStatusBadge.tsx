import { Badge } from '@/components/ui/badge'
import { RecipeLifecycleStatus } from '@/features/recipes/types'
import { getRecipeStatusLabel } from '@/features/recipes/utils'

const STATUS_CLASSNAME: Record<RecipeLifecycleStatus, string> = {
  [RecipeLifecycleStatus.Draft]: 'border-slate-300 bg-slate-100 text-slate-700',
  [RecipeLifecycleStatus.PendingApproval]: 'border-amber-300 bg-amber-100 text-amber-800',
  [RecipeLifecycleStatus.Approved]: 'border-emerald-300 bg-emerald-100 text-emerald-800',
  [RecipeLifecycleStatus.NeedsRevision]: 'border-rose-300 bg-rose-100 text-rose-800',
  [RecipeLifecycleStatus.Historical]: 'border-stone-300 bg-stone-100 text-stone-700',
}

export function RecipeStatusBadge({ status }: { status: RecipeLifecycleStatus }) {
  return (
    <Badge variant="default" className={STATUS_CLASSNAME[status]}>
      {getRecipeStatusLabel(status)}
    </Badge>
  )
}
