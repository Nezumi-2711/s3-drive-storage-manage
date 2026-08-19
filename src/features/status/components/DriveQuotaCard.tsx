import { HardDrive, AlertCircle, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { formatBytes } from "@/lib/format"
import type { DriveStatus } from "../api/status.types"

interface DriveQuotaCardProps {
  drive?: DriveStatus
  isLoading: boolean
  error?: Error | null
}

export function DriveQuotaCard({ drive, isLoading, error }: DriveQuotaCardProps) {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden border-border/80 bg-card/90 backdrop-blur-sm shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-3 w-40" />
        </CardContent>
      </Card>
    )
  }

  if (error || !drive || !drive.connected) {
    return (
      <Card className="relative overflow-hidden border-border/80 bg-card/90 backdrop-blur-sm shadow-md">
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            S3 Storage Backend
          </CardTitle>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <AlertCircle className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">Google Drive</div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span className="truncate">{drive?.error || "Drive connection error"}</span>
          </p>
        </CardContent>
      </Card>
    )
  }

  const quota = drive.quota
  const isUnlimited = quota?.limit == null
  const percentUsed = quota?.percentUsed ?? 0

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all group">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          S3 Storage Backend
        </CardTitle>
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
          <HardDrive className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-2xl font-bold text-foreground">
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

        <div className="text-xs text-muted-foreground flex items-center gap-1 pt-0.5 truncate">
          <User className="h-3 w-3 text-blue-500 shrink-0" />
          <span className="truncate">
            {drive.account?.email || drive.account?.displayName || "Google Drive Connected"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
