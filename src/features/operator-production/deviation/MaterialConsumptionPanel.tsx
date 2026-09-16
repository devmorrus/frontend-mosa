import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import qrScannerWorkerPath from 'qr-scanner/qr-scanner-worker.min?url'
import { Camera, ScanLine, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import type { OperatorProductionCurrentStep, ValidatedMaterialLot } from '@/features/operator-production/types'
import { evaluateTolerance, formatAllowedRange, validateLots, validateReason } from './validation'

QrScanner.WORKER_PATH = qrScannerWorkerPath

export function MaterialConsumptionPanel({ step, uom, disabled, onValidateLot, onSubmit }: { step: OperatorProductionCurrentStep; uom: string; disabled: boolean; onValidateLot: (value: string) => Promise<ValidatedMaterialLot>; onSubmit: (lots: ValidatedMaterialLot[], reason: string | null) => void }) {
  const [scanValue, setScanValue] = useState('')
  const [lots, setLots] = useState<ValidatedMaterialLot[]>([])
  const [reason, setReason] = useState('')
  const [scanError, setScanError] = useState<string | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const lotError = validateLots(lots)
  const total = lots.reduce((sum, lot) => sum + (Number(lot.actualQuantity.replace(',', '.')) || 0), 0)
  const tolerance = evaluateTolerance(total, step.targetQuantity ?? 0, step.toleranceType, step.toleranceValue)
  const requiresDeviation = !lotError && !tolerance.isWithinTolerance
  const reasonError = requiresDeviation ? validateReason(reason) : null
  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(lots.length / pageSize))
  const visibleLots = lots.slice((page - 1) * pageSize, page * pageSize)
  function removeLot(lotId: string) {
    setLots((current) => {
      const next = current.filter((item) => item.lotId !== lotId)
      setPage(Math.min(page, Math.max(1, Math.ceil(next.length / pageSize))))
      return next
    })
  }
  async function validateInput(value: string) { try { setScanError(null); const lot = await onValidateLot(value); if (lots.some((item) => item.lotId === lot.lotId)) { setScanError('LOT sudah ditambahkan.'); return }; setLots((current) => [...current, lot]); setScanValue(''); setPage(Math.ceil((lots.length + 1) / pageSize)) } catch (error) { setScanError(error instanceof Error ? error.message : 'LOT tidak valid.') } }
  async function scan() { await validateInput(scanValue) }
  function stopCamera() { scannerRef.current?.stop(); scannerRef.current?.destroy(); scannerRef.current = null; setCameraOpen(false) }
  async function startCamera() {
    if (!videoRef.current) return
    setCameraError(null)
    try {
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        setCameraError('Camera access unavailable. Browser camera memerlukan HTTPS atau localhost. Gunakan manual LOT input.')
        return
      }
      stopCamera()
      const scanner = new QrScanner(videoRef.current, (result) => { stopCamera(); void validateInput(result.data) }, { preferredCamera: 'environment', highlightScanRegion: true, highlightCodeOutline: true, returnDetailedScanResult: true })
      scannerRef.current = scanner
      await scanner.start()
      setCameraOpen(true)
    } catch (caughtError) {
      const message = caughtError instanceof Error && /permission|denied|notallowed/i.test(caughtError.message)
        ? 'Camera access unavailable. Izin kamera ditolak. Gunakan manual LOT input.'
        : 'Camera access unavailable. Periksa browser, device camera, atau izin akses.'
      setCameraError(message)
      stopCamera()
    }
  }
  useEffect(() => () => { scannerRef.current?.stop(); scannerRef.current?.destroy(); scannerRef.current = null }, [])
  const submitDisabled = disabled || !!lotError || !!reasonError
  return <div className="mt-6 space-y-4 rounded-2xl border border-ink/10 p-5"><div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]"><Input data-tour="consume-lot-select" value={scanValue} onChange={(event) => setScanValue(event.target.value)} placeholder="Scan QR, masukkan Internal LOT, atau pilih/manual input ID LOT" disabled={disabled} /><Button type="button" onClick={() => void scan()} disabled={disabled || !scanValue.trim()}><ScanLine size={16} />Validasi LOT</Button><Button type="button" variant="secondary" onClick={() => cameraOpen ? stopCamera() : void startCamera()} disabled={disabled}>{cameraOpen ? <X size={16} /> : <Camera size={16} />}{cameraOpen ? 'Tutup Kamera' : 'Scan Kamera'}</Button></div><div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-3"><video ref={videoRef} className="aspect-video w-full rounded-xl object-cover" muted playsInline /><p className="mt-2 text-xs text-slate-300">{cameraOpen ? 'Kamera aktif. Arahkan QR LOT ke area video.' : 'Kamera belum aktif. Buka kamera atau gunakan manual LOT input.'}</p></div>{cameraError ? <p className="text-sm text-amber-700">{cameraError}</p> : null}{scanError ? <p className="text-sm text-red-700">{scanError}</p> : null}<p className="text-xs text-slate-500">Manual LOT selection: ketik Internal LOT Number atau ID LOT, lalu validasi ke backend sebelum ditambahkan.</p>
    {lots.length ? <><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b text-left text-xs uppercase text-slate-500"><th className="p-2">LOT</th><th className="p-2">Tersedia</th><th className="p-2">Actual</th><th className="p-2" /></tr></thead><tbody>{visibleLots.map((lot) => <tr key={lot.lotId} className="border-b"><td className="p-2 font-semibold">{lot.lotNumber}</td><td className="p-2">{lot.availableQuantity} {uom}</td><td className="p-2"><Input data-tour="consume-actual-qty" inputMode="decimal" value={lot.actualQuantity} onChange={(event) => setLots((current) => current.map((item) => item.lotId === lot.lotId ? { ...item, actualQuantity: event.target.value } : item))} disabled={disabled} /></td><td className="p-2"><Button type="button" size="icon" variant="secondary" disabled={disabled} onClick={() => removeLot(lot.lotId)}><Trash2 size={15} /></Button></td></tr>)}</tbody></table></div><MasterDataPagination pagination={{ page, pageSize, totalItems: lots.length, totalPages, hasPreviousPage: page > 1, hasNextPage: page < totalPages }} onPageChange={setPage} /></> : null}
    <div data-tour="consume-tolerance-hint" className="rounded-xl bg-sand/45 p-4 text-sm"><div className="grid gap-2 sm:grid-cols-3"><span>Target: <b>{step.targetQuantity} {uom}</b></span><span>Total Actual: <b>{total} {uom}</b></span><span>Variance: <b>{tolerance.variance} {uom}</b></span></div><p className="mt-2">Allowed range: {formatAllowedRange(tolerance.lowerLimit, tolerance.upperLimit, uom)}</p></div>
    {requiresDeviation ? <div className="space-y-2 rounded-xl border border-signal/30 bg-signal/10 p-4"><p className="text-sm font-semibold">Actual di luar tolerance. Alasan deviasi wajib sebelum meminta persetujuan supervisor.</p><Textarea value={reason} maxLength={2000} onChange={(event) => setReason(event.target.value)} disabled={disabled} placeholder="Alasan deviasi" />{reasonError ? <p className="text-sm text-red-700">{reasonError}</p> : null}</div> : null}{lotError ? <p className="text-sm text-red-700">{lotError}</p> : null}
    <Button data-tour="consume-submit-btn" type="button" size="lg" disabled={submitDisabled} onClick={() => onSubmit(lots, requiresDeviation ? reason.trim() : null)}>{requiresDeviation ? 'Request Supervisor Approval' : 'Complete Material Step'}</Button>
  </div>
}
