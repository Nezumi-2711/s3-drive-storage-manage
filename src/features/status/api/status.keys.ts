export const statusKeys = {
  all: ["status"] as const,
  overview: () => [...statusKeys.all, "overview"] as const,
  buckets: () => [...statusKeys.all, "buckets"] as const,
}
