import { useNavigate } from "react-router"
import {
  Database,
  LogOut,
  Cable,
} from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useStatus } from "@/features/status/hooks/useStatus"
import { useBucketStats } from "@/features/status/hooks/useBucketStats"
import { SystemOverviewCard } from "@/features/status/components/SystemOverviewCard"
import { BucketStatsTable } from "@/features/status/components/BucketStatsTable"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function Dashboard() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

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

  return (
    <div className="relative min-h-screen bg-background bg-grid-pattern flex flex-col overflow-x-hidden">
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
            <button
              type="button"
              onClick={() => navigate("/integration")}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-secondary/70 border border-border/60 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors cursor-pointer"
              title="Connection details and S3 access keys"
            >
              <Cable className="h-3.5 w-3.5 text-blue-500" />
              <span className="hidden min-[480px]:inline">Integration</span>
            </button>
            <ThemeToggle showLabel={false} />
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
        {/* Unified Status / Quick Overview */}
        <SystemOverviewCard
          status={statusData}
          isLoading={isStatusLoading}
          error={statusError}
        />

        {/* Feature Capabilities & Specifications */}
        <div className="w-full">
          <BucketStatsTable
            stats={bucketStatsData}
            isLoading={isBucketsLoading}
            error={bucketsError}
          />
        </div>
      </main>
    </div>
  )
}
