import { ChevronRight, Database, Folder } from "lucide-react"
import { Link } from "react-router"
import { parsePrefixBreadcrumbs } from "../lib/prefix"

interface ObjectBreadcrumbProps {
  bucket: string
  prefix: string
  onNavigatePrefix: (prefix: string) => void
}

export function ObjectBreadcrumb({ bucket, prefix, onNavigatePrefix }: ObjectBreadcrumbProps) {
  const segments = parsePrefixBreadcrumbs(prefix)

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground overflow-x-auto py-2">
      <Link
        to="/"
        className="flex items-center gap-1.5 hover:text-foreground transition-colors shrink-0"
      >
        <Database className="w-4 h-4 text-primary" />
        <span>Buckets</span>
      </Link>

      <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground/50" />

      <button
        type="button"
        onClick={() => onNavigatePrefix("")}
        className={`hover:text-foreground font-medium transition-colors shrink-0 ${
          prefix === "" ? "text-foreground font-semibold" : ""
        }`}
      >
        {bucket}
      </button>

      {segments.map((seg, idx) => {
        const isLast = idx === segments.length - 1
        return (
          <div key={seg.prefix} className="flex items-center space-x-1 shrink-0">
            <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground/50" />
            <button
              type="button"
              onClick={() => onNavigatePrefix(seg.prefix)}
              className={`flex items-center gap-1 hover:text-foreground transition-colors ${
                isLast ? "text-foreground font-semibold" : ""
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-primary/70" />
              <span>{seg.name}</span>
            </button>
          </div>
        )
      })}
    </nav>
  )
}
