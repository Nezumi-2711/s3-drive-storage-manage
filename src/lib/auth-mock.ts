import { hashPassword, setAuthToken, type AuthResult } from "./auth"

// Default mock password if not set in .env
const MOCK_ENV_PASSWORD = import.meta.env.VITE_MOCK_PASSWORD || "admin123"

/**
 * Mock login function for development when backend is not connected.
 * Verifies the incoming password hash against the hash of VITE_MOCK_PASSWORD.
 */
export async function mockLogin(incomingPasswordHash: string): Promise<AuthResult> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 600))

  const expectedHash = await hashPassword(MOCK_ENV_PASSWORD)

  if (incomingPasswordHash === expectedHash) {
    const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substring(2)}`
    setAuthToken(mockToken)
    return { success: true, token: mockToken }
  }

  return {
    success: false,
    error: "Incorrect password. Please try again.",
  }
}
