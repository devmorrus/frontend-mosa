import { useEffect, useMemo, useState } from 'react'
import { LoaderCircle, RefreshCcw, ShieldEllipsis } from 'lucide-react'
import { usersApi } from '@/api/users.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MasterDataEmptyState, MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import type { MasterDataPagination as PaginationState } from '@/features/master-data/types'
import { validateAuditFilters } from '@/features/audit-trail/validation'
import type { AuditFilterErrors, AuditListQuery } from '@/features/audit-trail/types'
import { auditApi } from '@/api/audit.api'
import { AuditTrailToolbar } from '@/features/audit-trail/components/AuditTrailToolbar'
import { AuditTrailTable } from '@/features/audit-trail/components/AuditTrailTable'

const DEFAULT_QUERY: AuditListQuery = {
  search: '',
  userId: '',
  action: '',
  entityType: '',
  dateFrom: '',
  dateTo: '',
  page: 1,
  pageSize: 10,
}

export function AuditTrailPage() {
  const [query, setQuery] = useState<AuditListQuery>(DEFAULT_QUERY)
  const [searchInput, setSearchInput] = useState(DEFAULT_QUERY.search)
  const [items, setItems] = useState<Awaited<ReturnType<typeof auditApi.list>>['items']>([])
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, totalItems: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<Array<{ value: string; label: string }>>([])
  const [filterErrors, setFilterErrors] = useState<AuditFilterErrors>({})

  const querySignature = useMemo(() => JSON.stringify(query), [query])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setQuery((current) => (current.search === searchInput.trim() ? current : { ...current, search: searchInput.trim(), page: 1 }))
    }, 350)
    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  useEffect(() => {
    void usersApi.list({ search: '', roleId: '', status: 'ALL', page: 1, pageSize: 50 }).then((result) => {
      setUsers(result.items.map((user) => ({ value: user.id, label: `${user.fullName} (${user.username})` })))
    }).catch(() => setUsers([]))
  }, [])

  useEffect(() => {
    let mounted = true
    async function load(background = false) {
      const nextErrors = validateAuditFilters(query)
      setFilterErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) {
        setLoading(false)
        setRefreshing(false)
        setError('Filter audit trail tidak valid.')
        return
      }

      if (background) setRefreshing(true)
      else setLoading(true)
      setError(null)

      try {
        const result = await auditApi.list(query)
        if (!mounted) return
        setItems(result.items)
        setPagination(result.pagination)
      } catch (caughtError) {
        if (!mounted) return
        const apiError = caughtError as { message?: string }
        setError(apiError.message ?? 'Gagal memuat audit trail.')
      } finally {
        if (!mounted) return
        setLoading(false)
        setRefreshing(false)
      }
    }

    void load(items.length > 0)
    return () => { mounted = false }
  }, [querySignature])

  function updateQuery(patch: Partial<AuditListQuery>) {
    setQuery((current) => ({ ...current, ...patch }))
  }

  if (loading) return <MasterDataLoadingState title="Memuat audit trail" description="Mengambil aktivitas dari backend..." />
  if (error) return <MasterDataErrorState description={error} onRetry={() => setQuery((current) => ({ ...current }))} />

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(12,28,26,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-3">
          <div data-tour="audit-menu" className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
            <ShieldEllipsis size={14} className="text-signal" /> Audit Trail
          </div>
          <h1 className="font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">Riwayat aktivitas sistem</h1>
          <p className="max-w-2xl text-sm leading-7 text-paper/68 sm:text-base">Audit Trail bersifat read-only untuk review dan troubleshooting.</p>
        </div>
      </section>

      <AuditTrailToolbar
        query={query}
        searchValue={searchInput}
        errors={filterErrors}
        userOptions={users}
        onSearchValueChange={setSearchInput}
        onQueryChange={updateQuery}
      />

      {items.length === 0 ? (
        <MasterDataEmptyState description="Belum ada log audit yang cocok dengan filter ini." />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Audit log</CardTitle>
                <CardDescription>Menampilkan {pagination.totalItems} aktivitas dari backend.</CardDescription>
              </div>
              {refreshing ? <LoaderCircle className="animate-spin text-slate-400" size={18} /> : null}
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <AuditTrailTable items={items} />
            <MasterDataPagination pagination={pagination} onPageChange={(page) => updateQuery({ page })} />
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-end">
        <Button variant="secondary" onClick={() => setQuery((current) => ({ ...current }))}>
          <RefreshCcw size={16} /> Muat ulang
        </Button>
      </div>
    </div>
  )
}
