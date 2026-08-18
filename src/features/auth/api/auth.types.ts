export interface LoginResponse {
  token: string
  expiresIn: number
}

export interface SessionResponse {
  valid: true
}

export interface ApiErrorBody {
  message?: string
}
