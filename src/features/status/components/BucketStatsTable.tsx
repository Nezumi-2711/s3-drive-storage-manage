import { useState } from "react"
import {
  FolderTree,
  RotateCw,
  Sparkles,
  AlertCircle,
  Globe,
  Lock,
  Files,
} from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { formatBytes, formatRelativeTime } from "@/lib/format"
import { fetchBucketStats } from "../api/status.api"
import { statusKeys } from "../api/status.keys"
import type { BucketStatsResponse } from "../api/status.types"

interface BucketStatsTableProps {
  stats?: BucketStatsResponse
  isLoading: boolean
  error?: Error | null
}

export function BucketStatsTable({ stats, isLoading, error }: BucketStatsTableProps) {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleForceRefresh = async () => {
    try {
      setIsRefreshing(true)
      const data = await fetchBucketStats(undefined, true)
      queryClient.setQueryData(statusKeys.buckets(), data)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Card className="lg:col-span-2 border-border/80 bg-card/85 backdrop-blur-sm shadow-md flex flex-col justify-between">
      <div>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FolderTree className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-bold">Bucket Explorer</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {stats && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {stats.totals.buckets} {stats.totals.buckets === 1 ? "bucket" : "buckets"} · {stats.totals.objectCount} objects · {formatBytes(stats.totals.totalSize)}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceRefresh}
                disabled={isLoading || isRefreshing}
                className="h-7 text-xs px-2.5 rounded-lg gap-1"
                title="Bypass KV cache and recalculate bucket statistics"
              >
                <RotateCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "Scanning..." : "Recalculate"}</span>
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Allowlisted S3 buckets mapped to Google Drive folders with size and object counts.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : error || !stats ? (
            <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5 text-center space-y-2">
              <AlertCircle className="h-6 w-6 text-destructive mx-auto" />
              <div className="text-sm font-semibold text-destructive">Failed to load bucket stats</div>
              <p className="text-xs text-muted-foreground">{error?.message || "Unknown error occurred"}</p>
            </div>
          ) : stats.buckets.length === 0 ? (
            <div className="h-36 rounded-xl border border-dashed border-border flex flex-col items-center justify-center p-6 text-center bg-muted/20">
              <Files className="h-6 w-6 text-muted-foreground mb-2" />
              <div className="text-sm font-medium text-foreground">No buckets configured</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set ALLOWED_BUCKETS in your Worker configuration to expose buckets.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/70">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/70">
                  <tr>
                    <th className="py-2.5 px-3">Bucket Name</th>
                    <th className="py-2.5 px-3">Access</th>
                    <th className="py-2.5 px-3 text-right">Objects</th>
                    <th className="py-2.5 px-3 text-right">Total Size</th>
                    <th className="py-2.5 px-3 text-right">Last Modified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {stats.buckets.map((b) => (
                    <tr key={b.name} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-foreground flex items-center gap-1.5 font-mono">
                        <span>{b.name}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        {b.publicRead ? (
                          <Badge variant="warning" className="text-[10px] gap-1 px-1.5 py-0">
                            <Globe className="h-2.5 w-2.5" />
                            Public Read
                          </Badge>
                        ) : (
                          <Badge variant="neutral" className="text-[10px] gap-1 px-1.5 py-0">
                            <Lock className="h-2.5 w-2.5" />
                            Private
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-foreground">
                        {b.error ? (
                          <span className="text-destructive">Error</span>
                        ) : (
                          <span>{b.truncated ? `≥ ${b.objectCount}` : b.objectCount}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-foreground">
                        {b.error ? "—" : formatBytes(b.totalSize)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground">
                        {b.error ? (
                          <span className="text-destructive text-[11px]" title={b.error}>
                            Failed to scan
                          </span>
                        ) : (
                          formatRelativeTime(b.lastModified)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* S3 actions info bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-medium text-muted-foreground mr-1">Supported APIs:</span>
            {["s3:ListObjectsV2", "s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:CreateMultipartUpload"].map(
              (api) => (
                <span
                  key={api}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-secondary/80 text-secondary-foreground border border-border/60"
                >
                  <Sparkles className="h-2.5 w-2.5 text-blue-500" />
                  {api}
                </span>
              )
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
