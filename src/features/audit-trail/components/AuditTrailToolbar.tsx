import { Search } from 'lucide-react'
import type { AuditFilterErrors, AuditListQuery } from '../types'

export function AuditTrailToolbar({
  query,
  searchValue,
  errors,
  userOptions,
  onSearchValueChange,
  onQueryChange,
}: {
  query: AuditListQuery
  searchValue: string
  errors: AuditFilterErrors
  userOptions: Array<{ value: string; label: string }>
  onSearchValueChange: (value: string) => void
  onQueryChange: (patch: Partial<AuditListQuery>) => void
}) {
  return (
    <div data-tour="audit-filter" className="grid gap-3 rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-sm md:grid-cols-2 xl:grid-cols-6">
        <div className="relative xl:col-span-2">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
            placeholder="Search"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-ink"
          />
      </div>
      <input data-tour="audit-date-filter" type="date" value={query.dateFrom} onChange={(e) => onQueryChange({ dateFrom: e.target.value, page: 1 })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-ink" />
      <input type="date" value={query.dateTo} onChange={(e) => onQueryChange({ dateTo: e.target.value, page: 1 })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-ink" />
      <select data-tour="audit-user-filter" value={query.userId} onChange={(e) => onQueryChange({ userId: e.target.value, page: 1 })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-ink">
        <option value="">Semua user</option>
        {userOptions.map((user) => <option key={user.value} value={user.value}>{user.label}</option>)}
      </select>
      <input data-tour="audit-action-filter" value={query.action} onChange={(e) => onQueryChange({ action: e.target.value, page: 1 })} placeholder="Action" className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-ink" />
      <input value={query.entityType} onChange={(e) => onQueryChange({ entityType: e.target.value, page: 1 })} placeholder="Entity Type" className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-ink" />
      {errors.dateFrom || errors.dateTo || errors.search || errors.userId || errors.action || errors.entityType ? (
        <div className="xl:col-span-6 text-sm text-red-600">
          {errors.dateFrom ?? errors.dateTo ?? errors.search ?? errors.userId ?? errors.action ?? errors.entityType}
        </div>
      ) : null}
    </div>
  )
}
