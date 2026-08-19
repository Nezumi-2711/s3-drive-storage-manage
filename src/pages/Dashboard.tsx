import { useState } from "react"
import { useNavigate } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import {
  Database,
  LogOut,
  ShieldCheck,
  RotateCw,
  Radio,
  Lock,
} from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useStatus } from "@/features/status/hooks/useStatus"
import { useBucketStats } from "@/features/status/hooks/useBucketStats"
import { statusKeys } from "@/features/status/api/status.keys"
import { GatewayStatusCard } from "@/features/status/components/GatewayStatusCard"
import { DriveQuotaCard } from "@/features/status/components/DriveQuotaCard"
import { MultipartStatusCard } from "@/features/status/components/MultipartStatusCard"
import { BucketStatsTable } from "@/features/status/components/BucketStatsTable"
import { GatewayConfigCard } from "@/features/status/components/GatewayConfigCard"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/format"

export default function Dashboard() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const {
    data: statusData,
    isLoading: isStatusLoading,
    error: statusError,
  } = useStatus()

  const {
    data: bucketStatsData,
    isLoading: isBucketsLoading,
    error: bucketsError,
  } = useBucketStats()

  const handleSignOut = async () => {
    await signOut()
    navigate("/sign-in", { replace: true })
  }

  const handleRefreshAll = async () => {
    try {
      setIsRefreshing(true)
      await queryClient.invalidateQueries({ queryKey: statusKeys.all })
    } finally {
      setIsRefreshing(false)
    }
  }

  const checkedAtTime = statusData?.checkedAt
    ? new Date(statusData.checkedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null

  return (
    <div className="relative min-h-screen bg-background bg-grid-pattern flex flex-col overflow-x-hidden">
      {/* Background ambient colorful glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[15%] -left-[10%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[130px]" />
        <div className="absolute top-[20%] -right-[15%] h-[550px] w-[550px] rounded-full bg-cyan-400/10 blur-[140px]" />
        <div className="absolute -bottom-[20%] left-[30%] h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[130px]" />
      </div>

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
                <span className="hidden sm:inline">Google Drive S3-Compatible Storage Bridge</span>
                <span className="sm:hidden">Drive S3 Bridge Console</span>
              </p>
            </div>
          </div>

          {/* Actions & Badges */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/70 border border-border/60 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-medium text-foreground/80">Admin Mode</span>
            </div>
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
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-card via-card to-blue-500/5 p-6 sm:p-7 shadow-lg shadow-blue-950/5">
          <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-cyan-500/10 via-blue-500/5 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>Authenticated Session Active</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Gateway Overview &amp; Control
              </h2>
              <p className="text-sm text-muted-foreground max-w-2xl font-medium">
                Live metrics from Cloudflare Workers connected to Google Drive API with AWS S3 signature verification.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/80 shadow-xs">
                <Radio className="h-4 w-4 text-emerald-500 animate-pulse" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Edge Network</div>
                  <div className="text-xs font-bold text-foreground">Global CDN Active</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {checkedAtTime && (
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Updated {formatRelativeTime(statusData?.checkedAt)} ({checkedAtTime})
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshAll}
                  disabled={isStatusLoading || isBucketsLoading || isRefreshing}
                  className="h-7 text-xs px-2 rounded-lg gap-1"
                  title="Refresh status and bucket overview"
                >
                  <RotateCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span className="hidden min-[420px]:inline">Refresh</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Status / Quick Overview cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <GatewayStatusCard
            status={statusData}
            isLoading={isStatusLoading}
            error={statusError}
          />
          <DriveQuotaCard
            drive={statusData?.drive}
            isLoading={isStatusLoading}
            error={statusError}
          />
          <MultipartStatusCard
            gateway={statusData?.gateway}
            isLoading={isStatusLoading}
            error={statusError}
          />
        </div>

        {/* Feature Capabilities & Specifications */}
        <div className="grid gap-6 lg:grid-cols-3">
          <BucketStatsTable
            stats={bucketStatsData}
            isLoading={isBucketsLoading}
            error={bucketsError}
          />
          <GatewayConfigCard
            gateway={statusData?.gateway}
            isLoading={isStatusLoading}
          />
        </div>
      </main>
    </div>
  )
}
