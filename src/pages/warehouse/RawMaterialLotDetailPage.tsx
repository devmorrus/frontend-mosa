import { useEffect, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowLeftRight,
  CalendarDays,
  Info,
  Printer,
  QrCode,
  RefreshCw,
  ScanLine,
  Tags,
  Waypoints,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ModuleHero } from '@/components/common/ModuleHero'
import { StatusBadge } from '@/components/common/StatusBadge'
import { breadcrumbs, entityLinks } from '@/routes/canonicalRoutes'
import { rawMaterialLotsApi } from '@/api/rawMaterialLots.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  MasterDataDetailSkeleton,
  MasterDataErrorState,
} from '@/features/master-data/components/MasterDataStates'
import { RawMaterialLotQrCard } from '@/features/raw-material-lots/components/RawMaterialLotQrCard'
import type {
  RawMaterialLotDetail,
  RawMaterialLotLabel,
  RawMaterialLotQr,
} from '@/features/raw-material-lots/types'
import {
  canOpenReceivingReference,
  formatLotDateLabel,
  formatLotDateTimeLabel,
  formatLotQuantity,
  prepareRawMaterialLotPrintWindow,
  renderRawMaterialLotPrintWindow,
} from '@/features/raw-material-lots/utils'
import { useAuth } from '@/hooks/useAuth'
import type { ApiError } from '@/types/api'

