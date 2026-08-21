import { useState } from "react"
import { FolderPlus, RefreshCw } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Skeleton } from "../../../components/ui/skeleton"
import { useObjects } from "../hooks/useObjects"
import { useUploadQueue } from "../hooks/useUploadQueue"
import { downloadObject } from "../lib/download"
import { CreateFolderDialog } from "./CreateFolderDialog"
import { DeleteFolderDialog } from "./DeleteFolderDialog"
import { DeleteObjectDialog } from "./DeleteObjectDialog"
import { ObjectBreadcrumb } from "./ObjectBreadcrumb"
import { ObjectTable } from "./ObjectTable"
import { UploadDropzone } from "./UploadDropzone"
import { UploadQueuePanel } from "./UploadQueuePanel"

interface ObjectBrowserProps {
  bucket: string
  prefix: string
  onNavigatePrefix: (prefix: string) => void
}

export function ObjectBrowser({ bucket, prefix, onNavigatePrefix }: ObjectBrowserProps) {
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [deleteObjectTarget, setDeleteObjectTarget] = useState<string | null>(null)
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<{ prefix: string; name: string } | null>(null)

  const { data, isLoading, isError, error, refetch, isRefetching } = useObjects(bucket, prefix)
  const { uploads, addFiles, cancelUpload, retryUpload, clearFinished } = useUploadQueue(bucket, prefix)

  const handleDownload = async (key: string) => {
    try {
      await downloadObject(bucket, key, true)
    } catch (err) {
      console.error("Failed to download object", err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header / Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/50">
        <ObjectBreadcrumb
          bucket={bucket}
          prefix={prefix}
          onNavigatePrefix={onNavigatePrefix}
        />

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="text-xs h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setCreateFolderOpen(true)}
            className="text-xs h-8"
          >
            <FolderPlus className="w-3.5 h-3.5 mr-1.5" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Upload Dropzone */}
      <UploadDropzone onFilesSelected={addFiles} />

      {/* Upload Queue Panel */}
      <UploadQueuePanel
        uploads={uploads}
        onCancel={cancelUpload}
        onRetry={retryUpload}
        onClearFinished={clearFinished}
      />

      {/* Object Listing Table */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <div className="p-6 text-center border border-destructive/20 bg-destructive/5 rounded-lg">
          <p className="text-sm text-destructive font-medium">Failed to load objects</p>
          <p className="text-xs text-muted-foreground mt-1">
            {error?.message || "An unexpected error occurred"}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-3 text-xs"
          >
            Try Again
          </Button>
        </div>
      ) : (
        <ObjectTable
          bucket={bucket}
          folders={data?.folders || []}
          objects={data?.objects || []}
          truncated={data?.truncated || false}
          onNavigateFolder={(nextPrefix) => onNavigatePrefix(nextPrefix)}
          onDownloadObject={handleDownload}
          onDeleteObject={(key) => setDeleteObjectTarget(key)}
          onDeleteFolder={(folderPrefix, name) => setDeleteFolderTarget({ prefix: folderPrefix, name })}
        />
      )}

      {/* Dialogs */}
      <CreateFolderDialog
        bucket={bucket}
        currentPrefix={prefix}
        open={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
      />

      <DeleteObjectDialog
        bucket={bucket}
        currentPrefix={prefix}
        objectKey={deleteObjectTarget}
        open={Boolean(deleteObjectTarget)}
        onClose={() => setDeleteObjectTarget(null)}
      />

      <DeleteFolderDialog
        bucket={bucket}
        currentPrefix={prefix}
        folderPrefix={deleteFolderTarget?.prefix || null}
        folderName={deleteFolderTarget?.name || null}
        open={Boolean(deleteFolderTarget)}
        onClose={() => setDeleteFolderTarget(null)}
      />
    </div>
  )
}
