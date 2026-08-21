import { useState } from "react"
import { FolderPlus, X } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Dialog } from "../../../components/ui/dialog"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { useCreateFolder } from "../hooks/useCreateFolder"

interface CreateFolderDialogProps {
  bucket: string
  currentPrefix: string
  open: boolean
  onClose: () => void
}

export function CreateFolderDialog({
  bucket,
  currentPrefix,
  open,
  onClose,
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const createFolderMutation = useCreateFolder(bucket, currentPrefix)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmed = folderName.trim()
    if (!trimmed) {
      setError("Folder name is required")
      return
    }

    if (trimmed.includes("/")) {
      setError("Folder name cannot contain '/'")
      return
    }

    const fullPrefix = `${currentPrefix}${trimmed}/`

    try {
      await createFolderMutation.mutateAsync({
        bucket,
        prefix: fullPrefix,
      })
      setFolderName("")
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create folder")
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className="overflow-hidden border-border/80 bg-card/95 backdrop-blur-md shadow-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/60 bg-linear-to-r from-blue-500/5 via-indigo-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-xs">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Create Folder</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                In <span className="font-mono font-semibold text-foreground">{currentPrefix || "/"}</span>
              </p>
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              placeholder="e.g. photos, reports, 2026"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              autoFocus
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="p-6 pt-0 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={createFolderMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createFolderMutation.isPending}>
            {createFolderMutation.isPending ? "Creating..." : "Create Folder"}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
