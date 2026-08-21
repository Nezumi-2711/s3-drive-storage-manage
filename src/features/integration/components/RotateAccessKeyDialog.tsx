import * as React from "react"
import { AlertCircle, RotateCw, X } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRotateAccessKey } from "../hooks/useRotateAccessKey"
import { GRACE_OPTIONS } from "../lib/grace-options"
import type { AccessKeyMetadata, GraceSeconds, RotateAccessKeyResponse } from "../api/integration.types"

interface RotateAccessKeyDialogProps {
  open: boolean
  onClose: () => void
  accessKey?: AccessKeyMetadata | null
  onRotated: (result: RotateAccessKeyResponse) => void
}

export function RotateAccessKeyDialog({ open, onClose, accessKey, onRotated }: RotateAccessKeyDialogProps) {
  const [graceSeconds, setGraceSeconds] = React.useState<GraceSeconds>(86400)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const { mutate: rotate, isPending } = useRotateAccessKey()

  React.useEffect(() => {
    if (open) {
      setGraceSeconds(86400)
      setErrorMessage(null)
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessKey) return
    setErrorMessage(null)

    rotate(
      { accessKeyId: accessKey.accessKeyId, graceSeconds },
      {
        onSuccess: (result) => {
          onClose()
          onRotated(result)
        },
        onError: (err) => {
          setErrorMessage(err.message || "Failed to rotate access key")
        },
      },
    )
  }

  return (
    <Dialog open={open} onClose={onClose} className="overflow-hidden border-border/80 bg-card/95 backdrop-blur-md shadow-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/60 bg-linear-to-r from-blue-500/5 via-indigo-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-xs">
              <RotateCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Rotate Access Key</h2>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[260px]">
                {accessKey ? `Replace "${accessKey.label}" with a new secret` : "Replace key"}
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

        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2.5 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-foreground">How long should the old key keep working?</span>
            <div className="space-y-2">
              {GRACE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    graceSeconds === option.value
                      ? "border-blue-500/40 bg-blue-500/10"
                      : "border-border/70 bg-background/50 hover:bg-muted/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="grace-period"
                    value={option.value}
                    checked={graceSeconds === option.value}
                    onChange={() => setGraceSeconds(option.value)}
                    disabled={isPending}
                    className="mt-0.5 accent-blue-600"
                  />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-foreground">{option.label}</span>
                    <span className="block text-[11px] text-muted-foreground">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            The replacement carries the same label. Changes propagate within 60 seconds due to edge caching.
          </p>
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
          <Button type="submit" size="sm" disabled={isPending} className="h-9 px-4 font-medium shadow-sm shadow-blue-500/25">
            {isPending ? "Rotating..." : "Rotate Key"}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
