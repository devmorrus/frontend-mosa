import { StatusBadge } from '@/components/common/StatusBadge'

/** Canonical wrapper — label/warna mengikuti StatusBadge pusat (Tasking 4). */
export function DeviationStatusBadge({ status }: { status: string | number }) {
  return <StatusBadge domain="deviation" value={status} />
}
