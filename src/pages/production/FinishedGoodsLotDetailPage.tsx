import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FlaskConical, PackageSearch, Waypoints } from 'lucide-react'
import { productionOrdersApi } from '@/api/productionOrders.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { breadcrumbs, canonicalRoutes, entityLinks } from '@/routes/canonicalRoutes'
import { useAuth } from '@/hooks/useAuth'

interface FinishedGoodsLotDetail {
  id: string
  finishedGoodsLotNumber: string
  productId: string
  productCode: string
  productName: string
  productionOrderId: string
  productionOrderNumber: string
  recipeVersionId?: string
  recipeVersionNumber?: number
  recipeName?: string
  warehouseName?: string
  warehouseCode?: string
  targetOutput: number
  actualOutput: number
  yieldValue: number
  unitOfMeasure: { code: string; symbol?: string | null }
  productionDate?: string
  expiryDate?: string | null
  qcStatus: string | number
  inventoryStatus: string | number
  qrToken: string
  completedBy?: string
  completedAtUtc?: string
}

export function FinishedGoodsLotDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { can } = useAuth()
  const [lot, setLot] = useState<FinishedGoodsLotDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    productionOrdersApi
      .getFinishedGoodsLot(id)
      .then((result) => {
        if (!cancelled) setLot(result as unknown as FinishedGoodsLotDetail)
      })
      .catch((caught: Error) => {
        if (!cancelled) setError(caught.message)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (error) return <MasterDataErrorState description={error} onRetry={() => window.location.reload()} />
  if (!lot) return <MasterDataLoadingState description="Memuat Finished Goods LOT." />

  const uom = lot.unitOfMeasure.symbol ?? lot.unitOfMeasure.code
  const canOpenPo = can('production-orders.view') && lot.productionOrderId
  const canOpenQc = can('qc.view') && lot.id
  const canOpenTrace = can('traceability.view') && lot.id
  const canOpenRecipe = can('recipes.view') && lot.recipeVersionId

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finished Goods LOT"
        title={lot.finishedGoodsLotNumber}
        description={`${lot.productCode} — ${lot.productName} • Target ${lot.targetOutput} ${uom}, aktual ${lot.actualOutput} ${uom}, yield ${lot.yieldValue}%`}
        breadcrumb={breadcrumbs.finishedGoodsDetail(lot.finishedGoodsLotNumber)}
        backTo={canonicalRoutes.productionOrders}
        backLabel="Kembali ke Production Orders"
        statusBlock={
          <>
            <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">QC Status</div>
            <div><StatusBadge domain="fg-qc" value={lot.qcStatus} /></div>
            <div className="pt-1 text-[11px] uppercase tracking-[0.18em] text-paper/45">Inventory</div>
            <div><StatusBadge domain="fg-inventory" value={lot.inventoryStatus} /></div>
          </>
        }
      />

      <Card>
        <CardHeader><CardTitle>Cross-link modul terkait</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {canOpenPo ? (
            <Button asChild variant="secondary" data-tour="fg-link-po">
              <Link to={entityLinks.productionOrderDetail(lot.productionOrderId)}>
                <PackageSearch size={16} /> {lot.productionOrderNumber}
              </Link>
            </Button>
          ) : null}
          {canOpenQc ? (
            <Button asChild variant="secondary" data-tour="fg-link-qc">
              <Link to={entityLinks.qcInspection(lot.id)}>
                <FlaskConical size={16} /> Buka QC Inspection
              </Link>
            </Button>
          ) : null}
          {canOpenTrace ? (
            <Button asChild variant="secondary" data-tour="fg-link-trace">
              <Link to={entityLinks.traceFinishedGoods(lot.id)}>
                <Waypoints size={16} /> Lihat Traceability
              </Link>
            </Button>
          ) : null}
          {canOpenRecipe && lot.recipeVersionId ? (
            <Button asChild variant="secondary">
              <Link to={entityLinks.recipeDetail(lot.recipeVersionId)}>
                Recipe {lot.recipeName} v{lot.recipeVersionNumber}
              </Link>
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => navigate(canonicalRoutes.operatorProduction)}>
            Back to Production
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Detail LOT</CardTitle></CardHeader>
        <CardContent>
          <Breadcrumb items={breadcrumbs.finishedGoodsDetail(lot.finishedGoodsLotNumber)} />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Info label="Product" value={`${lot.productCode} — ${lot.productName}`} />
            <Info label="Warehouse" value={lot.warehouseName ?? lot.warehouseCode ?? '-'} />
            <Info label="Target Output" value={`${lot.targetOutput} ${uom}`} />
            <Info label="Actual Output" value={`${lot.actualOutput} ${uom}`} />
            <Info label="Yield" value={`${lot.yieldValue}%`} />
            <Info label="QC Status" value={<StatusBadge domain="fg-qc" value={lot.qcStatus} />} />
            <Info label="Inventory Status" value={<StatusBadge domain="fg-inventory" value={lot.inventoryStatus} />} />
            <Info
              label="Production Order"
              value={
                canOpenPo ? (
                  <Link to={entityLinks.productionOrderDetail(lot.productionOrderId)} className="font-medium text-ink underline underline-offset-4">
                    {lot.productionOrderNumber}
                  </Link>
                ) : (
                  lot.productionOrderNumber
                )
              }
            />
            <div className="rounded-2xl border border-ink/8 bg-sand/45 p-4 sm:col-span-2">
              <div className="font-semibold text-ink">QR Token</div>
              <p className="mt-2 break-all text-sm text-slate-600">{lot.qrToken}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink/8 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 font-semibold text-ink">{value}</div>
    </div>
  )
}
