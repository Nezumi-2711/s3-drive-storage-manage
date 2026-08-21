import { useState } from "react"
import { AlertTriangle, Trash2, X, AlertCircle } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Dialog } from "../../../components/ui/dialog"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { useDeleteFolder } from "../hooks/useDeleteFolder"

interface DeleteFolderDialogProps {
  bucket: string
  currentPrefix: string
  folderPrefix: string | null
  folderName: string | null
  open: boolean
  onClose: () => void
}

export function DeleteFolderDialog({
  bucket,
  currentPrefix,
  folderPrefix,
  folderName,
  open,
  onClose,
}: DeleteFolderDialogProps) {
  const [confirmName, setConfirmName] = useState("")
  const [isNonEmptyError, setIsNonEmptyError] = useState(false)
  const [forceRecursive, setForceRecursive] = useState(false)
  const deleteMutation = useDeleteFolder(bucket, currentPrefix)

  if (!folderPrefix || !folderName) return null

  const handleClose = () => {
    setConfirmName("")
    setIsNonEmptyError(false)
    setForceRecursive(false)
    onClose()
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        prefix: folderPrefix,
        recursive: forceRecursive,
      })
      handleClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes("not empty") || msg.includes("409")) {
        setIsNonEmptyError(true)
      }
    }
  }

  const isConfirmed = confirmName === folderName

  return (
    <Dialog open={open} onClose={handleClose} className="overflow-hidden border-border/80 bg-card/95 backdrop-blur-md shadow-2xl">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/60 bg-linear-to-r from-rose-500/5 via-red-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Delete Folder</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Move folder to Drive trash</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isNonEmptyError ? (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Folder is not empty</span>
              </div>
              <p className="text-muted-foreground">
                To recursively move this folder and all its contents to Google Drive Trash, please type the folder name{" "}
                <span className="font-mono font-bold text-foreground">{folderName}</span> below:
              </p>
              <div className="space-y-1">
                <Label htmlFor="confirm-folder" className="sr-only">
                  Confirm folder name
                </Label>
                <Input
                  id="confirm-folder"
                  value={confirmName}
                  onChange={(e) => {
                    setConfirmName(e.target.value)
                    if (e.target.value === folderName) {
                      setForceRecursive(true)
                    }
                  }}
                  placeholder={folderName}
                  autoFocus
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground">
              Are you sure you want to delete folder{" "}
              <span className="font-mono text-xs font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded">
                {folderName}
              </span>
              ?
            </p>
          )}

          {deleteMutation.isError && !isNonEmptyError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2.5 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{deleteMutation.error?.message || "Failed to delete folder"}</span>
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={
              deleteMutation.isPending ||
              (isNonEmptyError && !isConfirmed)
            }
          >
            {deleteMutation.isPending
              ? "Deleting..."
              : isNonEmptyError
              ? "Delete Folder & Contents"
              : "Delete Folder"}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
