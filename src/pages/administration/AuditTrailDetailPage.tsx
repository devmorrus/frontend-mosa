import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ShieldEllipsis } from 'lucide-react'
import { apiClient } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'

interface AuditUser {
  id: string | null
  username: string | null
  fullName: string | null
}

interface AuditEntity {
  entityType: string
  entityId: string | null
  reference: string | null
}

interface AuditDetail {
  id: string
  occurredAtUtc: string
  user: AuditUser
  action: string
  category: string
  entity: AuditEntity
  ipAddress: string | null
  oldValues: unknown | null
  newValues: unknown | null
  createdAtUtc: string
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatJson(value: unknown) {
  if (value === null || value === undefined) return '-'
  if (typeof value !== 'object') return String(value)
  return JSON.stringify(value, null, 2)
}

export function AuditTrailDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<AuditDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!id) return

      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.get<AuditDetail>(`/admin/audit-logs/${id}`)
        setDetail(response.data)
      } catch (caughtError) {
        const apiError = caughtError as { message?: string }
        setError(apiError.message ?? 'Gagal memuat detail audit log.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id])

  if (loading) {
    return <MasterDataLoadingState title="Memuat detail audit" description="Mengambil detail aktivitas dari backend..." />
  }

  if (error || !detail) {
    return <MasterDataErrorState description={error ?? 'Audit log tidak ditemukan.'} onRetry={() => navigate('/admin/audit-trail')} />
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="secondary">
        <Link to="/admin/audit-trail">
          <ArrowLeft size={16} />
          Kembali ke audit trail
        </Link>
      </Button>

      <section className="relative overflow-hidden rounded-[30px] bg-ink px-6 py-7 text-paper sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
            <ShieldEllipsis size={14} className="text-signal" />
            Audit Detail
          </div>
          <h1 className="font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
            {detail.action}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-paper/68 sm:text-base">
            {detail.category} pada {detail.entity.entityType}
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi utama</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Info label="Occurred At" value={formatDateTime(detail.occurredAtUtc)} />
            <Info label="Created At" value={formatDateTime(detail.createdAtUtc)} />
            <Info label="User" value={detail.user.fullName ?? detail.user.username ?? '-'} />
            <Info label="User ID" value={detail.user.id ?? '-'} />
            <Info label="Action" value={detail.action} />
            <Info label="Category" value={detail.category} />
            <Info label="IP Address" value={detail.ipAddress ?? '-'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Info label="Entity Type" value={detail.entity.entityType} />
            <Info label="Entity ID" value={detail.entity.entityId ?? '-'} />
            <Info label="Reference" value={detail.entity.reference ?? '-'} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <JsonPanel title="Old Values" value={detail.oldValues} />
        <JsonPanel title="New Values" value={detail.newValues} />
      </div>
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

function JsonPanel({ title, value }: { title: string; value: unknown }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">{formatJson(value)}</pre>
      </CardContent>
    </Card>
  )
}
