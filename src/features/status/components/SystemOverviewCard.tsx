import { Activity, AlertTriangle, Server, HardDrive, Cpu, AlertCircle, User, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { formatBytes } from "@/lib/format"
import type { StatusResponse } from "../api/status.types"

interface SystemOverviewCardProps {
  status?: StatusResponse
  isLoading: boolean
  error?: Error | null
}

export function SystemOverviewCard({ status, isLoading, error }: SystemOverviewCardProps) {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden border-border/80 bg-card/90 backdrop-blur-sm shadow-md py-4 sm:py-5">
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-border/60">
            {/* Gateway Skeleton */}
            <div className="space-y-2.5 pb-3 md:pb-0">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-4 w-44" />
            </div>
            {/* Storage Skeleton */}
            <div className="space-y-2.5 pt-3 md:pt-0 md:px-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-2 w-full" />
            </div>
            {/* Multipart Skeleton */}
            <div className="space-y-2.5 pt-3 md:pt-0 md:pl-6">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !status) {
    return (
      <Card className="relative overflow-hidden border-destructive/40 bg-card/90 backdrop-blur-sm shadow-md py-4 sm:py-5">
        <div className="absolute top-0 left-0 right-0 h-1 bg-destructive" />
        <CardContent className="px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-destructive">Gateway Service Unavailable</h3>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {error?.message || "Failed to query live status from Cloudflare Worker"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isDegraded = status.gateway.status === "degraded" || !status.drive.connected
  const drive = status.drive
  const quota = drive.quota
  const isUnlimited = quota?.limit == null
  const percentUsed = quota?.percentUsed ?? 0
  const isMultipartEnabled = status.gateway.multipartEnabled ?? false
  const etagStyle = status.gateway.etagStyle ?? "md5"

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all py-4 sm:py-5 group">
      {/* Top accent bar with unified status gradient */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isDegraded
            ? "bg-gradient-to-r from-amber-500 to-red-500"
            : "bg-gradient-to-r from-emerald-500 via-blue-500 to-cyan-500"
        }`}
      />

      <CardContent className="px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/60">
          
          {/* Section 1: Gateway Engine */}
          <div className="flex flex-col justify-between space-y-2 pb-4 md:pb-0 md:pr-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Gateway Engine
              </span>
              <div
                className={`p-1.5 rounded-lg ${
                  isDegraded
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-emerald-500/10 text-emerald-500"
                } group-hover:scale-105 transition-transform`}
              >
                <Server className="h-3.5 w-3.5" />
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-foreground">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isDegraded
                      ? "bg-amber-500 shadow-xs shadow-amber-500/50"
                      : "bg-emerald-500 shadow-xs shadow-emerald-500/50 animate-pulse"
                  }`}
                />
                <span className="truncate">{isDegraded ? "Degraded" : "Online & Healthy"}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground flex items-center justify-between gap-1 pt-1">
              <div className="flex items-center gap-1.5 min-w-0">
                {isDegraded ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                ) : (
                  <Activity className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                )}
                <span className="truncate">
                  {isDegraded
                    ? drive.error || "Drive connection degraded"
                    : `Edge routing · Region: ${status.gateway.region}`}
                </span>
              </div>
              {status.gateway.docsEnabled && (
                <Badge variant="neutral" className="text-[10px] px-1.5 py-0 shrink-0">
                  Docs
                </Badge>
              )}
            </div>
          </div>

          {/* Section 2: S3 Storage Backend (Google Drive) */}
          <div className="flex flex-col justify-between space-y-2 py-4 md:py-0 md:px-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                S3 Storage Backend
              </span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-105 transition-transform">
                <HardDrive className="h-3.5 w-3.5" />
              </div>
            </div>

            {!drive.connected ? (
              <div className="space-y-1">
                <div className="text-xl font-bold text-foreground">Google Drive</div>
                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{drive.error || "Drive connection error"}</span>
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">
                    {formatBytes(quota?.usage)}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {isUnlimited ? "Unlimited" : `/ ${formatBytes(quota?.limit)}`}
                  </div>
                </div>

                {!isUnlimited && (
                  <div className="space-y-1">
                    <Progress
                      value={percentUsed}
                      indicatorClassName={
                        percentUsed > 90
                          ? "bg-red-500"
                          : percentUsed > 75
                          ? "bg-amber-500"
                          : "bg-gradient-to-r from-blue-600 to-cyan-500"
                      }
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>{percentUsed}% used</span>
                      <span>{formatBytes(quota?.free)} free</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-0.5 truncate">
              <User className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <span className="truncate">
                {drive.account?.email || drive.account?.displayName || "Google Drive"}
              </span>
            </div>
          </div>

          {/* Section 3: Multipart Uploads */}
          <div className="flex flex-col justify-between space-y-2 pt-4 md:pt-0 md:pl-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Multipart Uploads
              </span>
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 group-hover:scale-105 transition-transform">
                <Cpu className="h-3.5 w-3.5" />
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-bold text-foreground flex items-center justify-between">
                <span>{isMultipartEnabled ? "Enabled" : "Disabled"}</span>
                <Badge variant={isMultipartEnabled ? "success" : "neutral"} className="text-[10px] px-2 py-0.5">
                  {etagStyle.toUpperCase()} ETag
                </Badge>
              </div>
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
              <span className="truncate">
                {isMultipartEnabled
                  ? "Durable Objects resumable state"
                  : "ALLOW_MULTIPART disabled"}
              </span>
            </p>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
