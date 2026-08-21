import { useEffect, useSyncExternalStore } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { objectKeys } from "../api/objects.keys"
import { uploadManager } from "../lib/upload-manager"

export function useUploadQueue(bucket?: string, prefix?: string) {
  const queryClient = useQueryClient()
  const uploads = useSyncExternalStore(uploadManager.subscribe, uploadManager.getSnapshot)

  useEffect(() => {
    uploadManager.setOnCompleteCallback((item) => {
      queryClient.invalidateQueries({ queryKey: objectKeys.list(item.bucket, item.prefix) })
    })
  }, [queryClient])

  const addFiles = (files: File[]) => {
    if (!bucket) return
    uploadManager.addFiles(files, bucket, prefix || "")
  }

  const cancelUpload = (id: string) => {
    uploadManager.cancelUpload(id)
  }

  const retryUpload = (id: string) => {
    uploadManager.retryUpload(id)
  }

  const clearFinished = () => {
    uploadManager.clearFinished()
  }

  return {
    uploads,
    addFiles,
    cancelUpload,
    retryUpload,
    clearFinished,
    hasActive: uploadManager.hasActiveUploads(),
  }
}
