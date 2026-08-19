export interface BucketRecord {
  name: string
  folderId: string
  publicRead: boolean
  createdTime: string | null
}

export interface CreateBucketRequest {
  name: string
  publicRead?: boolean
}

export interface UpdateBucketRequest {
  publicRead?: boolean
  name?: string
}

export interface ImportCandidate {
  name: string
  folderId: string
  objectCount: number
}

export interface ImportCandidatesResponse {
  candidates: ImportCandidate[]
}

export interface ImportBucketsRequest {
  names: string[]
}

export interface ImportResult {
  imported: string[]
  failed: Array<{
    name: string
    error: string
  }>
}
