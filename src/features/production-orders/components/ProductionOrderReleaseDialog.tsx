import { useState } from 'react'
import { LoaderCircle, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ProductionOrderReleaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  productionOrderNumber: string
  summary: string
}

export function ProductionOrderReleaseDialog({
  open,
  onOpenChange,
  onConfirm,
  productionOrderNumber,
  summary,
}: ProductionOrderReleaseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setIsSubmitting(true)
    setError(null)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Release gagal. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !isSubmitting && onOpenChange(value)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket size={18} />
            Release {productionOrderNumber}?
          </DialogTitle>
          <DialogDescription>
            Production order akan berubah menjadi Released dan masuk antrean operator. {summary}
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <DialogFooter>
          <Button variant="secondary" disabled={isSubmitting} onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button disabled={isSubmitting} onClick={() => void handleConfirm()}>
            {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : null}
            {isSubmitting ? 'Me-release...' : 'Ya, Release'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
