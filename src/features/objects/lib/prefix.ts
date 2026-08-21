export interface BreadcrumbSegment {
  name: string
  prefix: string
}

/**
 * Normalizes a prefix string so that:
 * - Empty string or "/" becomes ""
 * - Any non-empty folder prefix ends with a single "/"
 * - Leading slashes are trimmed
 */
export function normalizePrefix(prefix = ""): string {
  const trimmed = prefix.replace(/^\/+/, "")
  if (!trimmed || trimmed === "/") return ""
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`
}

/**
 * Parses a prefix like "documents/2024/august/" into breadcrumb items:
 * [
 *   { name: "documents", prefix: "documents/" },
 *   { name: "2024", prefix: "documents/2024/" },
 *   { name: "august", prefix: "documents/2024/august/" }
 * ]
 */
export function parsePrefixBreadcrumbs(prefix = ""): BreadcrumbSegment[] {
  const normalized = normalizePrefix(prefix)
  if (!normalized) return []

  const parts = normalized.split("/").filter(Boolean)
  const segments: BreadcrumbSegment[] = []
  let accumulated = ""

  for (const part of parts) {
    accumulated += `${part}/`
    segments.push({
      name: part,
      prefix: accumulated,
    })
  }

  return segments
}

/**
 * Returns parent prefix of a given prefix.
 * "photos/vacation/2024/" -> "photos/vacation/"
 * "photos/" -> ""
 */
export function getParentPrefix(prefix = ""): string {
  const normalized = normalizePrefix(prefix)
  if (!normalized) return ""
  const parts = normalized.split("/").filter(Boolean)
  if (parts.length <= 1) return ""
  return `${parts.slice(0, -1).join("/")}/`
}
