import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { flattenObject, formatReadable, isSensitiveKey, maskValue } from '../utils'

interface ChangeRow {
  key: string
  before: unknown
  after: unknown
  status: 'added' | 'removed' | 'changed' | 'same'
}

function buildRows(oldValues: Record<string, unknown> | null, newValues: Record<string, unknown> | null): ChangeRow[] {
  const oldFlat = flattenObject(maskValue(oldValues ?? {}))
  const newFlat = flattenObject(maskValue(newValues ?? {}))
  const keys = Array.from(new Set([...Object.keys(oldFlat), ...Object.keys(newFlat)])).sort()

  return keys.map((key) => {
    const before = oldFlat[key]
    const after = newFlat[key]
    if (before === undefined && after !== undefined) return { key, before: '-', after, status: 'added' }
    if (before !== undefined && after === undefined) return { key, before, after: '-', status: 'removed' }
    if (JSON.stringify(before) !== JSON.stringify(after)) return { key, before, after, status: 'changed' }
    return { key, before, after, status: 'same' }
  })
}

export function AuditChangeViewer({ oldValues, newValues }: { oldValues: Record<string, unknown> | null; newValues: Record<string, unknown> | null }) {
  const rows = buildRows(oldValues, newValues).filter((row) => row.status !== 'same')

  return (
    <Card data-tour="audit-change">
      <CardHeader>
        <CardTitle>Changes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {rows.length === 0 ? (
          <p className="text-slate-500">Tidak ada perubahan yang bisa ditampilkan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Field</th>
                  <th className="py-2 pr-4">Before</th>
                  <th className="py-2 pr-4">After</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-t border-slate-100 align-top">
                    <td className="py-3 pr-4 font-medium text-ink">{row.key}{isSensitiveKey(row.key) ? ' (masked)' : ''}</td>
                    <td className="py-3 pr-4 text-slate-600"><pre className="whitespace-pre-wrap">{formatReadable(row.before)}</pre></td>
                    <td className="py-3 pr-4 text-slate-600"><pre className="whitespace-pre-wrap">{formatReadable(row.after)}</pre></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
