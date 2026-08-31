import { useState } from 'react'
import { AlertTriangle, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { type ProductionOrderFormErrors } from '@/features/production-orders/validation'

interface ProductionOrderCancelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => Promise<void>
  productionOrderNumber: string
}

export function ProductionOrderCancelDialog({
  open,
  onOpenChange,
  onConfirm,
  productionOrderNumber,
}: ProductionOrderCancelDialogProps) {
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState<ProductionOrderFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleConfirm() {
    const newErrors: ProductionOrderFormErrors = {}
    if (!reason.trim()) {
      newErrors.reason = ['Alasan pembatalan wajib diisi.']
    }
    if (reason.trim().length > 500) {
      newErrors.reason = ['Alasan pembatalan maksimal 500 karakter.']
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm(reason.trim())
      setReason('')
      setErrors({})
      onOpenChange(false)
    } catch {
      // error handled by parent
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setReason('')
      setErrors({})
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
              <AlertTriangle size={20} className="text-rose-600" />
            </div>
            <div>
              <DialogTitle>Batalkan Production Order</DialogTitle>
              <DialogDescription className="mt-1">
                {productionOrderNumber}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Alasan Pembatalan <span className="text-rose-500">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              if (errors.reason) {
                setErrors((current) => {
                  const next = { ...current }
                  delete next.reason
                  return next
                })
              }
            }}
            placeholder="Masukkan alasan pembatalan..."
            rows={3}
            className="rounded-2xl"
          />
          {errors.reason ? (
            <p className="text-xs text-rose-500">{errors.reason[0]}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            variant="secondary"
            className="bg-rose-600 text-white hover:bg-rose-700"
            onClick={() => void handleConfirm()}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoaderCircle size={16} className="mr-2 animate-spin" />
            ) : null}
            Batalkan PO
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
