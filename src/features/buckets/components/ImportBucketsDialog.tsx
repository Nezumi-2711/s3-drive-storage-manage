import * as React from "react"
import { Dialog } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { useImportCandidates } from "../hooks/useImportCandidates"
import { useImportBuckets } from "../hooks/useImportBuckets"
import { AlertCircle, DownloadCloud, Folder, RefreshCw, X, FolderCheck, Check, Info } from "lucide-react"

interface ImportBucketsDialogProps {
  open: boolean
  onClose: () => void
}

export function ImportBucketsDialog({ open, onClose }: ImportBucketsDialogProps) {
  const [selectedNames, setSelectedNames] = React.useState<Set<string>>(new Set())
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const { data: candidates, isLoading, error, refetch, isFetching } = useImportCandidates({ enabled: open })
  const { mutate: importMutate, isPending } = useImportBuckets()

  React.useEffect(() => {
    if (open) {
      setSelectedNames(new Set())
      setErrorMessage(null)
    }
  }, [open])

  const toggleSelect = (name: string) => {
    setSelectedNames((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (!candidates) return
    if (selectedNames.size === candidates.length) {
      setSelectedNames(new Set())
    } else {
      setSelectedNames(new Set(candidates.map((c) => c.name)))
    }
  }

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedNames.size === 0) return

    setErrorMessage(null)
    importMutate(Array.from(selectedNames), {
      onSuccess: (result) => {
        if (result.failed.length > 0) {
          const failedDetails = result.failed.map((f) => `${f.name}: ${f.error}`).join(", ")
          setErrorMessage(`Import completed with errors: ${failedDetails}`)
        } else {
          onClose()
        }
      },
      onError: (err) => {
        setErrorMessage(err.message || "Failed to import buckets")
      },
    })
  }

  const allSelected = Boolean(candidates && candidates.length > 0 && selectedNames.size === candidates.length)

  return (
    <Dialog open={open} onClose={onClose} className="max-w-lg overflow-hidden border-border/80 bg-card/95 backdrop-blur-md shadow-2xl">
      <form onSubmit={handleImport} className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border/60 bg-linear-to-r from-blue-500/5 via-indigo-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-xs">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Import from Drive</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Move root Drive folders into your managed storage root
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Error messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2.5 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2.5 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Failed to load Drive folders: {error.message}</span>
            </div>
          )}

          {/* Subheader Toolbar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              {candidates ? (
                <>
                  <span className="font-semibold text-foreground">{candidates.length}</span> candidate folder{candidates.length === 1 ? "" : "s"} found
                </>
              ) : (
                "Scanning Google Drive..."
              )}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-7.5 text-xs px-2.5 gap-1.5 font-medium border-border/80 bg-background/60 hover:bg-muted/70 shadow-xs"
                title="Rescan root folders"
              >
                <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin text-blue-500" : ""}`} />
                <span className="hidden sm:inline">Rescan</span>
              </Button>
              {candidates && candidates.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-7.5 text-xs px-2.5 font-medium border-border/80 bg-background/60 hover:bg-muted/70 shadow-xs"
                >
                  {allSelected ? "Deselect All" : "Select All"}
                </Button>
              )}
            </div>
          </div>

          {/* Folder Candidate List */}
          <div className="max-h-64 overflow-y-auto rounded-xl border border-border/70 bg-background/50 divide-y divide-border/50 shadow-inner">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                <span>Scanning Google Drive root folders...</span>
              </div>
            ) : !candidates || candidates.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-1">
                <div className="p-2.5 rounded-full bg-muted/60 text-muted-foreground w-fit mx-auto mb-2">
                  <FolderCheck className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-foreground">No Unmanaged Folders</div>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                  All root folders in Google Drive are already managed or no other top-level folders exist.
                </p>
              </div>
            ) : (
              candidates.map((candidate) => {
                const isSelected = selectedNames.has(candidate.name)
                return (
                  <label
                    key={candidate.folderId}
                    className={`flex items-center justify-between p-3 cursor-pointer transition-colors select-none ${
                      isSelected
                        ? "bg-blue-500/10 dark:bg-blue-500/15"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(candidate.name)}
                          disabled={isPending}
                          className="peer sr-only"
                        />
                        <div
                          className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white shadow-xs shadow-blue-500/30"
                              : "border-border/80 bg-card hover:border-border"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-3" />}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1 rounded-md bg-amber-500/10 text-amber-500 shrink-0">
                          <Folder className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                          {candidate.name}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] sm:text-xs font-mono font-medium text-muted-foreground px-2 py-0.5 rounded-md bg-muted/60 shrink-0 border border-border/40 ml-2">
                      {candidate.objectCount} {candidate.objectCount === 1 ? "object" : "objects"}
                    </span>
                  </label>
                )
              })
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Info className="w-3.5 h-3.5 shrink-0 text-blue-500" />
            <span>Selected folders will be moved under your configured storage root directory.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 p-4 sm:px-6 bg-muted/30 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
            className="h-9 px-3.5 font-medium border-border/80 bg-background/70 hover:bg-muted/80 shadow-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={selectedNames.size === 0 || isPending}
            className="h-9 px-4 font-medium shadow-sm shadow-blue-500/25 gap-1.5"
          >
            {isPending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <DownloadCloud className="w-3.5 h-3.5" />
                <span>Import {selectedNames.size > 0 ? `(${selectedNames.size})` : ""}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
