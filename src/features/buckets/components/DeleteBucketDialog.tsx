import * as React from "react"
import { Dialog } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { useDeleteBucket } from "../hooks/useDeleteBucket"
import { AlertCircle, AlertTriangle, X } from "lucide-react"

interface DeleteBucketDialogProps {
  open: boolean
  onClose: () => void
  bucketName: string | null
}

export function DeleteBucketDialog({ open, onClose, bucketName }: DeleteBucketDialogProps) {
  const [confirmation, setConfirmation] = React.useState("")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const { mutate: deleteMutate, isPending } = useDeleteBucket()

  React.useEffect(() => {
    if (open) {
      setConfirmation("")
      setErrorMessage(null)
    }
  }, [open])

  if (!bucketName) return null

  const isConfirmed = confirmation === bucketName

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConfirmed) return

    setErrorMessage(null)
    deleteMutate(bucketName, {
      onSuccess: () => {
        onClose()
      },
      onError: (err) => {
        setErrorMessage(err.message || "Failed to delete bucket")
      },
    })
  }

  return (
    <Dialog open={open} onClose={onClose} className="overflow-hidden border-border/80 bg-card/95 backdrop-blur-md shadow-2xl">
      <form onSubmit={handleDelete} className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/60 bg-linear-to-r from-red-500/5 via-rose-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Delete Bucket</h2>
              <p className="text-xs text-muted-foreground mt-0.5">This action will move the bucket folder to Drive trash</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2.5 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-destructive/5 border border-destructive/15 text-xs text-muted-foreground flex flex-col gap-1">
            <p>
              Only <strong className="text-foreground font-semibold">empty buckets</strong> can be deleted. If objects exist, the deletion will be rejected.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-bucket-name" className="text-foreground">
              Type <span className="font-mono font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-md border border-destructive/20">{bucketName}</span> to confirm:
            </Label>
            <Input
              id="confirm-bucket-name"
              placeholder={bucketName}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              disabled={isPending}
              className="bg-background/60 border-border/80 rounded-xl h-10 font-mono text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 p-4 sm:px-6 bg-muted/30 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
            className="h-9 px-3.5 font-medium border-border/80 bg-background/70 hover:bg-muted/80 shadow-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={!isConfirmed || isPending}
            className="h-9 px-4 font-medium"
          >
            {isPending ? "Deleting..." : "Delete Bucket"}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
