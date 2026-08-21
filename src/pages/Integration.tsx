import { useState } from "react"
import { useNavigate } from "react-router"
import {
  AlertCircle,
  Cable,
  Database,
  LogOut,
  RotateCw,
  ShieldCheck,
} from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useIntegration } from "@/features/integration/hooks/useIntegration"
import { ConnectionDetailsCard } from "@/features/integration/components/ConnectionDetailsCard"
import { AccessKeyTable } from "@/features/integration/components/AccessKeyTable"
import { CreateAccessKeyDialog } from "@/features/integration/components/CreateAccessKeyDialog"
import { NewKeyResultDialog } from "@/features/integration/components/NewKeyResultDialog"
import { RotateAccessKeyDialog } from "@/features/integration/components/RotateAccessKeyDialog"
import { RevokeAccessKeyDialog } from "@/features/integration/components/RevokeAccessKeyDialog"
import type { AccessKeyFull, AccessKeyMetadata, RotateAccessKeyResponse } from "@/features/integration/api/integration.types"

export default function Integration() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const { data: info, isLoading, error, refetch } = useIntegration()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [rotatingKey, setRotatingKey] = useState<AccessKeyMetadata | null>(null)
  const [revokingKey, setRevokingKey] = useState<AccessKeyMetadata | null>(null)
  const [newKeyResult, setNewKeyResult] = useState<{ title: string; created: AccessKeyFull } | null>(null)

  const handleSignOut = async () => {
    await signOut()
    navigate("/sign-in", { replace: true })
  }

  const handleRotated = (result: RotateAccessKeyResponse) => {
    setNewKeyResult({ title: "Key Rotated", created: result.created })
  }

  const accessKeys = info?.accessKeys ?? []

  return (
    <div className="relative min-h-screen bg-background bg-grid-pattern flex flex-col overflow-x-hidden">
      {/* Navigation Header */}
      <header className="border-b border-border/70 bg-card/80 backdrop-blur-md sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 min-h-16 py-2.5 sm:py-0 flex items-center justify-between gap-3">
          {/* Brand Info */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Database className="h-4.5 w-4.5 sm:h-5 sm:w-5 stroke-[2.2]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500 ring-2 ring-card" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold tracking-tight leading-tight text-foreground truncate">
                  S3 Drive <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Storage</span>
                </h1>
                <span className="hidden min-[480px]:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                  v1.0 Gateway
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate max-w-[220px] sm:max-w-none">
                <span className="hidden sm:inline">Connect external tools to your S3-compatible gateway</span>
                <span className="sm:hidden">Integration Console</span>
              </p>
            </div>
          </div>

          {/* Actions & Badges */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-xs font-medium h-8 px-2.5 sm:px-3 rounded-lg text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Button>
            <span className="hidden min-[420px]:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <Cable className="h-3.5 w-3.5" />
              Integration
            </span>
            <ThemeToggle showLabel={false} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-xs font-medium gap-1.5 h-8 px-2.5 sm:px-3 rounded-lg hover:border-red-200 hover:bg-red-50/50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:border-red-900 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden min-[360px]:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-card via-card to-cyan-500/5 p-6 sm:p-7 shadow-lg shadow-blue-950/5">
          <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-cyan-500/10 via-blue-500/5 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>Session Authenticated</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Integration &amp; Access Keys
              </h2>
              <p className="text-sm text-muted-foreground max-w-2xl font-medium">
                Everything Dokploy, n8n, rclone or backup scripts need to connect — endpoint details, ready-to-paste
                environment variables and per-integration S3 keys.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="h-7 text-xs px-2 rounded-lg gap-1"
                title="Refresh connection details"
              >
                <RotateCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden min-[420px]:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/5 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-sm font-bold text-destructive">Failed to load integration info</div>
              <p className="text-xs text-muted-foreground">{error.message || "Unknown error occurred"}</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="h-7 text-xs mt-1">
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Connection details */}
        <ConnectionDetailsCard info={info} isLoading={isLoading} />

        {/* Access key management */}
        <AccessKeyTable
          accessKeys={accessKeys}
          maxKeys={info?.limits.maxAccessKeys ?? 5}
          isLoading={isLoading}
          onCreateKey={() => setIsCreateOpen(true)}
          onRotateKey={(key) => setRotatingKey(key)}
          onRevokeKey={(key) => setRevokingKey(key)}
        />
      </main>

      {/* Dialogs */}
      <CreateAccessKeyDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(key) => setNewKeyResult({ title: "Access Key Created", created: key })}
      />
      <RotateAccessKeyDialog
        open={Boolean(rotatingKey)}
        onClose={() => setRotatingKey(null)}
        accessKey={rotatingKey}
        onRotated={handleRotated}
      />
      <RevokeAccessKeyDialog
        open={Boolean(revokingKey)}
        onClose={() => setRevokingKey(null)}
        accessKey={revokingKey}
        isLastKey={accessKeys.length === 1 && revokingKey !== null}
      />
      <NewKeyResultDialog
        open={newKeyResult !== null}
        onClose={() => setNewKeyResult(null)}
        created={newKeyResult?.created}
        title={newKeyResult?.title ?? ""}
      />
    </div>
  )
}
