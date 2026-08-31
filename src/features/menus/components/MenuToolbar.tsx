import { Plus, Eye, EyeOff, Expand, Shrink } from 'lucide-react'

export function MenuToolbar({
  onExpandAll,
  onCollapseAll,
  includeInactive,
  onIncludeInactiveChange,
  createLabel,
  onCreate,
  canCreate,
}: {
  onExpandAll: () => void
  onCollapseAll: () => void
  includeInactive: boolean
  onIncludeInactiveChange: (v: boolean) => void
  createLabel: string
  onCreate: () => void
  canCreate: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Include inactive toggle */}
      <button
        type="button"
        onClick={() => onIncludeInactiveChange(!includeInactive)}
        className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all duration-150 ${
          includeInactive
            ? 'border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50'
            : 'border-ink/15 bg-ink/5 text-ink hover:bg-ink/8'
        }`}
      >
        {includeInactive ? <Eye size={15} /> : <EyeOff size={15} />}
        {includeInactive ? 'Menampilkan semua' : 'Hanya active'}
      </button>

      {/* Expand/Collapse all */}
      <div className="flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={onExpandAll}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Expand size={14} />
          <span className="hidden sm:inline">Expand All</span>
        </button>
        <button
          type="button"
          onClick={onCollapseAll}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Shrink size={14} />
          <span className="hidden sm:inline">Collapse All</span>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Add menu */}
      {canCreate && (
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-2xl bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-md shadow-ink/20 transition-all duration-150 hover:bg-ink-light active:scale-[0.98]"
        >
          <Plus size={15} />
          {createLabel}
        </button>
      )}
    </div>
  )
}
