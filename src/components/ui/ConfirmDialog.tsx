import { AlertTriangle, Info } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export type ConfirmDialogProps = {
  open: boolean
  onClose: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'primary' | 'danger'
  pending?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  pending = false,
  onConfirm,
}: ConfirmDialogProps) {
  const isDanger = confirmVariant === 'danger'

  function handleClose() {
    if (pending) return
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      showCloseButton={!pending}
      overlayStackClassName="z-[110]"
      className={cn(
        'max-w-[440px] shadow-2xl shadow-black/50',
        isDanger ? 'ring-1 ring-rose-400/25' : 'ring-1 ring-[rgba(215,182,97,0.22)]',
      )}
    >
      <div className="space-y-5">
        <div className="flex justify-center pt-1">
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-2xl ring-1',
              isDanger
                ? 'bg-rose-500/12 ring-rose-400/35'
                : 'bg-[linear-gradient(135deg,rgba(215,182,97,0.15),rgba(215,182,97,0.06))] ring-[rgba(215,182,97,0.35)]',
            )}
            aria-hidden
          >
            {isDanger ? (
              <AlertTriangle className="h-8 w-8 text-rose-200/95" strokeWidth={1.75} />
            ) : (
              <Info className="h-8 w-8 text-(--gold)" strokeWidth={1.75} />
            )}
          </div>
        </div>

        <p className="text-center text-sm leading-relaxed text-white/72">{description}</p>

        <div className="flex flex-col-reverse gap-2 border-t border-white/10 pt-5 sm:flex-row sm:justify-end sm:gap-3">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={pending} className="sm:min-w-30">
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant === 'primary' ? 'primary' : 'danger'}
            onClick={onConfirm}
            disabled={pending}
            className="sm:min-w-30"
          >
            {pending ? 'Please wait…' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
