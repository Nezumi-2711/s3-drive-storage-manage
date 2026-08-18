import { createContext } from "react"
import type { AuthResult } from "@/lib/auth"

export interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (password: string) => Promise<AuthResult>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
