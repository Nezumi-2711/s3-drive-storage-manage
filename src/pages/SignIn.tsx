import React, { useState } from "react"
import { useNavigate, Navigate } from "react-router"
import { Eye, EyeOff, Lock, Database, ArrowRight, Loader2, AlertCircle, Sparkles, Shield, Cloud } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { ApiError } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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

  const { signIn, isAuthenticated, isLoading, isSigningIn, signInError, resetSignInError } = useAuth()
  const navigate = useNavigate()

  // If already authenticated and not in loading state, redirect to dashboard
  if (!isLoading && isAuthenticated) {
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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background bg-grid-pattern p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Background ambient colorful glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] h-[550px] w-[550px] rounded-full bg-blue-500/15 blur-[130px]" />
        <div className="absolute top-[30%] -right-[15%] h-[500px] w-[500px] rounded-full bg-cyan-400/15 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[25%] h-[450px] w-[450px] rounded-full bg-indigo-500/12 blur-[140px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo and Brand Header */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="relative mb-4 group cursor-default">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 opacity-70 blur-sm group-hover:opacity-100 transition duration-300" />
            <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-blue-500/25">
              <Database className="h-8 w-8 text-white stroke-[2.2]" />
            </div>
            <div className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-background shadow-xs">
              <Cloud className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            <span>Cloudflare Worker &amp; Drive Bridge</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            S3 Drive <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">Storage</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            High-performance management console for Google Drive S3 gateway
          </p>
        </div>

        {/* Sign In Card */}
        <Card className="border-border/70 bg-card/85 backdrop-blur-xl shadow-2xl shadow-blue-950/5 ring-1 ring-black/5 dark:ring-white/10 rounded-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />
          
          <CardHeader className="space-y-1.5 pt-6 pb-4">
            <CardTitle className="text-xl font-bold text-center tracking-tight">
              Sign In to Console
            </CardTitle>
            <CardDescription className="text-center text-xs text-muted-foreground">
              Enter your gateway access password to unlock management tools
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 px-6">
              {/* Error Alert */}
              {error && (
                <div
                  className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">{error}</div>
                </div>
              )}

              {/* Password Input Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground/80">
                  Access Password
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground group-focus-within:text-blue-600 transition-colors">
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
                    placeholder="Enter management password"
                    className="pl-10 pr-10 h-11 text-sm bg-background/80 border-border/80 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:border-blue-500 transition-all"
                    disabled={isSigningIn}
                    autoComplete="current-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
            </CardContent>

            <CardFooter className="pt-3 pb-7 px-6 flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full h-11 font-semibold rounded-xl text-sm"
                disabled={isSigningIn || !password.trim()}
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying Credentials...
                  </>
                ) : (
                  <>
                    Unlock Console
                    <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Security badge footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 text-emerald-500" />
          <span>Protected by S3 Drive Storage Gateway • SHA-256 Auth</span>
        </div>
      </div>
    </div>
  )
}
