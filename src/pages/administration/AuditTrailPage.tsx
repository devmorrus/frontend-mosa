import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, ShieldEllipsis, LoaderCircle, RefreshCcw, Search } from 'lucide-react'
import { apiClient } from '@/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MasterDataEmptyState, MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import type { MasterDataPagination as PaginationState } from '@/features/master-data/types'

interface AuditListItem {
  id: string
  occurredAtUtc: string
  userId: string | null
  username: string | null
  userFullName: string | null
  action: string
  category: string
  entityType: string
  entityId: string | null
  reference: string | null
  ipAddress: string | null
  hasChanges: boolean
  createdAtUtc: string
}

interface AuditListResponse {
  items: AuditListItem[]
  pagination: PaginationState
}

interface AuditFilters {
  search: string
  action: string
  category: string
  entityType: string
  page: number
  pageSize: number
}

const DEFAULT_FILTERS: AuditFilters = {
  search: '',
  action: '',
  category: '',
  entityType: '',
  page: 1,
  pageSize: 10,
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function AuditTrailPage() {
  const [filters, setFilters] = useState<AuditFilters>(DEFAULT_FILTERS)
  const [searchInput, setSearchInput] = useState(DEFAULT_FILTERS.search)
  const [items, setItems] = useState<AuditListItem[]>([])
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  const queryKey = useMemo(() => JSON.stringify(filters), [filters])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setFilters((current) => (current.search === searchInput.trim() ? current : { ...current, search: searchInput.trim(), page: 1 }))
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  useEffect(() => {
    let isMounted = true

    async function load(background = false) {
      if (background) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      try {
        const response = await apiClient.get<AuditListResponse>('/admin/audit-logs', {
          params: {
            search: filters.search || undefined,
            action: filters.action || undefined,
            category: filters.category || undefined,
            entityType: filters.entityType || undefined,
            page: filters.page,
            pageSize: filters.pageSize,
          },
        })

        if (!isMounted) return
        setItems(response.data.items)
        setPagination(response.data.pagination)
      } catch (caughtError) {
        if (!isMounted) return
        const apiError = caughtError as { message?: string }
        setError(apiError.message ?? 'Gagal memuat audit trail.')
      } finally {
        if (!isMounted) return
        setLoading(false)
        setRefreshing(false)
      }
    }

    void load(items.length > 0)

    return () => {
      isMounted = false
    }
  }, [queryKey, reloadToken])

  if (loading) {
    return <MasterDataLoadingState title="Memuat audit trail" description="Mengambil data audit dari backend..." />
  }

  if (error) {
    return <MasterDataErrorState description={error} onRetry={() => setReloadToken((current) => current + 1)} />
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(12,28,26,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
            <ShieldEllipsis size={14} className="text-signal" />
            Audit Trail
          </div>
          <h1 className="font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
            Riwayat aktivitas sistem
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-paper/68 sm:text-base">
            Pantau aksi administratif dan perubahan data penting secara server-side dengan filter, pencarian, dan pagination.
          </p>
        </div>
      </section>

      <Card>
        <CardContent className="grid gap-3 p-5 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input className="pl-10" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Cari user, aksi, entity, atau referensi" />
          </div>
          <Input value={filters.action} onChange={(event) => setFilters((current) => ({ ...current, action: event.target.value, page: 1 }))} placeholder="Action" />
          <Input value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value, page: 1 }))} placeholder="Category" />
          <Input value={filters.entityType} onChange={(event) => setFilters((current) => ({ ...current, entityType: event.target.value, page: 1 }))} placeholder="Entity type" />
          <Input type="number" min={1} value={filters.pageSize} onChange={(event) => setFilters((current) => ({ ...current, pageSize: Number(event.target.value) || 10, page: 1 }))} />
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <MasterDataEmptyState description="Belum ada log audit yang cocok dengan filter ini." />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Audit log</CardTitle>
                <CardDescription>Menampilkan {pagination.totalItems} aktivitas terakhir dari backend.</CardDescription>
              </div>
              {refreshing ? <LoaderCircle className="animate-spin text-slate-400" size={18} /> : null}
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Waktu</th>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">Entity</th>
                    <th className="px-5 py-3">Referensi</th>
                      <th className="px-5 py-3">IP</th>
                      <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-slate-100 align-top">
                      <td className="px-5 py-4 text-slate-600">{formatDateTime(item.occurredAtUtc)}</td>
                      <td className="px-5 py-4 font-medium text-ink">
                        <div>{item.userFullName ?? item.username ?? '-'}</div>
                        <div className="mt-1 text-xs text-slate-500">{item.userId ?? '-'}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-ink">{item.action}</div>
                        <div className="mt-1 text-xs text-slate-500">{item.category}{item.hasChanges ? ' • changed' : ''}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-ink">{item.entityType}</div>
                        <div className="mt-1 text-xs text-slate-500">{item.entityId ?? '-'}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{item.reference ?? '-'}</td>
                      <td className="px-5 py-4 text-slate-600">{item.ipAddress ?? '-'}</td>
                      <td className="px-5 py-4 text-right">
                        <Button asChild size="sm" variant="secondary">
                          <Link to={`/admin/audit-trail/${item.id}`}>
                            <Eye size={15} />
                            Detail
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <MasterDataPagination pagination={pagination} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-end">
        <Button variant="secondary" onClick={() => setReloadToken((current) => current + 1)}>
          <RefreshCcw size={16} />
          Muat ulang
        </Button>
      </div>
    </div>
  )
}
