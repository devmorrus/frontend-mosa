import { Link } from 'react-router-dom'
import { ExternalLink, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AuditListItem } from '../types'
import { formatDateTime } from '../utils'
import { entityLinks, getAuditEntityLink } from '@/routes/canonicalRoutes'

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
              <td className="px-5 py-4 text-slate-600">
                {(() => {
                  const link = getAuditEntityLink(item.entityType, item.entityId)
                  const label = `${item.entityId ?? '-'}${item.reference ? ` / ${item.reference}` : ''}`
                  return link ? (
                    <Link to={link} className="font-medium text-ink underline underline-offset-4" title="Buka entity terkait">
                      {label}
                    </Link>
                  ) : (
                    label
                  )
                })()}
              </td>
              <td className="px-5 py-4 text-slate-600">{item.ipAddress ?? '-'}</td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link data-tour="audit-detail" to={entityLinks.auditDetail(item.id)}>
                      <Eye size={15} /> Detail
                    </Link>
                  </Button>
                  {(() => {
                    const link = getAuditEntityLink(item.entityType, item.entityId)
                    return link ? (
                      <Button asChild size="sm" variant="secondary">
                        <Link to={link} title="Buka entity terkait">
                          <ExternalLink size={15} /> Entity
                        </Link>
                      </Button>
                    ) : null
                  })()}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
