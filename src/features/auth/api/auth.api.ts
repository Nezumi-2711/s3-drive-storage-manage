import { apiRequest, ApiError, IS_MOCK_MODE } from "@/lib/api-client"
import { hashPassword } from "../lib/hash-password"
import { mockLogin, mockLogout, mockVerifySession } from "./auth.mock"
import type { LoginResponse, SessionResponse } from "./auth.types"

/**
 * Perform login by hashing the password and validating it against the API (or mock).
 */
export async function login(password: string): Promise<LoginResponse> {
  if (!password.trim()) {
    throw new ApiError(400, "Password cannot be empty")
  }

  const hashedPassword = await hashPassword(password)

  if (IS_MOCK_MODE) {
    return mockLogin(hashedPassword)
  }

  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { passwordHash: hashedPassword },
    auth: false,
  })
}

/**
 * Fetch and verify the current session with the API (or mock).
 */
export async function fetchSession(signal?: AbortSignal): Promise<SessionResponse> {
  if (IS_MOCK_MODE) {
    await mockVerifySession()
    return { valid: true }
  }

  return apiRequest<SessionResponse>("/auth/session", {
    method: "GET",
    signal,
  })
}

/**
 * Perform logout with the API (or mock).
 */
export async function logout(): Promise<void> {
  if (IS_MOCK_MODE) {
    await mockLogout()
    return
  }

  await apiRequest<void>("/auth/logout", {
    method: "POST",
  })
}
