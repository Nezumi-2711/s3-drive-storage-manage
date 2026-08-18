import { mockLogin } from "./auth-mock"

export const AUTH_STORAGE_KEY = "s3_drive_storage_auth_token"
export const API_BASE_URL = import.meta.env.VITE_API_URL || ""

export interface AuthResult {
  success: boolean
  token?: string
  error?: string
}

/**
 * Hash a plain-text password to a SHA-256 hexadecimal string using the browser's Web Crypto API.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Perform login by hashing the password and validating it against the API (or mock).
 */
export async function login(password: string): Promise<AuthResult> {
  if (!password.trim()) {
    return { success: false, error: "Password cannot be empty" }
  }

  const hashedPassword = await hashPassword(password)

  // If no API_BASE_URL configured or in mock mode, use mock authentication
  if (!API_BASE_URL) {
    return mockLogin(hashedPassword)
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ passwordHash: hashedPassword }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return {
        success: false,
        error: data.message || "Invalid password",
      }
    }

    const data = await response.json()
    const token = data.token || "authenticated"
    setAuthToken(token)
    return { success: true, token }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to connect to authentication service",
    }
  }
}

/**
 * Store the auth token in localStorage.
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_STORAGE_KEY, token)
}

/**
 * Retrieve the auth token from localStorage.
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_STORAGE_KEY)
}

/**
 * Clear the auth token from localStorage.
 */
export function logout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

/**
 * Check if the user is currently authenticated.
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken()
}
