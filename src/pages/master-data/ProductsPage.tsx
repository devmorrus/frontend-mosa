import { useEffect, useState } from 'react'
import { LoaderCircle, ShoppingBasket } from 'lucide-react'
import { productsApi } from '@/api/products.api'
import { unitOfMeasuresApi } from '@/api/unitOfMeasures.api'
import { Button } from '@/components/ui/button'
import { ProductStatusDialog } from '@/features/products/components/ProductStatusDialog'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import { useMasterDataModule } from '@/features/master-data/hooks/useMasterDataModule'
import { ProductFormDialog } from '@/features/products/components/ProductFormDialog'
import { ProductTable } from '@/features/products/components/ProductTable'
import { ProductToolbar } from '@/features/products/components/ProductToolbar'
import type {
  ProductDetail,
  ProductFormValues,
  ProductListItem,
  ProductQueryState,
} from '@/features/products/types'
import {
  emptyProductFormValues,
  validateProductForm,
} from '@/features/products/validation'
import type { UnitOfMeasureOption } from '@/features/unit-of-measures/types'
import type { ApiError } from '@/types/api'

const DEFAULT_QUERY: ProductQueryState = {
  search: '',
  status: 'ALL',
  unitOfMeasureId: '',
  page: 1,
  pageSize: 10,
}

function toFormValues(detail: ProductDetail): ProductFormValues {
  return {
    code: detail.code,
    name: detail.name,
    unitOfMeasureId: detail.unitOfMeasure.id,
    shelfLifeDays: detail.shelfLifeDays?.toString() ?? '',
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

export function ProductsPage() {
  const [uomOptions, setUomOptions] = useState<UnitOfMeasureOption[]>([])
  const [isUomLoading, setIsUomLoading] = useState(true)
  const [uomError, setUomError] = useState<string | null>(null)
  const [formUnitOverride, setFormUnitOverride] = useState<UnitOfMeasureOption | null>(null)
  const productModule = useMasterDataModule<ProductListItem, ProductDetail, ProductFormValues, ProductQueryState>({
    api: productsApi,
    permissions: {
      view: 'products.view',
      create: 'products.create',
      update: 'products.update',
    },
    emptyValues: emptyProductFormValues,
    toFormValues,
    validate: validateProductForm,
    entityName: 'Product',
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
        !productModule.isFormOpen ||
        !productModule.formValues.unitOfMeasureId ||
        uomOptions.some((option) => option.id === productModule.formValues.unitOfMeasureId)
      ) {
        setFormUnitOverride(null)
        return
      }

      try {
        const detail = await unitOfMeasuresApi.getById(productModule.formValues.unitOfMeasureId)
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
  }, [productModule.formValues.unitOfMeasureId, productModule.isFormOpen, uomOptions])

  const formUnitOptions = mergeCurrentUnit(uomOptions, formUnitOverride)
  const currentFormUnit =
    formUnitOptions.find((option) => option.id === productModule.formValues.unitOfMeasureId) ??
    formUnitOverride

  const activeOnPage = productModule.items.filter((item) => item.isActive).length
  const inactiveOnPage = productModule.items.length - activeOnPage

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[24px] border border-ink/10 bg-[linear-gradient(135deg,#062f75_0%,#0647a6_55%,#0b5ed7_100%)] px-5 py-5 text-paper shadow-[0_18px_50px_rgba(6,59,140,0.18)] sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-signal/25 blur-3xl" />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/80">
              <ShoppingBasket size={13} className="text-signal" />
              Master Data • Product
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold leading-snug text-paper sm:text-3xl">
              Product master yang siap dipakai lintas modul
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-paper/70">
              Kelola product code, UOM, dan shelf life dengan pola yang sama seperti master data lain.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:w-[340px]">
            <div className="rounded-xl border border-paper/10 bg-paper/10 px-3 py-2.5 backdrop-blur-sm">
              <div className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/55">Total</div>
              <div className="mt-1 font-display text-2xl font-semibold leading-none text-paper">{productModule.pagination.totalItems}</div>
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

      <ProductToolbar
        query={productModule.query}
        searchValue={productModule.searchInput}
        uomOptions={uomOptions}
        onSearchValueChange={productModule.setSearchInput}
        onStatusChange={productModule.handleStatusChange}
        onUnitOfMeasureChange={(value) =>
          productModule.setQuery((current) => ({
            ...current,
            unitOfMeasureId: value,
            page: 1,
          }))
        }
        onPageSizeChange={productModule.handlePageSizeChange}
        onResetFilters={() => {
          productModule.setSearchInput('')
          productModule.setQuery((current) => ({
            ...current,
            search: '',
            status: 'ALL',
            unitOfMeasureId: '',
            page: 1,
          }))
        }}
        onCreate={productModule.openCreateDialog}
        canCreate={productModule.canCreate}
      />

      {productModule.isLoading ? (
        <MasterDataLoadingState description="Daftar product sedang dimuat." />
      ) : productModule.error ? (
        <MasterDataErrorState description={productModule.error} onRetry={productModule.reload} />
      ) : productModule.items.length === 0 ? (
        <MasterDataEmptyState
          title="Belum ada product"
          description="Tambahkan product pertama agar bisa dipakai lintas modul, atau reset filter saat ini."
          action={
            productModule.canCreate ? (
              <Button onClick={productModule.openCreateDialog}>Tambah product pertama</Button>
            ) : null
          }
        />
      ) : (
        <div className="relative space-y-3">
          {productModule.isRefreshing && (
            <div className="pointer-events-none absolute -top-1 right-1 z-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
              <LoaderCircle size={13} className="animate-spin text-slate-400" />
              Menyegarkan data...
            </div>
          )}
          <ProductTable
            items={productModule.items}
            pagination={productModule.pagination}
            onPageChange={productModule.handlePageChange}
            onEdit={productModule.openEditDialog}
            onToggleStatus={productModule.openStatusDialog}
            canUpdate={productModule.canUpdate}
          />
        </div>
      )}

      <ProductFormDialog
        open={productModule.isFormOpen}
        mode={productModule.formMode}
        values={productModule.formValues}
        errors={productModule.formErrors}
        formError={productModule.formError}
        uomError={uomError}
        isUomLoading={isUomLoading}
        isDetailLoading={productModule.isDetailLoading}
        submitting={productModule.isFormSubmitting}
        unitOptions={formUnitOptions}
        currentUnit={currentFormUnit ?? null}
        onValuesChange={productModule.setFormValues}
        onOpenChange={productModule.closeFormDialog}
        onSubmit={productModule.submitForm}
      />

      <ProductStatusDialog
        open={Boolean(productModule.statusTarget)}
        productName={productModule.statusTarget?.name ?? 'product'}
        productCode={productModule.statusTarget?.code ?? ''}
        nextStatusLabel={productModule.statusTarget?.isActive ? 'Inactive' : 'Active'}
        onOpenChange={productModule.closeStatusDialog}
        onConfirm={productModule.confirmStatusChange}
        submitting={productModule.isStatusSubmitting}
      />
    </div>
  )
}
