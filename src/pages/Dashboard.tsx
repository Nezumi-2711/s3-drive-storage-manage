import { useNavigate } from "react-router"
import {
  Database,
  LogOut,
  ShieldCheck,
  HardDrive,
  Layers,
  Server,
  Activity,
  FolderTree,
  UploadCloud,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Radio,
  Cpu,
  Sparkles,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Dashboard() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate("/sign-in", { replace: true })
  }

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
                Connected to Google Drive API with AWS S3 signature verification and multipart upload support via Cloudflare Workers.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/80 shadow-xs">
                <Radio className="h-4 w-4 text-emerald-500 animate-pulse" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Edge Network</div>
                  <div className="text-xs font-bold text-foreground">Global CDN Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status / Quick Overview cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Card 1 */}
          <Card className="relative overflow-hidden border-border/80 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg hover:border-blue-500/30 transition-all group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Gateway Engine
              </CardTitle>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                <Server className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2 text-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
                Online &amp; Healthy
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                <Activity className="h-3 w-3 text-emerald-500" />
                <span>Cloudflare Worker edge routing</span>
              </p>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="relative overflow-hidden border-border/80 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg hover:border-blue-500/30 transition-all group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                S3 Storage Backend
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                <HardDrive className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">Google Drive</div>
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-blue-500" />
                <span>Root directory auto-mapped</span>
              </p>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="relative overflow-hidden border-border/80 bg-card/90 backdrop-blur-sm shadow-md hover:shadow-lg hover:border-cyan-500/30 transition-all group">
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
              <div className="text-2xl font-bold text-foreground">Durable Objects</div>
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                <Cpu className="h-3 w-3 text-cyan-500" />
                <span>Resumable state coordination</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Capabilities & Explorer Card */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Explorer placeholder */}
          <Card className="lg:col-span-2 border-border/80 bg-card/85 backdrop-blur-sm shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <FolderTree className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base font-bold">Bucket Explorer</CardTitle>
                </div>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                  Upcoming Module
                </span>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Full-featured visual browser for files, folders, and storage metadata.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="h-48 rounded-xl border border-dashed border-border flex flex-col items-center justify-center p-6 text-center bg-muted/20">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-500 mb-3">
                  <UploadCloud className="h-6 w-6 stroke-[1.8]" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">Storage Bridge Ready</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Sign-in verification complete. Ready for bucket exploration, object uploads, downloads, and presigned URL operations.
                </p>
              </div>

              {/* Supported S3 Actions badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[11px] font-medium text-muted-foreground mr-1">Supported APIs:</span>
                {["s3:ListObjectsV2", "s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:CreateMultipartUpload"].map((api) => (
                  <span
                    key={api}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-secondary/80 text-secondary-foreground border border-border/60"
                  >
                    <Sparkles className="h-2.5 w-2.5 text-blue-500" />
                    {api}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Specifications Info card */}
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
                  Compliance and encryption standards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-1">
                  <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>AWS Signature Version 4</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Enabled</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Cryptographic HMAC-SHA256 request authentication
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-secondary/40 border border-border/60 space-y-1">
                  <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Google OAuth 2.0</span>
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">Auto-Refresh</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Bearer token rotation via Cloudflare KV store
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
        </div>
      </main>
    </div>
  )
}
