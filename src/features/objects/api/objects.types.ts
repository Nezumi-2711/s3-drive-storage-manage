export interface S3ObjectItem {
  key: string
  name: string
  size: number
  contentType: string
  lastModified: string | null
  etag: string
}

export interface S3FolderItem {
  prefix: string
  name: string
}

export interface ListObjectsResponse {
  bucket: string
  prefix: string
  delimiter: string | null
  folders: S3FolderItem[]
  objects: S3ObjectItem[]
  truncated: boolean
}

export interface ObjectMetadataResponse {
  key: string
  name: string
  size: number
  contentType: string
  lastModified: string | null
  etag: string
}

export interface CreateFolderRequest {
  bucket: string
  prefix: string
}

export interface CreateFolderResponse {
  prefix: string
}

export interface InitiateUploadRequest {
  bucket: string
  key: string
  contentType?: string
}

export interface InitiateUploadResponse {
  uploadId: string
  bucket: string
  key: string
  partSize: number
}

export interface CompleteUploadPart {
  partNumber: number
  etag: string
}

export interface CompleteUploadRequest {
  bucket: string
  key: string
  uploadId: string
  parts: CompleteUploadPart[]
  totalSize?: number
}

export interface CompleteUploadResponse {
  key: string
  etag: string
}

export interface DownloadTicketResponse {
  ticket: string
  downloadUrl: string
  expiresIn: number
}

export interface UploadPartResponse {
  partNumber: number
  etag: string
}
