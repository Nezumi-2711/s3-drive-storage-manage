import { ShieldCheck, ArrowUpRight, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { GatewayConfig } from "../api/status.types"

interface GatewayConfigCardProps {
  gateway?: GatewayConfig
  isLoading: boolean
}

export function GatewayConfigCard({ gateway, isLoading }: GatewayConfigCardProps) {
  if (isLoading) {
    return (
      <Card className="border-border/80 bg-card/85 backdrop-blur-sm shadow-md flex flex-col justify-between">
        <div>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56 mt-1" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </CardContent>
        </div>
      </Card>
    )
  }

  const creds = gateway?.credentials
  const hasS3Keys = creds?.s3Keys ?? false
  const hasOAuth = creds?.googleOAuth ?? false
  const hasPassword = creds?.dashboardPassword ?? false

  return (
    <Card className="border-border/80 bg-card/85 backdrop-blur-sm shadow-md flex flex-col justify-between">
      <div>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-bold">Security &amp; Protocol</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Authentication and credential verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* AWS SigV4 */}
          <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-1">
            <div className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>AWS Signature Version 4</span>
              <Badge variant={hasS3Keys ? "success" : "danger"} className="text-[10px] px-1.5 py-0">
                {hasS3Keys ? "Configured" : "Missing Keys"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              {hasS3Keys ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500 shrink-0" />
              )}
              <span>HMAC-SHA256 request authentication</span>
            </p>
          </div>

          {/* Google OAuth */}
          <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-1">
            <div className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Google OAuth 2.0</span>
              <Badge variant={hasOAuth ? "success" : "danger"} className="text-[10px] px-1.5 py-0">
                {hasOAuth ? "Auto-Refresh" : "Not Configured"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              {hasOAuth ? (
                <CheckCircle2 className="h-3 w-3 text-blue-500 shrink-0" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500 shrink-0" />
              )}
              <span>Token rotation via Cloudflare KV</span>
            </p>
          </div>

          {/* Dashboard Auth */}
          <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-1">
            <div className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Dashboard Access</span>
              <Badge variant={hasPassword ? "success" : "warning"} className="text-[10px] px-1.5 py-0">
                {hasPassword ? "Password Protected" : "No Password"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Bearer token session with rate limiting &amp; lockout
            </p>
          </div>
        </CardContent>
      </div>

      <div className="p-4 border-t border-border/60 bg-muted/10">
        <a
          href="https://developers.google.com/drive"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-between w-full text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <span>Google Drive API Reference</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </Card>
  )
}
