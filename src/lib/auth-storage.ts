import { useSyncExternalStore } from "react"

export const AUTH_STORAGE_KEY = "s3_drive_storage_auth_token"

const listeners = new Set<() => void>()

function emitChange(): void {
  for (const listener of listeners) {
    listener()
  }
}

/**
 * Retrieve the auth token from localStorage.
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null
  }
  return localStorage.getItem(AUTH_STORAGE_KEY)
}

/**
 * Store the auth token in localStorage and notify listeners.
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_STORAGE_KEY, token)
  emitChange()
}

/**
 * Clear the auth token from localStorage and notify listeners.
 */
export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  emitChange()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): string | null {
  return getAuthToken()
}

function getServerSnapshot(): string | null {
  return null
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event: StorageEvent) => {
    if (event.key === AUTH_STORAGE_KEY) {
      emitChange()
    }
  })
}

/**
 * Hook to reactively subscribe to the auth token in localStorage.
 */
export function useAuthToken(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
