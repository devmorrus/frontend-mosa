import { CheckCircle2, FileText, Printer, QrCode, RefreshCw } from 'lucide-react'
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
    <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xl"><QrCode size={19} className="text-[#0b5ed7]" /> QR Preview & Label</CardTitle>
        <p className="text-sm text-slate-500">Label siap dicetak dan ditempel ke kemasan material.</p>
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

            <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 size={17} />
              QR label siap digunakan untuk identifikasi LOT.
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  QR Token
                </div>
                <div className="mt-1 flex items-start gap-2 break-all rounded-xl bg-slate-50 p-3 font-mono text-xs font-medium text-ink"><QrCode size={14} className="mt-0.5 shrink-0 text-[#0b5ed7]" />{label.qrToken}</div>
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
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Print availability</div>
                <div className="mt-1 inline-flex items-center gap-1.5 font-medium text-ink"><FileText size={14} />{label.reprintable ? 'Reprintable' : 'Print only'}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="bg-[#063b8c] hover:bg-[#052f70]" onClick={onPrint}><Printer size={16} /> Print Label</Button>
              <Button variant="secondary" onClick={onReprint}>
                <RefreshCw size={16} />
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
