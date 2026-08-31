import { LoaderCircle, Ruler } from 'lucide-react'
import { unitOfMeasuresApi } from '@/api/unitOfMeasures.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MasterDataStatusDialog } from '@/features/master-data/components/MasterDataStatusDialog'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataLoadingState,
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

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(12,28,26,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <Ruler size={14} className="text-signal" />
              Master Data Units
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Unit of Measure yang seragam
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              Kelola satuan ukuran dengan pola reusable yang sama, agar integrasi ke material dan
              product nanti tinggal melanjutkan fondasi ini.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">
                  Total Unit
                </div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper">
                  {unitModule.pagination.totalItems}
                </div>
                <p className="mt-1 text-sm text-paper/60">Semua unit tercatat</p>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Active</div>
                <div className="mt-2 font-display text-3xl font-semibold text-emerald-400">
                  {unitModule.items.filter((item) => item.isActive).length}
                </div>
                <p className="mt-1 text-sm text-paper/60">Siap dipakai lintas modul</p>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">
                  Inactive
                </div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper/45">
                  {unitModule.items.filter((item) => !item.isActive).length}
                </div>
                <p className="mt-1 text-sm text-paper/60">Perlu direview kembali</p>
              </CardContent>
            </Card>
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
        <MasterDataLoadingState description="Daftar unit sedang dimuat dari backend." />
      ) : unitModule.error ? (
        <MasterDataErrorState description={unitModule.error} onRetry={unitModule.reload} />
      ) : unitModule.items.length === 0 ? (
        <MasterDataEmptyState
          description="Belum ada unit yang cocok dengan filter saat ini."
          action={unitModule.canCreate ? <Button onClick={unitModule.openCreateDialog}>Tambah unit pertama</Button> : null}
        />
      ) : (
        <div className="relative space-y-3">
          {unitModule.isRefreshing && (
            <div className="absolute -top-2 right-0 z-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
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

      <MasterDataStatusDialog
        open={Boolean(unitModule.statusTarget)}
        entityLabel={unitModule.statusTarget?.name ?? 'unit'}
        nextStatusLabel={unitModule.statusTarget?.isActive ? 'Inactive' : 'Active'}
        onOpenChange={unitModule.closeStatusDialog}
        onConfirm={unitModule.confirmStatusChange}
        submitting={unitModule.isStatusSubmitting}
      />
    </div>
  )
}
