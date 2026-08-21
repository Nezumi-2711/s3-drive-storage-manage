import { useState } from "react"
import { KeyRound, Plus, RotateCw, Trash2, TimerReset } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { SecretField } from "@/components/ui/secret-field"
import { formatRelativeTime } from "@/lib/format"
import { useRevealSecret } from "../hooks/useRevealSecret"
import type { AccessKeyMetadata } from "../api/integration.types"

interface AccessKeyTableProps {
  accessKeys?: AccessKeyMetadata[]
  maxKeys: number
  isLoading: boolean
  onCreateKey: () => void
  onRotateKey: (key: AccessKeyMetadata) => void
  onRevokeKey: (key: AccessKeyMetadata) => void
}

function keyStatus(key: AccessKeyMetadata): { variant: "success" | "warning"; label: string } {
  if (!key.expiresAt) {
    return { variant: "success", label: "Active" }
  }
  const remainingMs = new Date(key.expiresAt).getTime() - Date.now()
  if (remainingMs <= 0) {
    return { variant: "warning", label: "Expired" }
  }
  const hours = Math.floor(remainingMs / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  return {
    variant: "warning",
    label: days >= 1 ? `Expires in ${days}d ${hours % 24}h` : `Expires in ${hours}h`,
  }
}

export function AccessKeyTable({ accessKeys, maxKeys, isLoading, onCreateKey, onRotateKey, onRevokeKey }: AccessKeyTableProps) {
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, string>>({})
  const revealMutation = useRevealSecret()

  const handleReveal = (accessKeyId: string) => {
    if (revealedSecrets[accessKeyId]) return
    revealMutation.mutate(accessKeyId, {
      onSuccess: (data) => {
        setRevealedSecrets((prev) => ({ ...prev, [accessKeyId]: data.secretAccessKey }))
      },
    })
  }

  return (
    <Card className="border-border/80 bg-card/85 backdrop-blur-sm shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">S3 Access Keys</CardTitle>
              <CardDescription className="text-xs">
                One key per integration — rotate and revoke independently.
                {accessKeys && (
                  <span className="ml-1 font-semibold">
                    {accessKeys.length}/{maxKeys} used
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <Button
            size="sm"
            onClick={onCreateKey}
            disabled={isLoading || (accessKeys?.length ?? 0) >= maxKeys}
            className="h-8 text-xs px-3 rounded-lg gap-1.5 font-medium shadow-sm shadow-blue-500/20"
            title={accessKeys && accessKeys.length >= maxKeys ? `Maximum of ${maxKeys} keys reached` : "Create a new access key pair"}
          >
            <Plus className="h-3.5 w-3.5" />
            New Key
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </>
        ) : !accessKeys || accessKeys.length === 0 ? (
          <div className="py-8 px-4 rounded-xl border border-dashed border-border/80 bg-muted/15 flex flex-col items-center justify-center text-center gap-2">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <KeyRound className="h-6 w-6" />
            </div>
            <div className="text-sm font-bold text-foreground">No access keys</div>
            <p className="text-xs text-muted-foreground max-w-sm">
              S3 clients are locked out until a key exists. Create one to connect tools like rclone or backup scripts.
            </p>
          </div>
        ) : (
          accessKeys.map((key) => {
            const status = keyStatus(key)
            const isRevealing = revealMutation.isPending && revealMutation.variables === key.accessKeyId
            const revealError = revealMutation.isError && revealMutation.variables === key.accessKeyId

            return (
              <div
                key={key.accessKeyId}
                className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 space-y-2.5 hover:border-border transition-colors"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-foreground truncate">{key.label}</span>
                    <Badge variant={status.variant} className="text-[10px] px-1.5 py-0 shrink-0">
                      {status.variant === "success" && <TimerReset className="hidden" />}
                      {status.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRotateKey(key)}
                      disabled={isRevealing}
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg gap-1"
                      title="Create a replacement key with the same label"
                    >
                      <RotateCw className="h-3 w-3" />
                      Rotate
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRevokeKey(key)}
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg gap-1"
                      title="Permanently revoke this key"
                    >
                      <Trash2 className="h-3 w-3" />
                      Revoke
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Access Key ID</span>
                    <div className="flex items-center gap-1 min-w-0">
                      <code className="font-mono text-xs text-foreground truncate">{key.accessKeyId}</code>
                    </div>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Secret Access Key</span>
                    <SecretField
                      value={revealedSecrets[key.accessKeyId] ?? ""}
                      onReveal={() => handleReveal(key.accessKeyId)}
                      isRevealing={isRevealing}
                    />
                    {revealError && (
                      <p className="text-[11px] text-destructive">{revealMutation.error?.message || "Failed to reveal secret"}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50 text-[11px] text-muted-foreground flex-wrap">
                  <span>Created {formatRelativeTime(key.createdAt)}</span>
                  {key.expiresAt && <span className="font-medium">Retires {formatRelativeTime(key.expiresAt)}</span>}
                </div>
              </div>
            )
          })
        )}

        <p className="text-[11px] text-muted-foreground pt-1">
          Note: revoke and rotate take up to 60 seconds to propagate globally due to edge caching. Secrets are stored
          readable server-side — anyone with dashboard access can reveal them.
        </p>
      </CardContent>
    </Card>
  )
}
