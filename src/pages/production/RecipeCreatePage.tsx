import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, ClipboardPenLine, LoaderCircle, Save } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { productsApi } from '@/api/products.api'
import { rawMaterialsApi } from '@/api/rawMaterials.api'
import { recipesApi } from '@/api/recipes.api'
import { unitOfMeasuresApi } from '@/api/unitOfMeasures.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MasterDataFormFieldError } from '@/features/master-data/components/MasterDataFormFieldError'
import { getFieldError, hasFormErrors } from '@/features/master-data/utils'
import { RecipeStepEditor } from '@/features/recipes/components/RecipeStepEditor'
import type { RecipeCreateFormValues } from '@/features/recipes/types'
import {
  emptyRecipeCreateFormValues,
  emptyRecipeStepFormValues,
  validateRecipeCreateForm,
} from '@/features/recipes/validation'
import type { ProductListItem } from '@/features/products/types'
import type { RawMaterialListItem } from '@/features/raw-materials/types'
import type { ApiError } from '@/types/api'
import type { UnitOfMeasureOption } from '@/features/unit-of-measures/types'
import { fetchLookupIfAllowed } from '@/utils/lookupGuard'

function buildUnitLabel(option: UnitOfMeasureOption) {
  return option.symbol ? `${option.name} (${option.symbol})` : `${option.name} (${option.code})`
}

export function RecipeCreatePage() {
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState<RecipeCreateFormValues>(emptyRecipeCreateFormValues)
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [rawMaterials, setRawMaterials] = useState<RawMaterialListItem[]>([])
  const [uomOptions, setUomOptions] = useState<UnitOfMeasureOption[]>([])

  useEffect(() => {
    async function bootstrap() {
      setIsBootstrapping(true)
      setBootstrapError(null)

      try {
        const [productItems, rawMaterialItems, unitItems] = await Promise.all([
          fetchLookupIfAllowed('products.view', () => productsApi.listActiveOptions(), []),
          fetchLookupIfAllowed('materials.view', () => rawMaterialsApi.listActiveOptions(), []),
          fetchLookupIfAllowed('uoms.view', () => unitOfMeasuresApi.listActiveOptions(), []),
        ])

        setProducts(productItems)
        setRawMaterials(rawMaterialItems)
        setUomOptions(unitItems)
      } catch (caughtError) {
        const apiError = caughtError as ApiError
        setBootstrapError(apiError.message)
      } finally {
        setIsBootstrapping(false)
      }
    }

    void bootstrap()
  }, [])

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === formValues.productId) ?? null,
    [formValues.productId, products],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors = validateRecipeCreateForm(formValues)
    setFormErrors(errors)
    setFormError(null)

    if (hasFormErrors(errors)) {
      return
    }

    setIsSubmitting(true)

    try {
      const recipe = await recipesApi.create(formValues)
      navigate(`/production/recipes/${recipe.id}`)
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setFormError(apiError.message)
      setFormErrors(apiError.errors ?? {})
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isBootstrapping) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center gap-3 py-10 text-sm text-slate-500">
            <LoaderCircle size={18} className="animate-spin" />
            Memuat referensi product, raw material, dan UOM...
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <ClipboardPenLine size={14} className="text-signal" />
              Create Recipe
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Susun recipe baru lengkap dengan production step awal
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-paper/68 sm:text-base">
              Recipe baru langsung dibuat bersama standard output dan step baseline agar backend
              menerima payload operational yang valid sejak awal.
            </p>
          </div>

          <Button asChild variant="ghost">
            <Link to="/production/recipes">
              <ArrowLeft size={16} />
              Back to List
            </Link>
          </Button>
        </div>
      </section>

      {bootstrapError ? (
        <Card>
          <CardContent className="py-5 text-sm text-red-700">{bootstrapError}</CardContent>
        </Card>
      ) : null}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Recipe Header</CardTitle>
            <CardDescription>Pilih product aktif dan tentukan standard output version awal.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Product</label>
              <select
                data-tour="recipe-product-select"
                value={formValues.productId}
                onChange={(event) => {
                  const nextProduct = products.find((item) => item.id === event.target.value)
                  setFormValues((current) => ({
                    ...current,
                    productId: event.target.value,
                    unitOfMeasureId: nextProduct?.unitOfMeasureId ?? '',
                  }))
                }}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
              >
                <option value="">Pilih product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.code} - {product.name}
                  </option>
                ))}
              </select>
              <MasterDataFormFieldError message={getFieldError(formErrors, 'productId')} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Recipe Name</label>
              <Input
                value={formValues.name}
                onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
                placeholder="Bumbu Rendang Standard"
              />
              <MasterDataFormFieldError message={getFieldError(formErrors, 'name')} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Standard Output Quantity</label>
              <Input
                data-tour="recipe-std-output"
                value={formValues.standardOutputQuantity}
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, standardOutputQuantity: event.target.value }))
                }
                inputMode="decimal"
                placeholder="100"
              />
              <MasterDataFormFieldError message={getFieldError(formErrors, 'standardOutputQuantity')} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Output UOM</label>
              <select
                value={formValues.unitOfMeasureId}
                onChange={(event) =>
                  setFormValues((current) => ({ ...current, unitOfMeasureId: event.target.value }))
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
              >
                <option value="">Pilih UOM</option>
                {uomOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {buildUnitLabel(option)}
                  </option>
                ))}
              </select>
              {selectedProduct ? (
                <p className="mt-1.5 text-xs text-slate-500">
                  Default product UOM: {selectedProduct.unitOfMeasureName} ({selectedProduct.unitOfMeasureCode})
                </p>
              ) : null}
              <MasterDataFormFieldError message={getFieldError(formErrors, 'unitOfMeasureId')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Production Steps</CardTitle>
            <CardDescription>
              Material step membutuhkan raw material, target quantity, dan UOM. Tipe step lain mengikuti
              rule validation backend.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecipeStepEditor
              steps={formValues.steps}
              errors={formErrors}
              rawMaterials={rawMaterials}
              unitOptions={uomOptions}
              onChange={(updater) => setFormValues((current) => ({ ...current, steps: updater(current.steps) }))}
              onAdd={() =>
                setFormValues((current) => ({
                  ...current,
                  steps: [...current.steps, emptyRecipeStepFormValues()],
                }))
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold text-ink">Validasi frontend mengikuti rule backend</div>
              <p className="mt-1 text-sm text-slate-500">
                Quantity harus lebih dari 0, tolerance tidak boleh negatif, dan timer harus lebih besar dari 0.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild type="button" variant="secondary">
                <Link to="/production/recipes">Cancel</Link>
              </Button>
              <Button data-tour="recipe-submit-approval-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                Save Recipe
              </Button>
            </div>
          </CardContent>
        </Card>

        {formError ? (
          <Card className="border-red-100 bg-red-50">
            <CardContent className="py-4 text-sm text-red-700">{formError}</CardContent>
          </Card>
        ) : null}
      </form>
    </div>
  )
}
