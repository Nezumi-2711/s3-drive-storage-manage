import React from "react"
import { Navigate } from "react-router"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Loader2 } from "lucide-react"

interface PublicOnlyRouteProps {
  children: React.ReactNode
}

/**
 * Route guard for pages that should only be accessible to unauthenticated users (e.g. /sign-in).
 * If the user has a valid token/session, they are redirected to dashboard without flashing the sign-in screen.
 */
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isAuthenticated, isLoading, token } = useAuth()

  // If we already have a token and session is verifying, show a clean checking spinner
  // to avoid flashing the sign-in form.
  if (isLoading || (token && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background bg-grid-pattern">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
