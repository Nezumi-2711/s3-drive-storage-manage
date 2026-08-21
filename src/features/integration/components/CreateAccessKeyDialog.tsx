import * as React from "react"
import { AlertCircle, KeyRound, X } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateAccessKey } from "../hooks/useCreateAccessKey"
import type { AccessKeyFull } from "../api/integration.types"

interface CreateAccessKeyDialogProps {
  open: boolean
  onClose: () => void
  onCreated: (key: AccessKeyFull) => void
}

export function CreateAccessKeyDialog({ open, onClose, onCreated }: CreateAccessKeyDialogProps) {
  const [label, setLabel] = React.useState("")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const { mutate: create, isPending } = useCreateAccessKey()

  React.useEffect(() => {
    if (open) {
      setLabel("")
      setErrorMessage(null)
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    const trimmed = label.trim()
    if (!trimmed) return

    create(
      { label: trimmed },
      {
        onSuccess: (key) => {
          onClose()
          onCreated(key)
        },
        onError: (err) => {
          setErrorMessage(err.message || "Failed to create access key")
        },
      },
    )
  }

  return (
    <Dialog open={open} onClose={onClose} className="overflow-hidden border-border/80 bg-card/95 backdrop-blur-md shadow-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/60 bg-linear-to-r from-amber-500/5 via-orange-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Create Access Key</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Generate a named key pair for one integration</p>
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
            <Label htmlFor="key-label" className="text-foreground">Label</Label>
            <Input
              id="key-label"
              placeholder="rclone-backup"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={isPending}
              maxLength={32}
              className="bg-background/60 border-border/80 rounded-xl h-10"
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              1-32 characters — letters, numbers, spaces, underscore or hyphen. Name it after the tool that will use it.
            </p>
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
            disabled={isPending || !label.trim()}
            className="h-9 px-4 font-medium shadow-sm shadow-blue-500/25"
          >
            {isPending ? "Creating..." : "Create Key"}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
