import { useEffect, useState } from 'react'
import { Boxes, LoaderCircle } from 'lucide-react'
import { rawMaterialsApi } from '@/api/rawMaterials.api'
import { unitOfMeasuresApi } from '@/api/unitOfMeasures.api'
import { Button } from '@/components/ui/button'
import { RawMaterialStatusDialog } from '@/features/raw-materials/components/RawMaterialStatusDialog'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataTableSkeleton,
} from '@/features/master-data/components/MasterDataStates'
import { useMasterDataModule } from '@/features/master-data/hooks/useMasterDataModule'
import { RawMaterialFormDialog } from '@/features/raw-materials/components/RawMaterialFormDialog'
import { RawMaterialTable } from '@/features/raw-materials/components/RawMaterialTable'
import { RawMaterialToolbar } from '@/features/raw-materials/components/RawMaterialToolbar'
import type {
  RawMaterialDetail,
  RawMaterialFormValues,
  RawMaterialListItem,
  RawMaterialQueryState,
} from '@/features/raw-materials/types'
import {
  emptyRawMaterialFormValues,
  validateRawMaterialForm,
} from '@/features/raw-materials/validation'
import type { UnitOfMeasureOption } from '@/features/unit-of-measures/types'
import type { ApiError } from '@/types/api'

const DEFAULT_QUERY: RawMaterialQueryState = {
  search: '',
  status: 'ALL',
  category: '',
  unitOfMeasureId: '',
  hasExpiry: 'ALL',
  page: 1,
  pageSize: 10,
}

function toFormValues(detail: RawMaterialDetail): RawMaterialFormValues {
  return {
    code: detail.code,
    name: detail.name,
    category: detail.category ?? '',
    unitOfMeasureId: detail.unitOfMeasure.id,
    hasExpiry: detail.hasExpiry,
    shelfLifeDays: detail.shelfLifeDays?.toString() ?? '',
    minimumStock: detail.minimumStock.toString(),
    isActive: detail.isActive,
  }
}

function mergeCurrentUnit(
  options: UnitOfMeasureOption[],
  currentUnit: UnitOfMeasureOption | null,
) {
  if (!currentUnit) {
    return options
  }

  return options.some((option) => option.id === currentUnit.id)
    ? options
    : [...options, currentUnit]
}

