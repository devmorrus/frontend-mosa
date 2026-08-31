import { useEffect, useState, type ReactNode } from 'react'
import { ArrowLeft, QrCode, ScanLine } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { rawMaterialLotsApi } from '@/api/rawMaterialLots.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  MasterDataErrorState,
  MasterDataLoadingState,
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
  getLotStatusTone,
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
    return <MasterDataLoadingState description="Detail raw material LOT sedang dimuat." />
  }

  if (error || !detail) {
    return (
      <MasterDataErrorState
        description={error ?? 'Detail LOT tidak ditemukan.'}
        onRetry={() => void loadDetail()}
      />
    )
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Button asChild variant="ghost" className="-ml-3 h-auto px-3 py-2">
              <Link to="/lots">
                <ArrowLeft size={16} />
                Kembali ke LOT list
              </Link>
            </Button>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <QrCode size={14} className="text-signal" />
              Raw Material LOT Detail
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              {detail.internalLotNumber}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              Detail LOT hasil goods receiving dengan preview QR dan flow print/reprint label V1.
            </p>
          </div>

          <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
            <CardContent className="space-y-2 p-5 text-sm">
              <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Status</div>
              <div className="font-display text-2xl font-semibold text-paper">{detail.status}</div>
              <p className="text-paper/60">Created by {detail.createdBy ?? 'system'}</p>
              <p className="text-paper/60">
                Updated {formatLotDateTimeLabel(detail.updatedAtUtc ?? detail.createdAtUtc)}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <Card data-tour="lot-detail-card" className="rounded-[28px] border border-white/70 bg-white shadow-sm">
          <CardContent className="space-y-6 p-6">
            <div className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-3">
              <DetailField label="Internal LOT" value={detail.internalLotNumber} />
              <DetailField label="Material" value={`${detail.rawMaterialCode} - ${detail.rawMaterialName}`} />
              <DetailField label="Supplier" value={detail.supplierName} />
              <DetailField label="Supplier LOT" value={detail.supplierLot ?? '-'} />
              <DetailField label="Warehouse" value={detail.warehouseName} />
              <DetailField label="Initial Qty" value={formatLotQuantity(detail.initialQuantity, detail.unitOfMeasureCode)} />
              <DetailField label="Current Qty" value={formatLotQuantity(detail.currentQuantity, detail.unitOfMeasureCode)} />
              <DetailField label="Production Date" value={formatLotDateLabel(detail.productionDate)} />
              <DetailField label="Expiry Date" value={formatLotDateLabel(detail.expiryDate)} />
              <DetailField
                label="Status"
                value={
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getLotStatusTone(detail.status)}`}
                  >
                    {detail.status}
                  </span>
                }
              />
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

            <div className="flex flex-wrap gap-3">
              <Button data-tour="lot-print-label-btn" onClick={() => void handlePrint()}>Print Label</Button>
              <Button variant="secondary" onClick={() => void handlePrint()}>
                Reprint Existing Label
              </Button>
              <Button asChild variant="secondary">
                <Link to="/lots/scan">
                  <ScanLine size={16} />
                  Open Scan Test
                </Link>
              </Button>
            </div>

            {qrError ? (
              <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
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
