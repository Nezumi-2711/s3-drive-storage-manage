import { AlertCircle, CheckCircle2, RefreshCw, X } from "lucide-react"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Progress } from "../../../components/ui/progress"
import { formatBytes } from "../../../lib/format"
import type { UploadItem } from "../lib/upload-manager"

interface UploadQueuePanelProps {
  uploads: UploadItem[]
  onCancel: (id: string) => void
  onRetry: (id: string) => void
  onClearFinished: () => void
}

export function UploadQueuePanel({
  uploads,
  onCancel,
  onRetry,
  onClearFinished,
}: UploadQueuePanelProps) {
  if (uploads.length === 0) return null

  const hasFinished = uploads.some(
    (u) => u.status === "done" || u.status === "error" || u.status === "canceled"
  )

  return (
    <div className="border border-border/70 rounded-lg bg-card p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <span>Upload Queue</span>
          <Badge variant="outline" className="text-xs">
            {uploads.length}
          </Badge>
        </h4>
        {hasFinished && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFinished}
            className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            Clear Completed
          </Button>
        )}
      </div>

      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {uploads.map((item) => {
          const filename = item.file.name
          const isDone = item.status === "done"
          const isError = item.status === "error"
          const isCanceled = item.status === "canceled"
          const isUploading = item.status === "uploading" || item.status === "initiating" || item.status === "completing"

          return (
            <div
              key={item.id}
              className="p-2.5 rounded border border-border/50 bg-background/50 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 truncate">
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                  {isError && <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />}
                  {isUploading && <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />}
                  <span className="font-medium truncate text-foreground">{filename}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-muted-foreground">
                    {formatBytes(item.bytesUploaded)} / {formatBytes(item.size)}
                  </span>
                  {isUploading && (
                    <button
                      type="button"
                      onClick={() => onCancel(item.id)}
                      className="text-muted-foreground hover:text-foreground p-0.5 rounded"
                      title="Cancel upload"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {(isError || isCanceled) && (
                    <button
                      type="button"
                      onClick={() => onRetry(item.id)}
                      className="text-primary hover:underline p-0.5 rounded text-[11px]"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>

              {isUploading && (
                <div className="space-y-1">
                  <Progress value={item.progress} className="h-1.5" />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>
                      {item.status === "initiating" && "Initializing upload session..."}
                      {item.status === "completing" && "Finalizing multipart upload..."}
                      {item.status === "uploading" &&
                        (item.totalParts
                          ? `Uploading part ${item.currentPart || 1} of ${item.totalParts}...`
                          : "Uploading...")}
                    </span>
                    <span>{item.progress}%</span>
                  </div>
                </div>
              )}

              {isError && (
                <p className="text-[11px] text-destructive truncate">
                  {item.errorMessage || "Upload failed"}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
