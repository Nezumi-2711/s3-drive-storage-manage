import { ArrowUpRight, Cable, FileCode2, FolderTree, Globe, Lock, MapPin } from "lucide-react"
import { Link } from "react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/ui/copy-button"
import { Badge } from "@/components/ui/badge"
import type { IntegrationInfo } from "../api/integration.types"

interface ConnectionDetailsCardProps {
  info?: IntegrationInfo
  isLoading: boolean
}

interface DetailRowProps {
  icon: React.ReactNode
  label: string
  value: string
  copyValue?: string
  note?: string
  trailing?: React.ReactNode
}

function DetailRow({ icon, label, value, copyValue, note, trailing }: DetailRowProps) {
  return (
    <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-1">
      <div className="text-xs font-semibold text-foreground flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 min-w-0">
          {icon}
          <span>{label}</span>
        </span>
        <CopyButton value={copyValue ?? value} />
      </div>
      <p className="font-mono text-xs text-foreground/90 break-all">{value}</p>
      {(note || trailing) && (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {note && <p className="text-[11px] text-muted-foreground">{note}</p>}
          {trailing}
        </div>
      )}
    </div>
  )
}

export function ConnectionDetailsCard({ info, isLoading }: ConnectionDetailsCardProps) {
  if (isLoading || !info) {
    return (
      <Card className="border-border/80 bg-card/85 backdrop-blur-sm shadow-md">
        <CardHeader>
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/80 bg-card/85 backdrop-blur-sm shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Cable className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-bold">Connection Details</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Point any S3-compatible client at these values. Path-style addressing is always required.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <DetailRow
          icon={<Globe className="h-3.5 w-3.5 text-blue-400" />}
          label="S3 Endpoint"
          value={info.endpoint}
          note="Use with force/path-style addressing"
        />
        <DetailRow
          icon={<MapPin className="h-3.5 w-3.5 text-indigo-400" />}
          label="Region"
          value={info.region}
          note="Fixed in Worker config — changing it requires a redeploy"
        />
        <DetailRow
          icon={<Lock className="h-3.5 w-3.5 text-zinc-400" />}
          label="Addressing Style"
          value="Path-style (forcePathStyle=true)"
          note="Virtual-hosted style is not supported"
        />
        <DetailRow
          icon={<FolderTree className="h-3.5 w-3.5 text-emerald-500" />}
          label="Drive Root Folder"
          value={`/${info.buckets.length} bucket${info.buckets.length === 1 ? "" : "s"} available`}
          copyValue={info.buckets.join(", ")}
          trailing={
            <Link
              to="/"
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Manage buckets
            </Link>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-1">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileCode2 className="h-3.5 w-3.5 text-purple-400" />
              <span>API Reference</span>
            </div>
            <div className="flex items-center gap-3 pt-0.5">
              {info.docsUrl ? (
                <a
                  href={info.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  /docs <ArrowUpRight className="h-3 w-3" />
                </a>
              ) : (
                <Badge variant="neutral" className="text-[10px] px-1.5 py-0">
                  Docs disabled
                </Badge>
              )}
              {info.openApiUrl && (
                <a
                  href={info.openApiUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  /openapi.yaml <ArrowUpRight className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-1">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-cyan-500" />
              <span>CORS Allowed Origins</span>
            </div>
            {info.corsOrigins.length > 0 ? (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {info.corsOrigins.map((origin) => (
                  <code key={origin} className="px-1.5 py-0.5 rounded-md bg-background/70 border border-border/60 text-[10px] font-mono text-foreground/80">
                    {origin}
                  </code>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">No CORS origins — browser access is disabled (CLI-only)</p>
            )}
            <p className="text-[11px] text-muted-foreground">Set via Worker config — changing it requires a redeploy</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
