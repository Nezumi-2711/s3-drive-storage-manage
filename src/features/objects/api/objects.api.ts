import { apiFetch, apiRequest, IS_MOCK_MODE } from "../../../lib/api-client"
import {
  mockAbortUpload,
  mockCompleteUpload,
  mockCreateDownloadTicket,
  mockCreateFolder,
  mockDeleteFolder,
  mockDeleteObject,
  mockGetObjectMetadata,
  mockInitiateUpload,
  mockListObjects,
  mockPutObjectContent,
  mockUploadPart,
} from "./objects.mock"
import type {
  CompleteUploadRequest,
  CompleteUploadResponse,
  CreateFolderRequest,
  CreateFolderResponse,
  DownloadTicketResponse,
  InitiateUploadRequest,
  InitiateUploadResponse,
  ListObjectsResponse,
  ObjectMetadataResponse,
  UploadPartResponse,
} from "./objects.types"

export async function listObjects(bucket: string, prefix = "", delimiter = "/"): Promise<ListObjectsResponse> {
  if (IS_MOCK_MODE) {
    return mockListObjects(bucket, prefix, delimiter)
  }
  const params = new URLSearchParams()
  params.set("bucket", bucket)
  if (prefix) params.set("prefix", prefix)
  if (delimiter) params.set("delimiter", delimiter)

  return apiRequest<ListObjectsResponse>(`/api/objects?${params.toString()}`)
}

export async function getObjectMetadata(bucket: string, key: string): Promise<ObjectMetadataResponse> {
  if (IS_MOCK_MODE) {
    return mockGetObjectMetadata(bucket, key)
  }
  const params = new URLSearchParams({ bucket, key })
  return apiRequest<ObjectMetadataResponse>(`/api/objects/metadata?${params.toString()}`)
}

export async function deleteObject(bucket: string, key: string): Promise<void> {
  if (IS_MOCK_MODE) {
    return mockDeleteObject(bucket, key)
  }
  const params = new URLSearchParams({ bucket, key })
  return apiRequest<void>(`/api/objects?${params.toString()}`, { method: "DELETE" })
}

export async function createFolder(req: CreateFolderRequest): Promise<CreateFolderResponse> {
  if (IS_MOCK_MODE) {
    return mockCreateFolder(req)
  }
  return apiRequest<CreateFolderResponse>("/api/objects/folder", {
    method: "POST",
    body: req,
  })
}

export async function deleteFolder(bucket: string, prefix: string, recursive = false): Promise<void> {
  if (IS_MOCK_MODE) {
    return mockDeleteFolder(bucket, prefix, recursive)
  }
  const params = new URLSearchParams({ bucket, prefix })
  if (recursive) params.set("recursive", "1")
  return apiRequest<void>(`/api/objects/folder?${params.toString()}`, { method: "DELETE" })
}

export async function putObjectContent(
  bucket: string,
  key: string,
  data: Blob | ArrayBuffer | string,
  contentType?: string,
): Promise<{ key: string; etag: string; size: number }> {
  if (IS_MOCK_MODE) {
    return mockPutObjectContent(bucket, key, data)
  }
  const params = new URLSearchParams({ bucket, key })
  const headers: Record<string, string> = {}
  if (contentType) {
    headers["Content-Type"] = contentType
  }
  return apiRequest<{ key: string; etag: string; size: number }>(`/api/objects/content?${params.toString()}`, {
    method: "PUT",
    body: data,
    headers,
  })
}

export async function createDownloadTicket(bucket: string, key: string): Promise<DownloadTicketResponse> {
  if (IS_MOCK_MODE) {
    return mockCreateDownloadTicket(bucket, key)
  }
  return apiRequest<DownloadTicketResponse>("/api/objects/download-ticket", {
    method: "POST",
    body: { bucket, key },
  })
}

export async function downloadObjectDirect(bucket: string, key: string): Promise<Blob> {
  const params = new URLSearchParams({ bucket, key })
  const res = await apiFetch(`/api/objects/content?${params.toString()}`)
  return res.blob()
}

export async function initiateMultipartUpload(req: InitiateUploadRequest): Promise<InitiateUploadResponse> {
  if (IS_MOCK_MODE) {
    return mockInitiateUpload(req)
  }
  return apiRequest<InitiateUploadResponse>("/api/objects/uploads", {
    method: "POST",
    body: req,
  })
}

export async function uploadMultipartPart(
  bucket: string,
  key: string,
  uploadId: string,
  partNumber: number,
  data: Blob,
  signal?: AbortSignal,
  onProgress?: (loaded: number, total: number) => void,
): Promise<UploadPartResponse> {
  if (IS_MOCK_MODE) {
    return mockUploadPart(partNumber)
  }

  const params = new URLSearchParams({
    bucket,
    key,
    uploadId,
    partNumber: String(partNumber),
  })

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", `${import.meta.env.VITE_API_URL || ""}/api/objects/uploads/part?${params.toString()}`)

    const token = localStorage.getItem("s3_drive_auth_token")
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`)
    }

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(e.loaded, e.total)
        }
      }
    }

    if (signal) {
      signal.addEventListener("abort", () => {
        xhr.abort()
        reject(new DOMException("Upload aborted", "AbortError"))
      })
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText) as UploadPartResponse
          resolve(res)
        } catch {
          resolve({ partNumber, etag: xhr.getResponseHeader("ETag")?.replace(/"/g, "") || "" })
        }
      } else {
        let message = `Part upload failed with status ${xhr.status}`
        try {
          const json = JSON.parse(xhr.responseText) as { message?: string }
          if (json.message) message = json.message
        } catch {
          if (xhr.status === 413) {
            message = "Payload too large for upload (Cloudflare limit)"
          }
        }
        const error = new Error(message) as Error & { status?: number; retryAfter?: string }
        error.status = xhr.status
        error.retryAfter = xhr.getResponseHeader("Retry-After") || undefined
        reject(error)
      }
    }

    xhr.onerror = () => {
      reject(new Error("Network error during part upload"))
    }

    xhr.send(data)
  })
}

export async function completeMultipartUpload(req: CompleteUploadRequest): Promise<CompleteUploadResponse> {
  if (IS_MOCK_MODE) {
    return mockCompleteUpload(req)
  }
  return apiRequest<CompleteUploadResponse>("/api/objects/uploads/complete", {
    method: "POST",
    body: req,
  })
}

export async function abortMultipartUpload(bucket: string, key: string, uploadId: string): Promise<void> {
  if (IS_MOCK_MODE) {
    return mockAbortUpload()
  }
  const params = new URLSearchParams({ bucket, key, uploadId })
  return apiRequest<void>(`/api/objects/uploads?${params.toString()}`, { method: "DELETE" })
}
