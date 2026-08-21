import { AlertTriangle, CheckCircle2, KeyRound, X } from "lucide-react"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import type { AccessKeyFull } from "../api/integration.types"

interface NewKeyResultDialogProps {
  open: boolean
  onClose: () => void
  /** The fresh pair — or the new key plus the caller-provided secret for a rotation. */
  created?: AccessKeyFull
  title: string
}

/**
 * Shows a freshly minted key pair with copy buttons. The secret cannot be shown again
 * after this dialog closes (except via Reveal).
 */
export function NewKeyResultDialog({ open, onClose, created, title }: NewKeyResultDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} className="overflow-hidden border-border/80 bg-card/95 backdrop-blur-md shadow-2xl">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/60 bg-linear-to-r from-emerald-500/5 via-teal-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">{title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Copy the secret now — store it in your tool's config</p>
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
          {created && (
            <>
              <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-1">
                <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                    Access Key ID
                  </span>
                  <CopyButton value={created.accessKeyId} />
                </div>
                <code className="font-mono text-xs text-foreground/90 break-all">{created.accessKeyId}</code>
              </div>

              <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-1">
                <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Secret Access Key</span>
                  <CopyButton value={created.secretAccessKey} />
                </div>
                <code className="font-mono text-xs text-foreground/90 break-all">{created.secretAccessKey}</code>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Label <span className="font-semibold">{created.label}</span>
                  {created.expiresAt && (
                    <>
                      {" "}— the previous key stops working after its grace period (up to 60s of edge-cache lag applies)
                    </>
                  )}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 p-4 sm:px-6 bg-muted/30 border-t border-border/60">
          <Button type="button" size="sm" onClick={onClose} className="h-9 px-4 font-medium shadow-sm shadow-blue-500/25">
            Done
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
