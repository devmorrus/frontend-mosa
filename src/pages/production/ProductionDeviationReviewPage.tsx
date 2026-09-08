import { useEffect, useState, type ReactNode } from 'react'
import { ArrowLeft, LoaderCircle, ShieldCheck, ShieldX } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { StatusBadge } from '@/components/common/StatusBadge'
import { productionDeviationsApi } from '@/features/production-deviations/api'
import { ProductionDeviationStatus, type ProductionDeviationDetail } from '@/features/production-deviations/types'
import { validateRejectReason, validateReviewNotes } from '@/features/production-deviations/validation'
import { MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { breadcrumbs, entityLinks } from '@/routes/canonicalRoutes'
import { useAuth } from '@/hooks/useAuth'
import type { ApiError } from '@/types/api'

function date(value: string | null) { return value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-' }
function tolerance(detail: ProductionDeviationDetail) { const material = detail.material; const uom = material.unitOfMeasureSymbol; return material.lowerLimit !== null && material.upperLimit !== null ? `${material.lowerLimit} - ${material.upperLimit} ${uom}` : material.toleranceValue === null ? 'Tidak ada tolerance' : `${material.toleranceValue} ${uom}` }

export function ProductionDeviationReviewPage() {
  const { id } = useParams<{ id: string }>()
  const { can } = useAuth()
  const canReview = can('production-deviations.review')
  const [detail, setDetail] = useState<ProductionDeviationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialog, setDialog] = useState<'approve' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => { if (!id) return; setLoading(true); setError(null); try { setDetail(await productionDeviationsApi.getById(id)) } catch (caught) { setError((caught as ApiError).message) } finally { setLoading(false) } }
  useEffect(() => { void load() }, [id])
  async function decide(action: 'approve' | 'reject') {
    if (!detail) return
    const validation = action === 'reject' ? validateRejectReason(notes) : validateReviewNotes(notes)
    if (validation) return setSubmitError(validation)
    setSubmitting(true); setSubmitError(null)
    try { const updated = action === 'approve' ? await productionDeviationsApi.approve(detail.id, notes) : await productionDeviationsApi.reject(detail.id, notes); setDetail(updated); setDialog(null); setNotes('') } catch (caught) { const apiError = caught as ApiError; setSubmitError(apiError.message); if (apiError.status === 409) void load() } finally { setSubmitting(false) }
  }
  if (loading) return <MasterDataLoadingState description="Memuat konteks deviation dan LOT usage." />
  if (error || !detail) return <MasterDataErrorState description={error ?? 'Deviation tidak ditemukan.'} onRetry={() => void load()} />
  const pending = detail.decision.status === ProductionDeviationStatus.PendingApproval
  const uom = detail.material.unitOfMeasureSymbol
  const canOpenPo = can('production-orders.view')
  const canOpenLot = can('lots.view')
  return <div className="mx-auto max-w-6xl space-y-6">
    <Breadcrumb items={breadcrumbs.deviationDetail(detail.id)} />
    <Button asChild variant="secondary"><Link to="/production/deviations"><ArrowLeft size={16} />Kembali ke Deviation Queue</Link></Button>
    <section className="rounded-[30px] bg-ink px-6 py-7 text-paper sm:px-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">Deviation Review</div><h1 className="mt-3 font-display text-3xl font-semibold">{detail.productionOrder.productionOrderNumber}</h1><p className="mt-2 text-sm text-paper/65">{detail.productionOrder.productCode} - {detail.productionOrder.productName}</p><div className="mt-3 flex flex-wrap gap-2">{canOpenPo ? <Link to={entityLinks.productionOrderDetail(detail.productionOrder.id)} className="rounded-full bg-paper/10 px-4 py-1.5 text-xs font-semibold text-paper underline underline-offset-4 hover:bg-paper/20" data-tour="deviation-link-po">Buka Production Order</Link> : null}</div></div><StatusBadge domain="deviation" value={detail.decision.status} /></div></section>
    <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle>Production Information</CardTitle></CardHeader><CardContent className="grid gap-4 text-sm sm:grid-cols-2"><Info label="Production Order" value={canOpenPo ? <Link to={entityLinks.productionOrderDetail(detail.productionOrder.id)} className="font-medium text-ink underline underline-offset-4">{detail.productionOrder.productionOrderNumber}</Link> : detail.productionOrder.productionOrderNumber} /><Info label="Product" value={`${detail.productionOrder.productCode} - ${detail.productionOrder.productName}`} /><Info label="Recipe" value={`${detail.productionOrder.recipeName} V${detail.productionOrder.recipeVersionNumber}`} /><Info label="Warehouse" value={`${detail.productionOrder.warehouseCode} - ${detail.productionOrder.warehouseName}`} /><Info label="Target Output" value={`${detail.productionOrder.targetOutput} ${detail.productionOrder.unitOfMeasureSymbol ?? detail.productionOrder.unitOfMeasureCode}`} /><Info label="Step" value={`${detail.step.sequence}. ${detail.step.stepName}`} /></CardContent></Card><Card><CardHeader><CardTitle>Material Requirement</CardTitle></CardHeader><CardContent className="grid gap-4 text-sm sm:grid-cols-2"><Info label="Material" value={`${detail.step.rawMaterialCode ?? '-'} - ${detail.step.rawMaterialName ?? '-'}`} /><Info label="Target" value={`${detail.material.targetQuantity} ${uom}`} /><Info label="Tolerance" value={tolerance(detail)} /><Info label="Allowed Range" value={detail.material.lowerLimit !== null && detail.material.upperLimit !== null ? `${detail.material.lowerLimit} - ${detail.material.upperLimit} ${uom}` : '-'} /><div className="sm:col-span-2 rounded-2xl bg-sand/35 p-4 text-slate-700">{detail.step.instruction ?? 'Tidak ada instruksi.'}</div></CardContent></Card></div>
    <Card data-tour="deviation-lot-table"><CardHeader><CardTitle>Actual Usage</CardTitle><CardDescription>Total actual {detail.material.actualQuantity} {uom}; variance {detail.material.varianceQuantity} {uom}.</CardDescription></CardHeader><CardContent className="px-0 pb-0"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{['LOT', 'Supplier LOT', 'Warehouse', 'Expiry', 'Available', 'Actual'].map((label) => <th key={label} className="px-5 py-3">{label}</th>)}</tr></thead><tbody>{detail.lots.map((lot) => <tr key={lot.materialConsumptionId} className="border-t border-slate-100"><td className="px-5 py-4 font-semibold">{canOpenLot ? <Link to={entityLinks.lotDetail(lot.rawMaterialLotId)} className="text-ink underline underline-offset-4">{lot.internalLotNumber}</Link> : lot.internalLotNumber}</td><td className="px-5 py-4">{lot.supplierLot ?? '-'}</td><td className="px-5 py-4">{lot.warehouseCode}</td><td className="px-5 py-4">{date(lot.expiryDate)}</td><td className="px-5 py-4">{lot.availableStock} {uom}</td><td className="px-5 py-4">{lot.proposedActualQuantity} {uom}</td></tr>)}</tbody></table></div></CardContent></Card>
    <div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle>Operator Request</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><Info label="Operator" value={detail.request.operator} /><Info label="Request Time" value={date(detail.request.requestedAtUtc)} /><div className="rounded-2xl bg-sand/35 p-4 leading-6 text-slate-700">{detail.request.reason}</div></CardContent></Card><Card><CardHeader><CardTitle>Decision</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><Info label="Status" value={pending ? 'Menunggu keputusan supervisor' : ''} badge={<StatusBadge domain="deviation" value={detail.decision.status} />} /><Info label="Reviewed By" value={detail.decision.reviewedBy ?? '-'} /><Info label="Reviewed At" value={date(detail.decision.reviewedAtUtc)} />{detail.decision.reviewNotes ? <div className="rounded-2xl bg-sand/35 p-4 leading-6 text-slate-700">{detail.decision.reviewNotes}</div> : null}{pending && canReview ? <div className="flex flex-wrap gap-3 pt-2"><Button data-tour="deviation-approve-btn" onClick={() => { setDialog('approve'); setNotes(''); setSubmitError(null) }}><ShieldCheck size={16} />Approve</Button><Button data-tour="deviation-reject-btn" variant="secondary" onClick={() => { setDialog('reject'); setNotes(''); setSubmitError(null) }}><ShieldX size={16} />Reject</Button></div> : null}</CardContent></Card></div>
    <Dialog open={dialog !== null} onOpenChange={(open) => !submitting && !open && setDialog(null)}><DialogContent><DialogHeader><DialogTitle>{dialog === 'approve' ? 'Approve Deviation?' : 'Reject Deviation?'}</DialogTitle><DialogDescription>{dialog === 'approve' ? 'Actual consumption akan dipost dan inventory akan berkurang berdasarkan quantity aktual.' : 'Operator harus memperbaiki Actual Quantity atau LOT sebelum melanjutkan.'}</DialogDescription></DialogHeader><Textarea disabled={submitting} value={notes} maxLength={2000} onChange={(event) => setNotes(event.target.value)} placeholder={dialog === 'approve' ? 'Review notes (opsional)' : 'Rejection Reason *'} /><div className="text-right text-xs text-slate-400">{notes.length}/2000</div>{submitError ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p> : null}<DialogFooter><Button variant="secondary" disabled={submitting} onClick={() => setDialog(null)}>Batal</Button><Button disabled={submitting} onClick={() => dialog && void decide(dialog)}>{submitting ? <LoaderCircle className="animate-spin" size={16} /> : dialog === 'approve' ? <ShieldCheck size={16} /> : <ShieldX size={16} />}{dialog === 'approve' ? 'Approve' : 'Reject'}</Button></DialogFooter></DialogContent></Dialog>
  </div>
}

function Info({ label, value, badge }: { label: string; value: ReactNode; badge?: ReactNode }) { return <div><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div><div className="mt-1 font-semibold text-ink">{badge ?? value}</div></div> }
