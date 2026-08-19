import { Activity, AlertTriangle, Server } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { StatusResponse } from "../api/status.types"

interface GatewayStatusCardProps {
  status?: StatusResponse
  isLoading: boolean
  error?: Error | null
}

export function GatewayStatusCard({ status, isLoading, error }: GatewayStatusCardProps) {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden border-border/80 bg-card/90 backdrop-blur-sm shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-3 w-48" />
        </CardContent>
      </Card>
    )
  }

  if (error || !status) {
    return (
      <Card className="relative overflow-hidden border-destructive/40 bg-card/90 backdrop-blur-sm shadow-md">
        <div className="absolute top-0 left-0 right-0 h-1 bg-destructive" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Gateway Engine
          </CardTitle>
          <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-destructive">Unavailable</div>
          <p className="text-xs text-muted-foreground mt-1.5 truncate">
            {error?.message || "Failed to query gateway status"}
          </p>
        </CardContent>
      </Card>
    )
  }

  const isDegraded = status.gateway.status === "degraded" || !status.drive.connected

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all group">
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          isDegraded
            ? "bg-gradient-to-r from-amber-500 to-red-500"
            : "bg-gradient-to-r from-emerald-500 to-teal-400"
        }`}
      />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Gateway Engine
        </CardTitle>
        <div
          className={`p-2 rounded-lg ${
            isDegraded
              ? "bg-amber-500/10 text-amber-500"
              : "bg-emerald-500/10 text-emerald-500"
          } group-hover:scale-110 transition-transform`}
        >
          <Server className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isDegraded
                ? "bg-amber-500 shadow-xs shadow-amber-500/50"
                : "bg-emerald-500 shadow-xs shadow-emerald-500/50"
            }`}
          />
          {isDegraded ? "Degraded" : "Online & Healthy"}
        </div>
        <div className="text-xs text-muted-foreground mt-1.5 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 min-w-0">
            {isDegraded ? (
              <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
            ) : (
              <Activity className="h-3 w-3 text-emerald-500 shrink-0" />
            )}
            <span className="truncate">
              {isDegraded
                ? status.drive.error || "Drive connection degraded"
                : `Edge routing · Region: ${status.gateway.region}`}
            </span>
          </div>
          {status.gateway.docsEnabled && (
            <Badge variant="neutral" className="text-[10px] px-1.5 py-0 shrink-0">
              Docs
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
