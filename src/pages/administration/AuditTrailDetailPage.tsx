import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, ShieldEllipsis } from 'lucide-react'
import { auditApi } from '@/api/audit.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { AuditChangeViewer } from '@/features/audit-trail/components/AuditChangeViewer'
import { formatDateTime, formatReadable } from '@/features/audit-trail/utils'
import type { AuditDetailResponse } from '@/features/audit-trail/types'
import { breadcrumbs, getAuditEntityLink } from '@/routes/canonicalRoutes'

export function AuditTrailDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<AuditDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        setDetail(await auditApi.getById(id))
      } catch (caughtError) {
        const apiError = caughtError as { message?: string }
        setError(apiError.message ?? 'Gagal memuat detail audit trail.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id])

  if (loading) return <MasterDataLoadingState title="Memuat detail audit" description="Mengambil detail aktivitas dari backend..." />
  if (error || !detail) return <MasterDataErrorState description={error ?? 'Audit log tidak ditemukan.'} onRetry={() => navigate('/admin/audit-trail')} />

  const entityLink = getAuditEntityLink(detail.entity.entityType, detail.entity.entityId)

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs.auditDetail(detail.action)} />
      <Button asChild variant="secondary">
        <Link to="/admin/audit-trail"><ArrowLeft size={16} /> Kembali ke audit trail</Link>
      </Button>

      <section className="relative overflow-hidden rounded-[30px] bg-ink px-6 py-7 text-paper sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
            <ShieldEllipsis size={14} className="text-signal" /> Audit Detail
          </div>
          <h1 className="font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">{detail.action}</h1>
          <p className="max-w-2xl text-sm leading-7 text-paper/68 sm:text-base">{detail.category} / {detail.entity.entityType}</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Actor</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Info label="User" value={detail.user.fullName ?? detail.user.username ?? '-'} />
            <Info label="User ID" value={detail.user.id ?? '-'} />
            <Info label="Timestamp" value={formatDateTime(detail.occurredAtUtc)} />
            <Info label="IP" value={detail.ipAddress ?? '-'} />
            <Info label="Action" value={detail.action} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Entity</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Info label="Entity" value={detail.entity.entityType} />
            <Info label="Entity ID" value={detail.entity.entityId ?? '-'} />
            <Info label="Reference" value={detail.entity.reference ?? '-'} />
            <Info label="Created At" value={formatDateTime(detail.createdAtUtc)} />
            {entityLink ? (
              <Button asChild variant="secondary" data-tour="audit-entity-link">
                <Link to={entityLink}>
                  <ExternalLink size={16} /> Buka entity terkait ({detail.entity.reference ?? detail.entity.entityType})
                </Link>
              </Button>
            ) : (
              <p className="text-xs text-slate-500">
                Tidak ada link aman untuk entity ini (reference disembunyikan backend).
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div data-tour="audit-detail" className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Before</CardTitle></CardHeader>
          <CardContent><pre className="max-h-[26rem] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">{formatReadable(detail.oldValues)}</pre></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>After</CardTitle></CardHeader>
          <CardContent><pre className="max-h-[26rem] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">{formatReadable(detail.newValues)}</pre></CardContent>
        </Card>
      </div>

      <AuditChangeViewer oldValues={detail.oldValues} newValues={detail.newValues} />
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 font-medium text-ink">{value}</div>
    </div>
  )
}
