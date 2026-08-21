import { ArrowLeft, Database, HardDrive, Shield } from "lucide-react"
import { Link, useParams, useSearchParams } from "react-router"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { ThemeToggle } from "../components/ThemeToggle"
import { useBucketStats } from "../features/status/hooks/useBucketStats"
import { ObjectBrowser } from "../features/objects/components/ObjectBrowser"
import { normalizePrefix } from "../features/objects/lib/prefix"
import { useLogout } from "../features/auth/hooks/useLogout"

export function BucketBrowser() {
  const { bucket = "" } = useParams<{ bucket: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: statsData } = useBucketStats()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()

  const rawPrefix = searchParams.get("prefix") || ""
  const prefix = normalizePrefix(rawPrefix)

  const handleNavigatePrefix = (newPrefix: string) => {
    const normalized = normalizePrefix(newPrefix)
    if (!normalized) {
      searchParams.delete("prefix")
    } else {
      searchParams.set("prefix", normalized)
    }
    setSearchParams(searchParams)
  }

  const currentBucket = statsData?.buckets?.find((b) => b.name === bucket)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 group text-foreground font-semibold text-lg hover:text-primary transition-colors"
            >
              <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <HardDrive className="w-5 h-5 text-primary" />
              </div>
              <span className="hidden sm:inline">S3 Drive Storage</span>
            </Link>

            <span className="text-muted-foreground/50">/</span>

            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-sm sm:text-base">{bucket}</span>
              {currentBucket?.publicRead && (
                <Badge variant="outline" className="text-[10px] py-0 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                  Public Read
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="text-xs"
            >
              <Shield className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button type="button" variant="ghost" size="sm" className="text-xs h-8">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to Overview
            </Button>
          </Link>
        </div>

        <ObjectBrowser
          bucket={bucket}
          prefix={prefix}
          onNavigatePrefix={handleNavigatePrefix}
        />
      </main>
    </div>
  )
}
export default BucketBrowser