export function RawMaterialLotDetailPage() {
  const { id } = useParams()
  const { can } = useAuth()
  const [detail, setDetail] = useState<RawMaterialLotDetail | null>(null)
  const [qr, setQr] = useState<RawMaterialLotQr | null>(null)
  const [label, setLabel] = useState<RawMaterialLotLabel | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [qrError, setQrError] = useState<string | null>(null)
  const [printError, setPrintError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isQrLoading, setIsQrLoading] = useState(true)

  async function loadDetail() {
    if (!id) {
      setError('ID LOT tidak valid.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await rawMaterialLotsApi.getById(id)
      setDetail(result)
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setError(apiError.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadQrResources() {
    if (!id) {
      setQrError('QR LOT tidak dapat dimuat.')
      setIsQrLoading(false)
      return
    }

    setIsQrLoading(true)
    setQrError(null)

    try {
      const [qrResult, labelResult] = await Promise.all([
        rawMaterialLotsApi.getQr(id),
        rawMaterialLotsApi.getLabel(id),
      ])
      setQr(qrResult)
      setLabel(labelResult)
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setQrError(apiError.message)
    } finally {
      setIsQrLoading(false)
    }
  }

  useEffect(() => {
    void loadDetail()
    void loadQrResources()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handlePrint() {
    setPrintError(null)
    const preparedWindow = prepareRawMaterialLotPrintWindow()

    if (!preparedWindow) {
      setPrintError('Popup print diblok browser. Izinkan popup lalu coba lagi.')
      return
    }

    try {
      const nextLabel = label ?? (id ? await rawMaterialLotsApi.getLabel(id) : null)
      if (!nextLabel) {
        preparedWindow.close()
        setPrintError('Label LOT tidak tersedia.')
        return
      }

      setLabel(nextLabel)
      const result = renderRawMaterialLotPrintWindow(preparedWindow, nextLabel)
      if (!result.ok) {
        setPrintError(result.error)
      }
    } catch (caughtError) {
      preparedWindow.close()
      const apiError = caughtError as ApiError
      setPrintError(apiError.message)
    }
  }

  if (isLoading) {
    return <MasterDataDetailSkeleton label="Detail raw material LOT sedang dimuat" />
  }

  if (error || !detail) {
    return (
      <MasterDataErrorState
        description={error ?? 'Detail LOT tidak ditemukan.'}
        onRetry={() => void loadDetail()}
      />
    )
  }

  const canOpenMovements = can('stock-movements.view')
  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs.lotDetail(detail.internalLotNumber)} />
      <Button asChild variant="secondary" className="w-fit text-slate-600">
        <Link to={entityLinks.lotList()}>
          <ArrowLeft size={16} />
          Kembali ke LOT list
        </Link>
      </Button>
      <ModuleHero
        eyebrow="Warehouse • LOT Detail"
        title={detail.internalLotNumber}
        description="Detail LOT hasil receiving, stok berjalan, QR label, dan shortcut traceability."
        icon={<QrCode size={13} className="text-signal" />}
        side={
          <div className="rounded-xl border border-paper/10 bg-paper/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/55">Status</div>
            <div className="mt-2">
              <StatusBadge domain="lot" value={detail.status} />
            </div>
            <p className="mt-2 text-xs text-paper/60">Created by {detail.createdBy ?? 'system'}</p>
            <p className="mt-1 text-xs text-paper/60">
              Updated {formatLotDateTimeLabel(detail.updatedAtUtc ?? detail.createdAtUtc)}
            </p>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <Card data-tour="lot-detail-card" className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0b5ed7]"><Tags size={19} /></div>
              <div><h2 className="font-display text-xl font-semibold text-ink">LOT Information</h2><p className="mt-1 text-sm text-slate-500">Identitas material dan penerimaan awal.</p></div>
            </div>
            <div className="grid gap-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-3">
              <DetailField label="Internal LOT" value={detail.internalLotNumber} />
              <DetailField label="Material" value={`${detail.rawMaterialCode} - ${detail.rawMaterialName}`} />
              <DetailField label="Supplier" value={detail.supplierName} />
              <DetailField label="Supplier LOT" value={detail.supplierLot ?? '-'} />
              <DetailField label="Warehouse" value={detail.warehouseName} />
              <DetailField label="Initial Qty" value={formatLotQuantity(detail.initialQuantity, detail.unitOfMeasureCode)} />
              <DetailField label="Current Qty" value={formatLotQuantity(detail.currentQuantity, detail.unitOfMeasureCode)} />
              <DetailField label="Production Date" value={formatLotDateLabel(detail.productionDate)} />
              <DetailField label="Expiry Date" value={formatLotDateLabel(detail.expiryDate)} />
              <DetailField label="Status" value={<StatusBadge domain="lot" value={detail.status} />} />
              <DetailField label="Receiving Date" value={formatLotDateLabel(detail.receivingDate)} />
              <DetailField
                label="Receiving Reference"
                value={
                  can('receiving.view') && canOpenReceivingReference(detail) ? (
                    <Link
                      to={`/goods-receiving/${detail.goodsReceivingId}`}
                      className="font-medium text-ink underline underline-offset-4"
                    >
                      {detail.receivingNumber}
                    </Link>
                  ) : (
                    detail.receivingNumber
                  )
                }
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"><CalendarDays size={14} className="text-[#0b5ed7]" /> LOT actions</div>
            <div className="flex flex-wrap gap-3">
              <Button data-tour="lot-print-label-btn" className="bg-[#063b8c] hover:bg-[#052f70]" onClick={() => void handlePrint()}><Printer size={16} /> Print Label</Button>
              <Button variant="secondary" onClick={() => void handlePrint()}>
                <RefreshCw size={16} />
                Reprint Existing Label
              </Button>
              <Button asChild variant="secondary">
                <Link to="/lots/scan">
                  <ScanLine size={16} />
                  Open Scan Test
                </Link>
              </Button>
              {can('traceability.view') ? <Button asChild variant="secondary">
                <Link to={entityLinks.traceRawMaterial(detail.id)}>
                  <Waypoints size={16} />
                  Lihat Traceability
                </Link>
              </Button> : null}
              {canOpenMovements ? <Button asChild variant="secondary" data-tour="lot-link-movements">
                <Link to={entityLinks.stockMovements({ rawMaterialLotId: detail.id })}>
                  <ArrowLeftRight size={16} />
                  Stock Movement LOT ini
                </Link>
              </Button> : null}
            </div>

            {qrError ? (
              <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                <Info size={17} className="mt-0.5 shrink-0" />
                Gagal memuat data QR LOT: {qrError}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div data-tour="lot-qr-code">
          <RawMaterialLotQrCard
            qr={qr}
            label={label}
            isLoading={isQrLoading}
            printError={printError}
            onPrint={() => void handlePrint()}
            onReprint={() => void handlePrint()}
          />
        </div>
      </div>
    </div>
  )
}

function DetailField({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <div className="mt-1 font-medium text-ink">{value}</div>
    </div>
  )
}
