import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AuditListItem } from '../types'
import { formatDateTime } from '../utils'

export function AuditTrailTable({ items }: { items: AuditListItem[] }) {
  return (
    <div className="overflow-x-auto rounded-[24px] border border-slate-200/80 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Timestamp</th>
            <th className="px-5 py-3">User</th>
            <th className="px-5 py-3">Action</th>
            <th className="px-5 py-3">Module/Entity</th>
            <th className="px-5 py-3">Entity ID/Reference</th>
            <th className="px-5 py-3">IP</th>
            <th className="px-5 py-3">Action Detail</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-slate-100 align-top">
              <td className="px-5 py-4 text-slate-600">{formatDateTime(item.occurredAtUtc)}</td>
              <td className="px-5 py-4 font-medium text-ink">{item.userFullName ?? item.username ?? '-'}</td>
              <td className="px-5 py-4">{item.action}</td>
              <td className="px-5 py-4">{item.category} / {item.entityType}</td>
              <td className="px-5 py-4 text-slate-600">{item.entityId ?? '-'}{item.reference ? ` / ${item.reference}` : ''}</td>
              <td className="px-5 py-4 text-slate-600">{item.ipAddress ?? '-'}</td>
              <td className="px-5 py-4">
                <Button asChild size="sm" variant="secondary">
                  <Link data-tour="audit-detail" to={`/admin/audit-trail/${item.id}`}>
                    <Eye size={15} /> Detail
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
