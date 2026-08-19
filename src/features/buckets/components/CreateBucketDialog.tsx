import * as React from "react"
import { Dialog } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Switch } from "../../../components/ui/switch"
import { useCreateBucket } from "../hooks/useCreateBucket"
import { AlertCircle, FolderPlus, X } from "lucide-react"

interface CreateBucketDialogProps {
  open: boolean
  onClose: () => void
}

export function CreateBucketDialog({ open, onClose }: CreateBucketDialogProps) {
  const [name, setName] = React.useState("")
  const [publicRead, setPublicRead] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const { mutate: create, isPending } = useCreateBucket()

  React.useEffect(() => {
    if (open) {
      setName("")
      setPublicRead(false)
      setErrorMessage(null)
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    const trimmed = name.trim()
    if (!trimmed) return

    create(
      { name: trimmed, publicRead },
      {
        onSuccess: () => {
          onClose()
        },
        onError: (err) => {
          setErrorMessage(err.message || "Failed to create bucket")
        },
      },
    )
  }

  return (
    <Dialog open={open} onClose={onClose} className="overflow-hidden border-border/80 bg-card/95 backdrop-blur-md shadow-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/60 bg-linear-to-r from-emerald-500/5 via-teal-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Create Bucket</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Create a new storage bucket under root folder</p>
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

        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2.5 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="bucket-name" className="text-foreground">Bucket Name</Label>
            <Input
              id="bucket-name"
              placeholder="my-new-bucket"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              className="bg-background/60 border-border/80 rounded-xl h-10"
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              3-63 lowercase alphanumeric characters and hyphens.
            </p>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-background/50 border border-border/70 shadow-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-foreground">Public Read</span>
              <span className="text-[11px] text-muted-foreground">Allow unauthenticated GET / HEAD requests</span>
            </div>
            <Switch
              checked={publicRead}
              onCheckedChange={setPublicRead}
              disabled={isPending}
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
            size="sm"
            disabled={isPending || !name.trim()}
            className="h-9 px-4 font-medium shadow-sm shadow-blue-500/25 gap-1.5"
          >
            {isPending ? "Creating..." : "Create Bucket"}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
