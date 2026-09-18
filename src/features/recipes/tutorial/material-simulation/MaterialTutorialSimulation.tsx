import { PackagePlus, ScanLine, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import { MAX_SIMULATED_LOTS, validateMaterialSimulation } from '@/features/recipes/tutorial/material-simulation/validation'
import type { MaterialSimulationSeed } from '@/features/recipes/tutorial/material-simulation/types'
import { RecipeToleranceType, type GuidedRecipeTutorialStep } from '@/features/recipes/types'
import { useRecipeTutorialStore } from '@/features/recipes/tutorial/recipeTutorialStore'

function toleranceLabel(type: RecipeToleranceType | null, value: number | null, uom: string) {
  if (!type || type === RecipeToleranceType.None) return 'Tidak ada batas tolerance backend. Total Actual apapun diterima.'
  if (value === null) return 'Total Actual harus tepat sama dengan target.'
  if (type === RecipeToleranceType.PlusMinus) return `Total Actual harus berada dalam ±${value} ${uom}.`
  return type === RecipeToleranceType.Min ? `Total Actual minimal target - ${value} ${uom}.` : `Total Actual maksimal target + ${value} ${uom}.`
}

export function MaterialTutorialSimulation({ step, userId }: { step: GuidedRecipeTutorialStep; userId: string }) {
  const progress = useRecipeTutorialStore((state) => state.progress)
  const scanMaterialLot = useRecipeTutorialStore((state) => state.scanMaterialLot)
  const addMaterialLot = useRecipeTutorialStore((state) => state.addMaterialLot)
  const updateMaterialActual = useRecipeTutorialStore((state) => state.updateMaterialActual)
  const removeMaterialLot = useRecipeTutorialStore((state) => state.removeMaterialLot)
  const setMaterialLotPage = useRecipeTutorialStore((state) => state.setMaterialLotPage)
  const setDeviationSimulation = useRecipeTutorialStore((state) => state.setDeviationSimulation)
  const [reason, setReason] = useState('')
  const targetQuantity = step.targetQuantity ?? 0
  const uom = step.unitOfMeasure?.symbol ?? step.unitOfMeasure?.code ?? ''
  const seed: MaterialSimulationSeed = { stepId: step.recipeStepId, sequence: step.sequence, materialCode: step.rawMaterial?.code ?? '', materialName: step.rawMaterial?.name ?? 'Material', targetQuantity }
  const state = progress?.materialSimulations[step.recipeStepId]
  const validation = validateMaterialSimulation(state, step.targetQuantity, step.toleranceType, step.toleranceValue)
  const deviation = progress?.deviationSimulations[step.recipeStepId]
  const hasValidLots = !!state?.lots.length && Object.keys(validation.lotErrors).length === 0
  const isOutsideTolerance = hasValidLots && !validation.isReady
  const pageLots = (state?.lots ?? []).slice((validation.pagination.page - 1) * validation.pagination.pageSize, validation.pagination.page * validation.pagination.pageSize)

  return <div className="space-y-5">
    <div className="rounded-2xl border border-signal/30 bg-signal/10 p-4 text-sm text-ink">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-signal-deep">Simulasi / Tutorial</div>
      <p className="mt-2 leading-6">Tidak ada stock, material consumption, stock movement, atau production order yang diubah dari langkah ini.</p>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-ink/10 p-4"><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Material</div><div className="mt-2 text-xl font-semibold text-ink">{seed.materialName}</div></div>
      <div className="rounded-2xl border border-ink/10 p-4"><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Target</div><div className="mt-2 text-2xl font-semibold text-ink">{targetQuantity} {uom}</div><div className="mt-1 text-xs text-slate-500">{toleranceLabel(step.toleranceType, step.toleranceValue, uom)}</div></div>
    </div>

    <div className="rounded-2xl bg-sand/35 p-5"><div className="font-semibold text-ink">Pada Production sebenarnya</div><ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-slate-600"><li>Scan QR pada LOT bahan.</li><li>Pastikan material yang muncul sesuai.</li><li>Masukkan Actual Quantity.</li><li>Tambah LOT jika quantity LOT pertama kurang.</li><li>Pastikan Total Actual memenuhi kebutuhan.</li><li>Complete Material Step.</li></ol></div>

    {!state?.lots.length ? <Button type="button" size="lg" onClick={() => scanMaterialLot(userId, seed)}><ScanLine size={18} />Simulasikan Scan LOT</Button> : <>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="font-semibold text-ink">LOT simulasi valid</div><p className="mt-1 text-sm text-slate-500">Gunakan satu atau beberapa LOT untuk memenuhi target.</p></div><Button type="button" variant="secondary" disabled={state.lots.length >= MAX_SIMULATED_LOTS} onClick={() => addMaterialLot(userId, seed)}><PackagePlus size={16} />Tambah LOT Simulasi</Button></div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">LOT</th><th className="px-4 py-3">Availability</th><th className="px-4 py-3">Actual Quantity</th><th className="px-4 py-3" /></tr></thead><tbody>{pageLots.map((lot, index) => <tr key={lot.id} className="border-t border-slate-100"><td className="px-4 py-4"><div className="font-semibold text-ink">{lot.lotCode}</div><div className="mt-1 text-xs text-blue-700">Valid: {lot.materialName}</div></td><td className="px-4 py-4 text-slate-600">{lot.availableQuantity} {uom}</td><td className="px-4 py-3"><Input value={lot.actualQuantity} inputMode="decimal" placeholder={`Contoh: ${targetQuantity}`} onChange={(event) => updateMaterialActual(userId, step.recipeStepId, lot.id, event.target.value)} aria-label={`Actual Quantity ${lot.lotCode}`} />{validation.lotErrors[lot.id] ? <p className="mt-1 text-xs text-red-700">{validation.lotErrors[lot.id]}</p> : null}</td><td className="px-4 py-3">{index + (validation.pagination.page - 1) * validation.pagination.pageSize > 0 ? <Button type="button" size="icon" variant="secondary" onClick={() => removeMaterialLot(userId, step.recipeStepId, lot.id)} aria-label={`Hapus ${lot.lotCode}`}><Trash2 size={16} /></Button> : null}</td></tr>)}</tbody></table></div>
      <MasterDataPagination pagination={validation.pagination} onPageChange={(page) => setMaterialLotPage(userId, step.recipeStepId, page)} />
      <div className={`rounded-2xl border p-4 ${validation.isReady || deviation?.status === 'APPROVED' ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}><div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Actual</div><div className="mt-1 text-2xl font-semibold text-ink">{validation.totalActual} {uom}</div></div><div className="text-right text-sm text-slate-600">Target: {targetQuantity} {uom}<br />Variance: {validation.variance} {uom}</div></div>{validation.message ? <p className="mt-3 text-sm text-amber-800">{validation.message}</p> : <p className="mt-3 text-sm text-blue-800">Pada produksi sebenarnya, Actual Quantity ini menjadi dasar pengurangan stock.</p>}</div>
      {isOutsideTolerance ? <TutorialDeviationPanel deviation={deviation} reason={reason} onReasonChange={setReason} onRequest={() => setDeviationSimulation(userId, step.recipeStepId, { status: 'REQUESTED', reason: reason.trim(), updatedAt: new Date().toISOString(), reviewNotes: null })} onApprove={() => setDeviationSimulation(userId, step.recipeStepId, { status: 'APPROVED', reason: deviation?.reason ?? '', updatedAt: new Date().toISOString(), reviewNotes: 'Simulasi disetujui supervisor.' })} onReject={() => setDeviationSimulation(userId, step.recipeStepId, { status: 'REJECTED', reason: deviation?.reason ?? '', updatedAt: new Date().toISOString(), reviewNotes: 'Perbaiki Actual Quantity atau LOT simulasi.' })} /> : null}
    </>}
  </div>
}

function TutorialDeviationPanel({ deviation, reason, onReasonChange, onRequest, onApprove, onReject }: { deviation: { status: string; reason: string; reviewNotes: string | null } | undefined; reason: string; onReasonChange: (value: string) => void; onRequest: () => void; onApprove: () => void; onReject: () => void }) {
  if (deviation?.status === 'REQUESTED') return <div className="rounded-2xl border border-signal/30 bg-signal/10 p-4"><p className="font-semibold text-ink">Menunggu approval simulasi</p><p className="mt-1 text-sm text-slate-700">Pada produksi nyata, stok dan step berikutnya akan terkunci hingga supervisor memutuskan.</p><div className="mt-3 flex flex-wrap gap-2"><Button type="button" onClick={onApprove}>Simulasikan Approved</Button><Button type="button" variant="secondary" onClick={onReject}>Simulasikan Rejected</Button></div></div>
  if (deviation?.status === 'APPROVED') return <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"><b>Simulasi approved.</b> Actual ini menjadi dasar pengurangan stock pada production nyata, tetapi tutorial tidak membuat transaksi.</div>
  if (deviation?.status === 'REJECTED') return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><b>Simulasi rejected.</b> {deviation.reviewNotes} Ubah quantity/LOT lalu request kembali.</div>
  return <div className="rounded-2xl border border-signal/30 bg-signal/10 p-4"><p className="font-semibold text-ink">Actual di luar tolerance</p><p className="mt-1 text-sm text-slate-700">Pada production nyata, supervisor perlu menyetujui deviasi sebelum material dipost.</p><Input className="mt-3" value={reason} maxLength={2000} onChange={(event) => onReasonChange(event.target.value)} placeholder="Alasan deviasi simulasi" /><Button className="mt-3" type="button" disabled={!reason.trim()} onClick={onRequest}>Simulasikan Request Approval</Button></div>
}
