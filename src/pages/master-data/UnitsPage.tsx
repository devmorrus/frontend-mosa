import { LoaderCircle, Ruler } from 'lucide-react'
import { unitOfMeasuresApi } from '@/api/unitOfMeasures.api'
import { Button } from '@/components/ui/button'
import { UnitStatusDialog } from '@/features/unit-of-measures/components/UnitStatusDialog'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataTableSkeleton,
} from '@/features/master-data/components/MasterDataStates'
import { useMasterDataModule } from '@/features/master-data/hooks/useMasterDataModule'
import { UnitFormDialog } from '@/features/unit-of-measures/components/UnitFormDialog'
import { UnitTable } from '@/features/unit-of-measures/components/UnitTable'
import { UnitToolbar } from '@/features/unit-of-measures/components/UnitToolbar'
import type {
  UnitOfMeasureDetail,
  UnitOfMeasureFormValues,
  UnitOfMeasureListItem,
} from '@/features/unit-of-measures/types'
import {
  emptyUnitOfMeasureFormValues,
  validateUnitOfMeasureForm,
} from '@/features/unit-of-measures/validation'

function toFormValues(detail: UnitOfMeasureDetail): UnitOfMeasureFormValues {
  return {
    code: detail.code,
    name: detail.name,
    symbol: detail.symbol ?? '',
    isActive: detail.isActive,
  }
}

export function UnitsPage() {
  const unitModule = useMasterDataModule<
    UnitOfMeasureListItem,
    UnitOfMeasureDetail,
    UnitOfMeasureFormValues
  >({
    api: unitOfMeasuresApi,
    permissions: {
      view: 'uoms.view',
      create: 'uoms.create',
      update: 'uoms.update',
    },
    emptyValues: emptyUnitOfMeasureFormValues,
    toFormValues,
    validate: validateUnitOfMeasureForm,
    entityName: 'Unit of Measure',
  })

  const activeOnPage = unitModule.items.filter((item) => item.isActive).length
  const inactiveOnPage = unitModule.items.length - activeOnPage

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[24px] border border-ink/10 bg-[linear-gradient(135deg,#062f75_0%,#0647a6_55%,#0b5ed7_100%)] px-5 py-5 text-paper shadow-[0_18px_50px_rgba(6,59,140,0.18)] sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-signal/25 blur-3xl" />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/80">
              <Ruler size={13} className="text-signal" />
              Master Data • Units
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold leading-snug text-paper sm:text-3xl">
              Unit of Measure yang seragam
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-paper/70">
              Kelola satuan ukuran agar integrasi ke material dan product tetap konsisten.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:w-[340px]">
            <div className="rounded-xl border border-paper/10 bg-paper/10 px-3 py-2.5 backdrop-blur-sm">
              <div className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/55">Total</div>
              <div className="mt-1 font-display text-2xl font-semibold leading-none text-paper">{unitModule.pagination.totalItems}</div>
              <div className="mt-1.5 truncate text-xs text-paper/60">Terdaftar</div>
            </div>
            <div className="rounded-xl border border-paper/10 bg-paper/10 px-3 py-2.5 backdrop-blur-sm" title="Active di halaman ini">
              <div className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/55">Active</div>
              <div className="mt-1 font-display text-2xl font-semibold leading-none text-emerald-200">{activeOnPage}</div>
              <div className="mt-1.5 truncate text-xs text-paper/60">Halaman ini</div>
            </div>
            <div className="rounded-xl border border-paper/10 bg-paper/10 px-3 py-2.5 backdrop-blur-sm" title="Inactive di halaman ini">
              <div className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/55">Inactive</div>
              <div className="mt-1 font-display text-2xl font-semibold leading-none text-paper/70">{inactiveOnPage}</div>
              <div className="mt-1.5 truncate text-xs text-paper/60">Halaman ini</div>
            </div>
          </div>
        </div>
      </section>

      <UnitToolbar
        query={unitModule.query}
        searchValue={unitModule.searchInput}
        onSearchValueChange={unitModule.setSearchInput}
        onStatusChange={unitModule.handleStatusChange}
        onPageSizeChange={unitModule.handlePageSizeChange}
        onResetFilters={() => {
          unitModule.setSearchInput('')
          unitModule.setQuery((current) => ({
            ...current,
            search: '',
            status: 'ALL',
            page: 1,
          }))
        }}
        onCreate={unitModule.openCreateDialog}
        canCreate={unitModule.canCreate}
      />

      {unitModule.isLoading ? (
        <MasterDataTableSkeleton rows={unitModule.query.pageSize} label="Daftar unit sedang dimuat" />
      ) : unitModule.error ? (
        <MasterDataErrorState description={unitModule.error} onRetry={unitModule.reload} />
      ) : unitModule.items.length === 0 ? (
        <MasterDataEmptyState
          title="Belum ada unit"
          description="Tambahkan unit pertama agar bisa dipakai lintas modul, atau reset filter saat ini."
          action={unitModule.canCreate ? <Button onClick={unitModule.openCreateDialog}>Tambah unit pertama</Button> : null}
        />
      ) : (
        <div className="relative space-y-3">
          {unitModule.isRefreshing && (
            <div className="pointer-events-none absolute -top-1 right-1 z-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
              <LoaderCircle size={13} className="animate-spin text-slate-400" />
              Menyegarkan data...
            </div>
          )}
          <UnitTable
            items={unitModule.items}
            pagination={unitModule.pagination}
            onPageChange={unitModule.handlePageChange}
            onEdit={unitModule.openEditDialog}
            onToggleStatus={unitModule.openStatusDialog}
            canUpdate={unitModule.canUpdate}
          />
        </div>
      )}

      <UnitFormDialog
        open={unitModule.isFormOpen}
        mode={unitModule.formMode}
        values={unitModule.formValues}
        errors={unitModule.formErrors}
        formError={unitModule.formError}
        isDetailLoading={unitModule.isDetailLoading}
        submitting={unitModule.isFormSubmitting}
        onValuesChange={unitModule.setFormValues}
        onOpenChange={unitModule.closeFormDialog}
        onSubmit={unitModule.submitForm}
      />

      <UnitStatusDialog
        open={Boolean(unitModule.statusTarget)}
        unitName={unitModule.statusTarget?.name ?? 'unit'}
        unitCode={unitModule.statusTarget?.code ?? ''}
        nextStatusLabel={unitModule.statusTarget?.isActive ? 'Inactive' : 'Active'}
        onOpenChange={unitModule.closeStatusDialog}
        onConfirm={unitModule.confirmStatusChange}
        submitting={unitModule.isStatusSubmitting}
      />
    </div>
  )
}
