import { Badge } from '@/components/ui/badge'
import { ProductionDeviationStatus, type ProductionDeviationStatus as Status } from '@/features/production-deviations/types'

const labels: Record<Status, string> = { [ProductionDeviationStatus.PendingApproval]: 'Pending', [ProductionDeviationStatus.Approved]: 'Approved', [ProductionDeviationStatus.Rejected]: 'Rejected', [ProductionDeviationStatus.Cancelled]: 'Cancelled' }
const styles: Record<Status, string> = { [ProductionDeviationStatus.PendingApproval]: 'border-amber-300 bg-amber-100 text-amber-800', [ProductionDeviationStatus.Approved]: 'border-emerald-300 bg-emerald-100 text-emerald-800', [ProductionDeviationStatus.Rejected]: 'border-rose-300 bg-rose-100 text-rose-800', [ProductionDeviationStatus.Cancelled]: 'border-slate-300 bg-slate-100 text-slate-700' }

export function DeviationStatusBadge({ status }: { status: Status }) { return <Badge variant="default" className={styles[status]}>{labels[status]}</Badge> }
