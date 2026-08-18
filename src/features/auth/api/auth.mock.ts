import { ApiError } from "@/lib/api-client"
import { hashPassword } from "../lib/hash-password"
import type { LoginResponse } from "./auth.types"

// Default mock password if not set in .env
const MOCK_ENV_PASSWORD = import.meta.env.VITE_MOCK_PASSWORD || "admin123"

/**
 * Mock login function for development when backend is not connected.
 * Verifies the incoming password hash against the hash of VITE_MOCK_PASSWORD.
 */
export async function mockLogin(incomingPasswordHash: string): Promise<LoginResponse> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 600))

  const expectedHash = await hashPassword(MOCK_ENV_PASSWORD)

  if (incomingPasswordHash === expectedHash) {
    const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substring(2)}`
    return { token: mockToken, expiresIn: 86400 }
  }

  throw new ApiError(401, "Incorrect password. Please try again.")
}

/**
 * Mock session verification when backend is not connected.
 */
export async function mockVerifySession(): Promise<void> {
  // No-op for mock
}

/**
 * Mock logout when backend is not connected.
 */
export async function mockLogout(): Promise<void> {
  // No-op for mock
}
