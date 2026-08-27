import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function MasterDataFormDialog({
  open,
  title,
  description,
  onOpenChange,
  onSubmit,
  submitting,
  submitLabel,
  children,
}: {
  open: boolean
  title: string
  description: string
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
  submitting: boolean
  submitLabel: string
  children: ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={submitting}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? 'Menyimpan...' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
