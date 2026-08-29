import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MasterDataFormFieldError } from '@/features/master-data/components/MasterDataFormFieldError'

interface RecipeApprovalDecisionDialogProps {
  open: boolean
  mode: 'approve' | 'reject'
  recipeLabel: string
  value: string
  error: string | null
  submitting: boolean
  onValueChange: (value: string) => void
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
}

export function RecipeApprovalDecisionDialog({
  open,
  mode,
  recipeLabel,
  value,
  error,
  submitting,
  onValueChange,
  onOpenChange,
  onSubmit,
}: RecipeApprovalDecisionDialogProps) {
  const isReject = mode === 'reject'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isReject ? 'Reject Recipe Version' : 'Approve Recipe Version'}</DialogTitle>
          <DialogDescription>
            {isReject
              ? `Tuliskan alasan revisi untuk ${recipeLabel}. Reason wajib diisi sebelum version dikembalikan ke supervisor produksi.`
              : `Tambahkan catatan approval opsional untuk ${recipeLabel} sebelum version diaktifkan.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isReject ? (
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Reject Reason</label>
              <Textarea
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                className="min-h-[140px]"
                placeholder="Contoh: tambahkan final QC check setelah proses mixing"
              />
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Approval Notes</label>
              <Input
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                placeholder="Opsional"
              />
            </div>
          )}
          <MasterDataFormFieldError message={error} />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={submitting || (isReject && !value.trim())}
          >
            {submitting ? <LoaderCircle size={16} className="animate-spin" /> : null}
            {isReject ? 'Reject Version' : 'Approve Version'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
