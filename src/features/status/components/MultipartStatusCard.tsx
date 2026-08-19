import { Cpu, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { GatewayConfig } from "../api/status.types"

interface MultipartStatusCardProps {
  gateway?: GatewayConfig
  isLoading: boolean
  error?: Error | null
}

export function MultipartStatusCard({ gateway, isLoading }: MultipartStatusCardProps) {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden border-border/80 bg-card/90 backdrop-blur-sm shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-44" />
        </CardContent>
      </Card>
    )
  }

  const isEnabled = gateway?.multipartEnabled ?? false
  const etagStyle = gateway?.etagStyle ?? "md5"

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all group">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Multipart Uploads
        </CardTitle>
        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 group-hover:scale-110 transition-transform">
          <Layers className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground flex items-center justify-between">
          <span>{isEnabled ? "Enabled" : "Disabled"}</span>
          <Badge variant={isEnabled ? "success" : "neutral"} className="text-[10px]">
            {etagStyle.toUpperCase()} ETag
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
          <Cpu className="h-3 w-3 text-cyan-500 shrink-0" />
          <span>
            {isEnabled
              ? "Durable Objects resumable state"
              : "ALLOW_MULTIPART disabled"}
          </span>
        </p>
      </CardContent>
    </Card>
  )
}
