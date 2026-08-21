import { useState, useMemo } from "react"
import {
  FolderTree,
  FolderOpen,
  RotateCw,
  Sparkles,
  AlertCircle,
  Plus,
  DownloadCloud,
  Trash2,
  Files,
  Search,
  Globe,
  Lock,
  ArrowUpDown,
  HardDrive,
  CheckCircle2,
  RefreshCw,
  Cable,
} from "lucide-react"
import { Link } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatBytes, formatRelativeTime } from "@/lib/format"
import { fetchBucketStats } from "../api/status.api"
import { statusKeys } from "../api/status.keys"
import type { BucketStatsResponse } from "../api/status.types"
import { useUpdateBucket } from "../../buckets/hooks/useUpdateBucket"
import { CreateBucketDialog } from "../../buckets/components/CreateBucketDialog"
import { DeleteBucketDialog } from "../../buckets/components/DeleteBucketDialog"
import { ImportBucketsDialog } from "../../buckets/components/ImportBucketsDialog"

interface BucketStatsTableProps {
  stats?: BucketStatsResponse
  isLoading: boolean
  error?: Error | null
}

type SortField = "name" | "objectCount" | "totalSize" | "lastModified"
type SortOrder = "asc" | "desc"
type FilterTab = "all" | "public" | "private"