export function RawMaterialsPage() {
  const [uomOptions, setUomOptions] = useState<UnitOfMeasureOption[]>([])
  const [isUomLoading, setIsUomLoading] = useState(true)
  const [uomError, setUomError] = useState<string | null>(null)
  const [formUnitOverride, setFormUnitOverride] = useState<UnitOfMeasureOption | null>(null)
  const rawMaterialModule = useMasterDataModule<
    RawMaterialListItem,
    RawMaterialDetail,
    RawMaterialFormValues,
    RawMaterialQueryState
  >({
    api: rawMaterialsApi,
    permissions: {
      view: 'materials.view',
      create: 'materials.create',
      update: 'materials.update',
    },
    emptyValues: emptyRawMaterialFormValues,
    toFormValues,
    validate: validateRawMaterialForm,
    entityName: 'Raw Material',
    initialQuery: DEFAULT_QUERY,
  })

  useEffect(() => {
    async function loadUnitOptions() {
      setIsUomLoading(true)
      setUomError(null)

      try {
        const items = await unitOfMeasuresApi.listActiveOptions()
        setUomOptions(items)
      } catch (caughtError) {
        const apiError = caughtError as ApiError
        setUomError(apiError.message)
      } finally {
        setIsUomLoading(false)
      }
    }

    void loadUnitOptions()
  }, [])

  useEffect(() => {
    async function loadCurrentUnitOverride() {
      if (
        !rawMaterialModule.isFormOpen ||
        !rawMaterialModule.formValues.unitOfMeasureId ||
        uomOptions.some((option) => option.id === rawMaterialModule.formValues.unitOfMeasureId)
      ) {
        setFormUnitOverride(null)
        return
      }

      try {
        const detail = await unitOfMeasuresApi.getById(rawMaterialModule.formValues.unitOfMeasureId)
        setFormUnitOverride({
          id: detail.id,
          code: detail.code,
          name: detail.name,
          symbol: detail.symbol,
        })
      } catch {
        setFormUnitOverride(null)
      }
    }

    void loadCurrentUnitOverride()
  }, [rawMaterialModule.formValues.unitOfMeasureId, rawMaterialModule.isFormOpen, uomOptions])

  const formUnitOptions = mergeCurrentUnit(uomOptions, formUnitOverride)
  const currentFormUnit =
    formUnitOptions.find((option) => option.id === rawMaterialModule.formValues.unitOfMeasureId) ??
    formUnitOverride

  const activeOnPage = rawMaterialModule.items.filter((item) => item.isActive).length
  const inactiveOnPage = rawMaterialModule.items.length - activeOnPage

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[24px] border border-ink/10 bg-[linear-gradient(135deg,#062f75_0%,#0647a6_55%,#0b5ed7_100%)] px-5 py-5 text-paper shadow-[0_18px_50px_rgba(6,59,140,0.18)] sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-signal/25 blur-3xl" />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/80">
              <Boxes size={13} className="text-signal" />
              Master Data • Raw Material
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold leading-snug text-paper sm:text-3xl">
              Material siap dipakai untuk receiving
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-paper/70">
              Kelola bahan baku beserta UOM, expiry, dan minimum stock agar Goods Receiving selalu siap dipilih.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:w-[340px]">
            <div className="rounded-xl border border-paper/10 bg-paper/10 px-3 py-2.5 backdrop-blur-sm">
              <div className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/55">Total</div>
              <div className="mt-1 font-display text-2xl font-semibold leading-none text-paper">{rawMaterialModule.pagination.totalItems}</div>
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

      <RawMaterialToolbar
        query={rawMaterialModule.query}
        searchValue={rawMaterialModule.searchInput}
        uomOptions={uomOptions}
        onSearchValueChange={rawMaterialModule.setSearchInput}
        onStatusChange={rawMaterialModule.handleStatusChange}
        onCategoryChange={(value) =>
          rawMaterialModule.setQuery((current) => ({
            ...current,
            category: value,
            page: 1,
          }))
        }
        onUnitOfMeasureChange={(value) =>
          rawMaterialModule.setQuery((current) => ({
            ...current,
            unitOfMeasureId: value,
            page: 1,
          }))
        }
        onHasExpiryChange={(value) =>
          rawMaterialModule.setQuery((current) => ({
            ...current,
            hasExpiry: value,
            page: 1,
          }))
        }
        onPageSizeChange={rawMaterialModule.handlePageSizeChange}
        onResetFilters={() => {
          rawMaterialModule.setSearchInput('')
          rawMaterialModule.setQuery((current) => ({
            ...current,
            search: '',
            status: 'ALL',
            category: '',
            unitOfMeasureId: '',
            hasExpiry: 'ALL',
            page: 1,
          }))
        }}
        onCreate={rawMaterialModule.openCreateDialog}
        canCreate={rawMaterialModule.canCreate}
      />

      {rawMaterialModule.isLoading ? (
        <MasterDataTableSkeleton rows={rawMaterialModule.query.pageSize} label="Daftar raw material sedang dimuat" />
      ) : rawMaterialModule.error ? (
        <MasterDataErrorState
          description={rawMaterialModule.error}
          onRetry={rawMaterialModule.reload}
        />
      ) : rawMaterialModule.items.length === 0 ? (
        <MasterDataEmptyState
          title="Belum ada raw material"
          description="Tambahkan material pertama agar bisa dipakai di Goods Receiving, atau reset filter saat ini."
          action={
            rawMaterialModule.canCreate ? (
              <Button onClick={rawMaterialModule.openCreateDialog}>Tambah material pertama</Button>
            ) : null
          }
        />
      ) : (
        <div className="relative space-y-3">
          {rawMaterialModule.isRefreshing && (
            <div className="pointer-events-none absolute -top-1 right-1 z-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
              <LoaderCircle size={13} className="animate-spin text-slate-400" />
              Menyegarkan data...
            </div>
          )}
          <RawMaterialTable
            items={rawMaterialModule.items}
            pagination={rawMaterialModule.pagination}
            onPageChange={rawMaterialModule.handlePageChange}
            onEdit={rawMaterialModule.openEditDialog}
            onToggleStatus={rawMaterialModule.openStatusDialog}
            canUpdate={rawMaterialModule.canUpdate}
          />
        </div>
      )}

      <RawMaterialFormDialog
        open={rawMaterialModule.isFormOpen}
        mode={rawMaterialModule.formMode}
        values={rawMaterialModule.formValues}
        errors={rawMaterialModule.formErrors}
        formError={rawMaterialModule.formError}
        uomError={uomError}
        isUomLoading={isUomLoading}
        isDetailLoading={rawMaterialModule.isDetailLoading}
        submitting={rawMaterialModule.isFormSubmitting}
        unitOptions={formUnitOptions}
        currentUnit={currentFormUnit ?? null}
        onValuesChange={rawMaterialModule.setFormValues}
        onOpenChange={rawMaterialModule.closeFormDialog}
        onSubmit={rawMaterialModule.submitForm}
      />

      <RawMaterialStatusDialog
        open={Boolean(rawMaterialModule.statusTarget)}
        materialName={rawMaterialModule.statusTarget?.name ?? 'raw material'}
        materialCode={rawMaterialModule.statusTarget?.code ?? ''}
        nextStatusLabel={rawMaterialModule.statusTarget?.isActive ? 'Inactive' : 'Active'}
        onOpenChange={rawMaterialModule.closeStatusDialog}
        onConfirm={rawMaterialModule.confirmStatusChange}
        submitting={rawMaterialModule.isStatusSubmitting}
      />
    </div>
  )
}
