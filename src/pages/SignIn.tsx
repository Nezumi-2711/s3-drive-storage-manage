import React, { useState } from "react"
import { useNavigate, Navigate } from "react-router"
import { Eye, EyeOff, Lock, Database, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { ApiError } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/ThemeToggle"

function getErrorMessage(error: Error | null): string | null {
  if (!error) return null
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return "Too many failed attempts. Account is temporarily locked out. Please try again later."
    }
    if (error.status === 503) {
      return "Authentication service is unavailable or DASHBOARD_PASSWORD is not configured on backend."
    }
    if (error.status === 401) {
      return error.message || "Incorrect password. Please try again."
    }
    if (error.status === 0) {
      return error.message || "Failed to connect to authentication service"
    }
    return error.message
  }
  return error.message || "An unexpected error occurred. Please try again."
}

export default function SignIn() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const { signIn, isAuthenticated, isLoading, isSigningIn, signInError, resetSignInError, token } = useAuth()
  const navigate = useNavigate()

  // Guard against flashing sign-in UI while checking session or if already authenticated
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

  const error = getErrorMessage(signInError)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim() || isSigningIn) {
      return
    }

    try {
      await signIn(password)
      navigate("/", { replace: true })
    } catch {
      // Error handled by mutation state
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background bg-grid-pattern p-4 overflow-hidden">
      {/* Theme Toggle in top-right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle showLabel={false} />
      </div>

      <div className="w-full max-w-sm space-y-6">
        {/* Brand & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs mb-1">
            <Database className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            S3 Drive Storage
          </h1>
          <p className="text-xs text-muted-foreground">
            Enter your management password to access the console
          </p>
        </div>

        {/* Sign In Card */}
        <div className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md p-6 shadow-xl shadow-black/5 dark:shadow-black/30">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <div
                className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in duration-200"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{error}</div>
              </div>
            )}

            {/* Password Input Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                Access Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (signInError) resetSignInError()
                  }}
                  placeholder="••••••••••••"
                  className="pl-9 pr-9 h-10 text-sm bg-background/60 border-border rounded-lg focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-all"
                  disabled={isSigningIn}
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-medium rounded-lg text-sm mt-2"
              disabled={isSigningIn || !password.trim()}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Minimal Footer */}
        <p className="text-center text-[11px] text-muted-foreground/70">
          Protected by S3 Drive Gateway Auth
        </p>
      </div>
    </div>
  )
}