export function BucketStatsTable({ stats, isLoading, error }: BucketStatsTableProps) {
  const queryClient = useQueryClient()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [deletingBucket, setDeletingBucket] = useState<string | null>(null)
  const [updatingBucket, setUpdatingBucket] = useState<string | null>(null)

  // Search, filter and sorting states
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTab, setFilterTab] = useState<FilterTab>("all")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  const { mutate: updateBucketMutate } = useUpdateBucket()

  const handleForceRefresh = async () => {
    try {
      setIsRefreshing(true)
      const data = await fetchBucketStats(undefined, true)
      queryClient.setQueryData(statusKeys.buckets(), data)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleTogglePublicRead = (bucketName: string, currentPublic: boolean) => {
    setUpdatingBucket(bucketName)
    updateBucketMutate(
      {
        name: bucketName,
        data: { publicRead: !currentPublic },
      },
      {
        onSettled: () => {
          setUpdatingBucket(null)
        },
      },
    )
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const buckets = stats?.buckets || []

  // Count summaries
  const publicCount = useMemo(() => buckets.filter((b) => b.publicRead).length, [buckets])
  const privateCount = useMemo(() => buckets.filter((b) => !b.publicRead).length, [buckets])

  // Filtered and sorted bucket list
  const filteredBuckets = useMemo(() => {
    return buckets
      .filter((bucket) => {
        // Tab filter
        if (filterTab === "public" && !bucket.publicRead) return false
        if (filterTab === "private" && bucket.publicRead) return false

        // Search term filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim()
          return bucket.name.toLowerCase().includes(term)
        }
        return true
      })
      .sort((a, b) => {
        let comp = 0
        if (sortField === "name") {
          comp = a.name.localeCompare(b.name)
        } else if (sortField === "objectCount") {
          comp = (a.objectCount || 0) - (b.objectCount || 0)
        } else if (sortField === "totalSize") {
          comp = (a.totalSize || 0) - (b.totalSize || 0)
        } else if (sortField === "lastModified") {
          const timeA = a.lastModified ? new Date(a.lastModified).getTime() : 0
          const timeB = b.lastModified ? new Date(b.lastModified).getTime() : 0
          comp = timeA - timeB
        }
        return sortOrder === "asc" ? comp : -comp
      })
  }, [buckets, filterTab, searchTerm, sortField, sortOrder])

  return (
    <>
      <Card className="w-full border-border/80 bg-card/90 backdrop-blur-md shadow-lg overflow-hidden flex flex-col transition-all">
        {/* Top Header Section */}
        <div className="border-b border-border/70 bg-gradient-to-r from-muted/30 via-background/40 to-muted/20 px-4 py-5 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title & Stats Badges */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600/15 via-indigo-600/15 to-cyan-500/15 border border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-xs">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                      Bucket Explorer
                    </CardTitle>
                    {stats && (
                      <Badge variant="neutral" className="text-[11px] font-semibold px-2 py-0.5 border border-border/80">
                        {stats.totals.buckets} {stats.totals.buckets === 1 ? "Bucket" : "Buckets"}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Explore and manage S3 storage buckets mapped directly to Google Drive folders
                  </CardDescription>
                </div>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportOpen(true)}
                disabled={isLoading}
                className="h-8 text-xs px-3 rounded-lg gap-1.5 font-medium shadow-xs"
                title="Import existing Google Drive folders into your storage root"
              >
                <DownloadCloud className="h-3.5 w-3.5 text-blue-500" />
                <span>Import from Drive</span>
              </Button>

              <Button
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                disabled={isLoading}
                className="h-8 text-xs px-3.5 rounded-lg gap-1.5 font-medium shadow-sm shadow-blue-500/20"
                title="Create a new storage bucket"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Bucket</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleForceRefresh}
                disabled={isLoading || isRefreshing}
                className="h-8 text-xs px-2.5 rounded-lg gap-1.5 font-medium shadow-xs"
                title="Recalculate bucket stats from live storage"
              >
                <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-blue-500" : ""}`} />
                <span className="hidden sm:inline">{isRefreshing ? "Scanning..." : "Recalculate"}</span>
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar (when stats loaded) */}
          {stats && stats.buckets.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 border border-border/60">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                  <HardDrive className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Total Storage</div>
                  <div className="text-xs font-bold text-foreground font-mono truncate">{formatBytes(stats.totals.totalSize)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 border border-border/60">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                  <Files className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Total Objects</div>
                  <div className="text-xs font-bold text-foreground font-mono truncate">{stats.totals.objectCount.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 border border-border/60">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Public Buckets</div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono truncate">{publicCount}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 border border-border/60">
                <div className="p-1.5 rounded-lg bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 shrink-0">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Private Buckets</div>
                  <div className="text-xs font-bold text-foreground font-mono truncate">{privateCount}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <CardContent className="p-4 sm:p-6 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-9 w-64 rounded-lg" />
                <Skeleton className="h-9 w-32 rounded-lg" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : error || !stats ? (
            <div className="p-8 rounded-2xl border border-destructive/30 bg-destructive/5 text-center space-y-3">
              <div className="p-3 rounded-full bg-destructive/10 text-destructive w-fit mx-auto">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-destructive">Failed to Load Bucket Stats</div>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">{error?.message || "Unknown error occurred"}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleForceRefresh} className="h-8 text-xs gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Connection</span>
              </Button>
            </div>
          ) : stats.buckets.length === 0 ? (
            <div className="py-12 px-4 rounded-2xl border border-dashed border-border/80 flex flex-col items-center justify-center text-center bg-muted/15 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                <FolderTree className="h-8 w-8" />
              </div>
              <div className="max-w-md space-y-1">
                <div className="text-base font-bold text-foreground">No Buckets Configured Yet</div>
                <p className="text-xs text-muted-foreground">
                  Create a new storage bucket or discover and import existing Google Drive folders from your configured storage root.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <Button size="sm" onClick={() => setIsCreateOpen(true)} className="h-8 text-xs px-4 gap-1.5 shadow-sm shadow-blue-500/20 font-medium">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Bucket</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)} className="h-8 text-xs px-4 gap-1.5 font-medium">
                  <DownloadCloud className="h-3.5 w-3.5 text-blue-500" />
                  <span>Import from Google Drive</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search, Filter Tabs & Sort Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search buckets by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-8 text-xs bg-background/70 border-border/70 rounded-lg focus-visible:ring-1"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground p-0.5 rounded-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto p-1 bg-muted/50 rounded-lg border border-border/60">
                  <button
                    type="button"
                    onClick={() => setFilterTab("all")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      filterTab === "all"
                        ? "bg-card text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All ({buckets.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab("public")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                      filterTab === "public"
                        ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Globe className="h-3 w-3" />
                    <span>Public ({publicCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab("private")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                      filterTab === "private"
                        ? "bg-card text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Lock className="h-3 w-3" />
                    <span>Private ({privateCount})</span>
                  </button>
                </div>
              </div>

              {/* No match state */}
              {filteredBuckets.length === 0 ? (
                <div className="py-10 text-center rounded-xl border border-dashed border-border/70 bg-muted/10 space-y-2">
                  <Search className="h-6 w-6 text-muted-foreground mx-auto" />
                  <div className="text-xs font-semibold text-foreground">No buckets matched your search</div>
                  <p className="text-[11px] text-muted-foreground">
                    Try changing your search term or clearing the active filter.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setFilterTab("all")
                    }}
                    className="h-7 text-xs text-blue-600 hover:text-blue-500"
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <>
                  {/* Desktop Table View (>= md screens) */}
                  <div className="hidden md:block overflow-hidden rounded-xl border border-border/80 bg-card/40 shadow-xs">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border/70 select-none">
                        <tr>
                          <th className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => handleSort("name")}
                              className="flex items-center gap-1.5 hover:text-foreground transition-colors font-semibold"
                            >
                              <span>Bucket Name</span>
                              <ArrowUpDown className={`h-3 w-3 ${sortField === "name" ? "text-blue-500" : "opacity-40"}`} />
                            </button>
                          </th>
                          <th className="py-3 px-4">Access Policy</th>
                          <th className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleSort("objectCount")}
                              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors font-semibold ml-auto"
                            >
                              <span>Objects</span>
                              <ArrowUpDown className={`h-3 w-3 ${sortField === "objectCount" ? "text-blue-500" : "opacity-40"}`} />
                            </button>
                          </th>
                          <th className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleSort("totalSize")}
                              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors font-semibold ml-auto"
                            >
                              <span>Total Size</span>
                              <ArrowUpDown className={`h-3 w-3 ${sortField === "totalSize" ? "text-blue-500" : "opacity-40"}`} />
                            </button>
                          </th>
                          <th className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleSort("lastModified")}
                              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors font-semibold ml-auto"
                            >
                              <span>Last Modified</span>
                              <ArrowUpDown className={`h-3 w-3 ${sortField === "lastModified" ? "text-blue-500" : "opacity-40"}`} />
                            </button>
                          </th>
                          <th className="py-3 px-4 text-center w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {filteredBuckets.map((b) => {
                          const isUpdating = updatingBucket === b.name
                          return (
                            <tr
                              key={b.name}
                              className="hover:bg-muted/40 transition-colors group"
                            >
                              {/* Name column */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/15 transition-colors">
                                    <FolderTree className="h-4 w-4" />
                                  </div>
                                  <div className="flex flex-col">
                                    <Link
                                      to={`/buckets/${encodeURIComponent(b.name)}`}
                                      className="font-mono font-semibold text-foreground text-xs hover:text-primary hover:underline"
                                    >
                                      {b.name}
                                    </Link>
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                      s3://{b.name}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Access policy */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <Switch
                                    checked={b.publicRead}
                                    disabled={isUpdating}
                                    onCheckedChange={() => handleTogglePublicRead(b.name, b.publicRead)}
                                    className="data-[state=checked]:bg-emerald-500"
                                  />
                                  <div className="flex items-center gap-1.5">
                                    {b.publicRead ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                        <Globe className="h-3 w-3" />
                                        Public Read
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                        <Lock className="h-3 w-3" />
                                        Private
                                      </span>
                                    )}
                                    {isUpdating && <RotateCw className="h-3 w-3 animate-spin text-blue-500" />}
                                  </div>
                                </div>
                              </td>

                              {/* Object count */}
                              <td className="py-3 px-4 text-right">
                                {b.error ? (
                                  <span className="text-destructive font-mono text-[11px]">Error</span>
                                ) : (
                                  <div className="inline-flex items-center gap-1 font-mono font-medium text-foreground">
                                    <span>{b.truncated ? `≥ ${b.objectCount.toLocaleString()}` : b.objectCount.toLocaleString()}</span>
                                  </div>
                                )}
                              </td>

                              {/* Size */}
                              <td className="py-3 px-4 text-right">
                                {b.error ? (
                                  <span className="text-muted-foreground">—</span>
                                ) : (
                                  <span className="font-mono font-semibold text-foreground">
                                    {formatBytes(b.totalSize)}
                                  </span>
                                )}
                              </td>

                              {/* Last modified */}
                              <td className="py-3 px-4 text-right">
                                {b.error ? (
                                  <span className="text-destructive text-[11px] font-medium" title={b.error}>
                                    Scan failed
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-[11px]">
                                    {formatRelativeTime(b.lastModified)}
                                  </span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Link to={`/buckets/${encodeURIComponent(b.name)}`}>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                      title="Browse objects"
                                    >
                                      <FolderOpen className="h-3.5 w-3.5" />
                                    </Button>
                                  </Link>
                                  <Link to={`/integration?bucket=${encodeURIComponent(b.name)}`}>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                      title="Connect a tool to this bucket"
                                    >
                                      <Cable className="h-3.5 w-3.5" />
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeletingBucket(b.name)}
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                    title="Delete bucket"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile & Tablet Card List View (< md screens) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
                    {filteredBuckets.map((b) => {
                      const isUpdating = updatingBucket === b.name
                      return (
                        <div
                          key={b.name}
                          className="p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm space-y-3 shadow-xs hover:border-border transition-all"
                        >
                          {/* Header of bucket card */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                                <FolderTree className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <Link
                                  to={`/buckets/${encodeURIComponent(b.name)}`}
                                  className="font-mono font-bold text-sm text-foreground truncate hover:text-primary hover:underline block"
                                >
                                  {b.name}
                                </Link>
                                <div className="text-[10px] font-mono text-muted-foreground">s3://{b.name}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <Link to={`/buckets/${encodeURIComponent(b.name)}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                                  title="Browse objects"
                                >
                                  <FolderOpen className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                              <Link to={`/integration?bucket=${encodeURIComponent(b.name)}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-lg"
                                  title="Connect a tool to this bucket"
                                >
                                  <Cable className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingBucket(b.name)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg shrink-0"
                                title="Delete bucket"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Stats Grid inside card */}
                          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-secondary/40 border border-border/50 text-xs">
                            <div>
                              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Size</span>
                              <span className="font-mono font-bold text-foreground">
                                {b.error ? "—" : formatBytes(b.totalSize)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Objects</span>
                              <span className="font-mono font-bold text-foreground">
                                {b.error ? "Error" : b.truncated ? `≥ ${b.objectCount}` : b.objectCount}
                              </span>
                            </div>
                          </div>

                          {/* Access Policy & Last Updated */}
                          <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={b.publicRead}
                                disabled={isUpdating}
                                onCheckedChange={() => handleTogglePublicRead(b.name, b.publicRead)}
                                className="data-[state=checked]:bg-emerald-500 scale-90"
                              />
                              <span className={`text-[11px] font-medium ${b.publicRead ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}`}>
                                {b.publicRead ? "Public Read" : "Private"}
                              </span>
                            </div>

                            <span className="text-[10px] text-muted-foreground font-medium">
                              {b.error ? "Scan error" : formatRelativeTime(b.lastModified)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* S3 capabilities bottom bar */}
          <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1">S3 API Support:</span>
              {[
                { name: "s3:ListObjectsV2", desc: "List bucket objects" },
                { name: "s3:GetObject", desc: "Download objects" },
                { name: "s3:PutObject", desc: "Upload files" },
                { name: "s3:DeleteObject", desc: "Delete files" },
                { name: "s3:CreateMultipartUpload", desc: "Multipart uploads" },
              ].map((api) => (
                <span
                  key={api.name}
                  title={api.desc}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-secondary/80 text-secondary-foreground border border-border/60 hover:border-border transition-colors cursor-default"
                >
                  <Sparkles className="h-2.5 w-2.5 text-blue-500" />
                  {api.name}
                </span>
              ))}
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span>Direct Google Drive mapping active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateBucketDialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <DeleteBucketDialog
        open={Boolean(deletingBucket)}
        onClose={() => setDeletingBucket(null)}
        bucketName={deletingBucket}
      />
      <ImportBucketsDialog open={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </>
  )
}
