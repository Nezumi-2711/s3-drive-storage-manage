import { getAuthToken } from "./auth-storage"

export const API_BASE_URL: string = import.meta.env.VITE_API_URL || ""
export const IS_MOCK_MODE: boolean = !API_BASE_URL

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  auth?: boolean
}

/**
 * Core fetch wrapper returning the raw Response with auth headers and error handling.
 */
export async function apiFetch(
  path: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const { body, auth = true, headers: customHeaders, ...restOptions } = options

  const headers = new Headers(customHeaders)

  if (auth) {
    const token = getAuthToken()
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
  }

  let requestBody: BodyInit | null | undefined
  if (body !== undefined) {
    if (
      typeof body === "string" ||
      body instanceof FormData ||
      body instanceof Blob ||
      body instanceof ArrayBuffer ||
      body instanceof URLSearchParams
    ) {
      requestBody = body as BodyInit
    } else {
      headers.set("Content-Type", "application/json")
      requestBody = JSON.stringify(body)
    }
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...restOptions,
      headers,
      body: requestBody,
    })
  } catch {
    throw new ApiError(0, "Failed to connect to authentication service")
  }

  if (!response.ok) {
    let errorMessage = "Request failed"
    try {
      const data = (await response.json()) as { message?: string }
      if (data && typeof data.message === "string") {
        errorMessage = data.message
      }
    } catch {
      errorMessage = response.statusText || `Request failed with status ${response.status}`
    }
    throw new ApiError(response.status, errorMessage)
  }

  return response
}

/**
 * Type-safe fetch wrapper with error handling, automatic bearer authentication and JSON parsing.
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const response = await apiFetch(path, options)

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (!text) {
    return undefined as T
  }

  try {
    return JSON.parse(text) as T
  } catch {
    return text as unknown as T
  }
}
