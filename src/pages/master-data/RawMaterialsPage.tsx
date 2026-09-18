import { useEffect, useState } from 'react'
import { Boxes, LoaderCircle } from 'lucide-react'
import { rawMaterialsApi } from '@/api/rawMaterials.api'
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

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(6,59,140,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,201,40,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <Boxes size={14} className="text-signal" />
              Master Data Raw Material
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Material siap dipakai untuk receiving
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              Kelola bahan baku beserta UOM, expiry, minimum stock, dan status aktif agar Goods
              Receiving memiliki master data yang siap dipilih.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">
                  Total Material
                </div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper">
                  {rawMaterialModule.pagination.totalItems}
                </div>
                <p className="mt-1 text-sm text-paper/60">Semua bahan baku tercatat</p>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Active</div>
                <div className="mt-2 font-display text-3xl font-semibold text-blue-400">
                  {rawMaterialModule.items.filter((item) => item.isActive).length}
                </div>
                <p className="mt-1 text-sm text-paper/60">Siap dipakai operasional</p>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">
                  Inactive
                </div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper/45">
                  {rawMaterialModule.items.filter((item) => !item.isActive).length}
                </div>
                <p className="mt-1 text-sm text-paper/60">Perlu direview kembali</p>
              </CardContent>
            </Card>
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
        <MasterDataLoadingState description="Daftar raw material sedang dimuat dari backend." />
      ) : rawMaterialModule.error ? (
        <MasterDataErrorState
          description={rawMaterialModule.error}
          onRetry={rawMaterialModule.reload}
        />
      ) : rawMaterialModule.items.length === 0 ? (
        <MasterDataEmptyState
          description="Belum ada raw material yang cocok dengan filter saat ini."
          action={
            rawMaterialModule.canCreate ? (
              <Button onClick={rawMaterialModule.openCreateDialog}>Tambah material pertama</Button>
            ) : null
          }
        />
      ) : (
        <div className="relative space-y-3">
          {rawMaterialModule.isRefreshing && (
            <div className="absolute -top-2 right-0 z-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
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

      <MasterDataStatusDialog
        open={Boolean(rawMaterialModule.statusTarget)}
        entityLabel={rawMaterialModule.statusTarget?.name ?? 'raw material'}
        nextStatusLabel={rawMaterialModule.statusTarget?.isActive ? 'Inactive' : 'Active'}
        onOpenChange={rawMaterialModule.closeStatusDialog}
        onConfirm={rawMaterialModule.confirmStatusChange}
        submitting={rawMaterialModule.isStatusSubmitting}
      />
    </div>
  )
}
