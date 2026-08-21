import { useState } from "react"
import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  Copy,
  Download,
  File,
  Folder,
  Trash2,
} from "lucide-react"
import { Button } from "../../../components/ui/button"
import { formatBytes, formatRelativeTime } from "../../../lib/format"
import type { S3FolderItem, S3ObjectItem } from "../api/objects.types"

interface ObjectTableProps {
  bucket: string
  folders: S3FolderItem[]
  objects: S3ObjectItem[]
  truncated: boolean
  onNavigateFolder: (prefix: string) => void
  onDownloadObject: (key: string) => void
  onDeleteObject: (key: string) => void
  onDeleteFolder: (prefix: string, name: string) => void
}

type SortField = "name" | "size" | "lastModified"
type SortOrder = "asc" | "desc"

export function ObjectTable({
  bucket,
  folders,
  objects,
  truncated,
  onNavigateFolder,
  onDownloadObject,
  onDeleteObject,
  onDeleteFolder,
}: ObjectTableProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [filterQuery, setFilterQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  const handleCopyUri = (key: string) => {
    const uri = `s3://${bucket}/${key}`
    navigator.clipboard.writeText(uri).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  // Filter folders and objects
  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(filterQuery.toLowerCase())
  )

  const filteredObjects = objects.filter((o) =>
    o.name.toLowerCase().includes(filterQuery.toLowerCase())
  )

  // Sort objects
  const sortedObjects = [...filteredObjects].sort((a, b) => {
    let cmp = 0
    if (sortField === "name") {
      cmp = a.name.localeCompare(b.name)
    } else if (sortField === "size") {
      cmp = a.size - b.size
    } else if (sortField === "lastModified") {
      const timeA = a.lastModified ? new Date(a.lastModified).getTime() : 0
      const timeB = b.lastModified ? new Date(b.lastModified).getTime() : 0
      cmp = timeA - timeB
    }
    return sortOrder === "asc" ? cmp : -cmp
  })

  const isEmpty = filteredFolders.length === 0 && sortedObjects.length === 0

  return (
    <div className="space-y-3">
      {truncated && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Listing is truncated</p>
            <p className="text-muted-foreground mt-0.5">
              This folder contains too many items and results were truncated at the maximum scan cap.
              Navigate into subfolders to inspect items in smaller scopes.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Filter by name in this folder..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="text-xs h-8 px-3 rounded-md border border-input bg-background/50 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-full max-w-xs"
        />
        <div className="text-xs text-muted-foreground shrink-0">
          {folders.length} folder{folders.length === 1 ? "" : "s"},{" "}
          {objects.length} file{objects.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground">
              <tr>
                <th className="py-2.5 px-3 font-medium">
                  <button
                    type="button"
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <span>Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 font-medium w-28">
                  <button
                    type="button"
                    onClick={() => handleSort("size")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <span>Size</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 font-medium w-36 hidden sm:table-cell">
                  <button
                    type="button"
                    onClick={() => handleSort("lastModified")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <span>Last Modified</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 font-medium w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {isEmpty ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    {filterQuery ? "No items match your filter" : "This folder is empty"}
                  </td>
                </tr>
              ) : (
                <>
                  {/* Folders */}
                  {filteredFolders.map((folder) => (
                    <tr
                      key={folder.prefix}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => onNavigateFolder(folder.prefix)}
                          className="flex items-center gap-2 text-foreground font-medium hover:text-primary transition-colors text-left"
                        >
                          <Folder className="w-4 h-4 text-primary fill-primary/20 shrink-0" />
                          <span className="truncate">{folder.name}/</span>
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">—</td>
                      <td className="py-2.5 px-3 text-muted-foreground hidden sm:table-cell">—</td>
                      <td className="py-2.5 px-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteFolder(folder.prefix, folder.name)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete folder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {/* Objects */}
                  {sortedObjects.map((obj) => (
                    <tr
                      key={obj.key}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2 text-foreground">
                          <File className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="truncate" title={obj.key}>
                            {obj.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {formatBytes(obj.size)}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground hidden sm:table-cell">
                        {obj.lastModified ? formatRelativeTime(obj.lastModified) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyUri(obj.key)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Copy s3:// URI"
                          >
                            {copiedKey === obj.key ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onDownloadObject(obj.key)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Download object"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteObject(obj.key)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Delete object"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
