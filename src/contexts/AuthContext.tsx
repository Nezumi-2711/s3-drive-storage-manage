import React, { useState, useEffect } from "react"
import {
  isAuthenticated as checkIsAuthenticated,
  login as authLogin,
  logout as authLogout,
  type AuthResult,
} from "@/lib/auth"
import { AuthContext } from "./auth-context-def"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Check initial auth state from localStorage
    setIsAuthenticated(checkIsAuthenticated())
    setIsLoading(false)
  }, [])

  const signIn = async (password: string): Promise<AuthResult> => {
    setIsLoading(true)
    try {
      const result = await authLogin(password)
      if (result.success) {
        setIsAuthenticated(true)
      }
      return result
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    authLogout()
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export type { AuthContextType } from "./auth-context-def"
export { AuthContext } from "./auth-context-def"

