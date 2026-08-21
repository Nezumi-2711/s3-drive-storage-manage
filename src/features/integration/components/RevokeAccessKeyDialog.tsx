import * as React from "react"
import { AlertCircle, AlertTriangle, Trash2, X } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRevokeAccessKey } from "../hooks/useRevokeAccessKey"
import type { AccessKeyMetadata } from "../api/integration.types"

interface RevokeAccessKeyDialogProps {
  open: boolean
  onClose: () => void
  accessKey?: AccessKeyMetadata | null
  isLastKey: boolean
}

export function RevokeAccessKeyDialog({ open, onClose, accessKey, isLastKey }: RevokeAccessKeyDialogProps) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const { mutate: revoke, isPending } = useRevokeAccessKey()

  React.useEffect(() => {
    if (open) {
      setErrorMessage(null)
    }
  }, [open])

  const handleRevoke = () => {
    if (!accessKey) return
    setErrorMessage(null)
    revoke(accessKey.accessKeyId, {
      onSuccess: onClose,
      onError: (err) => {
        setErrorMessage(err.message || "Failed to revoke access key")
      },
    })
  }

  return (
    <Dialog open={open} onClose={onClose} className="overflow-hidden border-border/80 bg-card/95 backdrop-blur-md shadow-2xl">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/60 bg-linear-to-r from-rose-500/5 via-red-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Revoke Access Key</h2>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[260px]">
                {accessKey ? `Permanently delete "${accessKey.label}"` : "Permanently delete key"}
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
          {errorMessage && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2.5 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              This cannot be undone
            </p>
            <p className="text-[11px] text-rose-600/90 dark:text-rose-400/90">
              Every client using this key pair will receive <code className="font-mono">403 AccessDenied</code> within
              60 seconds (edge-cache propagation).
            </p>
          </div>

          {isLastKey && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                This is your last key
              </p>
              <p className="text-[11px] text-amber-600/90 dark:text-amber-400/90">
                Deleting it locks out <span className="font-semibold">all</span> S3 clients until a new key is created
                from this page.
              </p>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">
            If you only want to change the secret, use <span className="font-semibold">Rotate</span> instead — it keeps
            clients working during a grace period.
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
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRevoke}
            disabled={isPending}
            className="h-9 px-4 font-medium"
          >
            {isPending ? "Revoking..." : "Revoke Key"}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
