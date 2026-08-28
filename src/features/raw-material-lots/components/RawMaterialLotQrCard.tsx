import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RawMaterialLotLabel, RawMaterialLotQr } from '@/features/raw-material-lots/types'
import { buildQrSvgDataUri, formatLotDateLabel } from '@/features/raw-material-lots/utils'

interface RawMaterialLotQrCardProps {
  qr: RawMaterialLotQr | null
  label: RawMaterialLotLabel | null
  isLoading: boolean
  printError: string | null
  onPrint: () => void
  onReprint: () => void
}

export function RawMaterialLotQrCard({
  qr,
  label,
  isLoading,
  printError,
  onPrint,
  onReprint,
}: RawMaterialLotQrCardProps) {
  return (
    <Card className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <CardTitle>QR Preview & Label</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-6">
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Memuat QR label...
          </div>
        ) : label ? (
          <>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="mx-auto aspect-square w-full max-w-[240px] rounded-2xl bg-white p-4 shadow-sm">
                <img
                  src={buildQrSvgDataUri(label.qrCodeSvg)}
                  alt={`QR ${label.internalLotNumber}`}
                  className="block h-full w-full object-contain"
                />
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  QR Token
                </div>
                <div className="mt-1 break-all font-medium text-ink">{label.qrToken}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  QR Payload
                </div>
                <div className="mt-1 break-all text-xs text-slate-600">{label.qrPayload}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Received Date
                </div>
                <div className="mt-1">{formatLotDateLabel(label.receivedDate)}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Expiry Date
                </div>
                <div className="mt-1">{formatLotDateLabel(label.expiryDate)}</div>
              </div>
              {qr ? (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Resolve URL
                  </div>
                  <div className="mt-1 break-all text-xs text-slate-600">{qr.qrCodeUrl}</div>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={onPrint}>Print Label</Button>
              <Button variant="secondary" onClick={onReprint}>
                Reprint Existing Label
              </Button>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            QR label belum tersedia.
          </div>
        )}

        {printError ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {printError}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
