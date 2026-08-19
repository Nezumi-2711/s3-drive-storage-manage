import * as React from "react"
import { cn } from "../../lib/utils"

export interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null)

  React.useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (!dialog.open) {
        dialog.showModal()
      }
    } else {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [open])

  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault()
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className={cn(
        "backdrop:bg-background/80 backdrop:backdrop-blur-sm p-0 rounded-2xl bg-card border border-border/80 text-card-foreground shadow-2xl max-w-md w-full m-auto focus:outline-hidden",
        "open:animate-in open:fade-in-0 open:zoom-in-95",
        className,
      )}
    >
      {open ? children : null}
    </dialog>
  )
}
