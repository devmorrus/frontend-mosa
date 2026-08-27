import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function MasterDataStatusDialog({
  open,
  entityLabel,
  nextStatusLabel,
  onOpenChange,
  onConfirm,
  submitting,
}: {
  open: boolean
  entityLabel: string
  nextStatusLabel: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  submitting: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ubah status {entityLabel}</DialogTitle>
          <DialogDescription>
            Data ini akan diubah menjadi <strong>{nextStatusLabel}</strong>. Perubahan ini tidak
            menghapus data dan tetap dapat dibalik nanti.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={submitting}>
            Batal
          </Button>
          <Button onClick={onConfirm} disabled={submitting}>
            {submitting ? 'Memproses...' : `Ya, ubah ke ${nextStatusLabel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
