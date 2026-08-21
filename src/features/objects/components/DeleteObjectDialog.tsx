import { Trash2, X, AlertCircle } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Dialog } from "../../../components/ui/dialog"
import { useDeleteObject } from "../hooks/useDeleteObject"

interface DeleteObjectDialogProps {
  bucket: string
  currentPrefix: string
  objectKey: string | null
  open: boolean
  onClose: () => void
}

export function DeleteObjectDialog({
  bucket,
  currentPrefix,
  objectKey,
  open,
  onClose,
}: DeleteObjectDialogProps) {
  const deleteMutation = useDeleteObject(bucket, currentPrefix)

  if (!objectKey) return null
  const filename = objectKey.split("/").filter(Boolean).pop() || objectKey

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(objectKey)
      onClose()
    } catch {
      // Error handled by mutation state
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="overflow-hidden border-border/80 bg-card/95 backdrop-blur-md shadow-2xl">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/60 bg-linear-to-r from-rose-500/5 via-red-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Delete Object</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Permanently remove this file from Google Drive</p>
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
          <p className="text-sm text-foreground">
            Are you sure you want to delete{" "}
            <span className="font-mono text-xs font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">
              {filename}
            </span>
            ?
          </p>

          {deleteMutation.isError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2.5 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{deleteMutation.error?.message || "Failed to delete object"}</span>
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Object"}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
