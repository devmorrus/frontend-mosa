import { useState } from 'react'
import { ScanLine, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import type { OperatorProductionCurrentStep, ValidatedMaterialLot } from '@/features/operator-production/types'
import { evaluateTolerance, validateLots, validateReason } from './validation'

export function MaterialConsumptionPanel({ step, uom, disabled, onValidateLot, onSubmit }: { step: OperatorProductionCurrentStep; uom: string; disabled: boolean; onValidateLot: (value: string) => Promise<ValidatedMaterialLot>; onSubmit: (lots: ValidatedMaterialLot[], reason: string | null) => void }) {
  const [scanValue, setScanValue] = useState('')
  const [lots, setLots] = useState<ValidatedMaterialLot[]>([])
  const [reason, setReason] = useState('')
  const [scanError, setScanError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
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
  async function scan() { try { setScanError(null); const lot = await onValidateLot(scanValue); if (lots.some((item) => item.lotId === lot.lotId)) { setScanError('LOT sudah ditambahkan.'); return }; setLots((current) => [...current, lot]); setScanValue(''); setPage(Math.ceil((lots.length + 1) / pageSize)) } catch (error) { setScanError(error instanceof Error ? error.message : 'LOT tidak valid.') } }
  const submitDisabled = disabled || !!lotError || !!reasonError
  return <div className="mt-6 space-y-4 rounded-2xl border border-ink/10 p-5"><div className="grid gap-3 sm:grid-cols-[1fr_auto]"><Input value={scanValue} onChange={(event) => setScanValue(event.target.value)} placeholder="Scan QR atau masukkan ID LOT" disabled={disabled} /><Button type="button" onClick={() => void scan()} disabled={disabled || !scanValue.trim()}><ScanLine size={16} />Validasi LOT</Button></div>{scanError ? <p className="text-sm text-red-700">{scanError}</p> : null}
    {lots.length ? <><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b text-left text-xs uppercase text-slate-500"><th className="p-2">LOT</th><th className="p-2">Tersedia</th><th className="p-2">Actual</th><th className="p-2" /></tr></thead><tbody>{visibleLots.map((lot) => <tr key={lot.lotId} className="border-b"><td className="p-2 font-semibold">{lot.lotNumber}</td><td className="p-2">{lot.availableQuantity} {uom}</td><td className="p-2"><Input inputMode="decimal" value={lot.actualQuantity} onChange={(event) => setLots((current) => current.map((item) => item.lotId === lot.lotId ? { ...item, actualQuantity: event.target.value } : item))} disabled={disabled} /></td><td className="p-2"><Button type="button" size="icon" variant="secondary" disabled={disabled} onClick={() => removeLot(lot.lotId)}><Trash2 size={15} /></Button></td></tr>)}</tbody></table></div><MasterDataPagination pagination={{ page, pageSize, totalItems: lots.length, totalPages, hasPreviousPage: page > 1, hasNextPage: page < totalPages }} onPageChange={setPage} /></> : null}
    <div className="rounded-xl bg-sand/45 p-4 text-sm"><div className="grid gap-2 sm:grid-cols-3"><span>Target: <b>{step.targetQuantity} {uom}</b></span><span>Total Actual: <b>{total} {uom}</b></span><span>Variance: <b>{tolerance.variance} {uom}</b></span></div>{tolerance.lowerLimit !== null || tolerance.upperLimit !== null ? <p className="mt-2">Allowed range: {tolerance.lowerLimit ?? '-'} - {tolerance.upperLimit ?? '-'} {uom}</p> : null}</div>
    {requiresDeviation ? <div className="space-y-2 rounded-xl border border-signal/30 bg-signal/10 p-4"><p className="text-sm font-semibold">Actual di luar tolerance. Alasan deviasi wajib sebelum meminta persetujuan supervisor.</p><Textarea value={reason} maxLength={2000} onChange={(event) => setReason(event.target.value)} disabled={disabled} placeholder="Alasan deviasi" />{reasonError ? <p className="text-sm text-red-700">{reasonError}</p> : null}</div> : null}{lotError ? <p className="text-sm text-red-700">{lotError}</p> : null}
    <Button type="button" size="lg" disabled={submitDisabled} onClick={() => onSubmit(lots, requiresDeviation ? reason.trim() : null)}>{requiresDeviation ? 'Request Supervisor Approval' : 'Complete Material Step'}</Button>
  </div>
}
