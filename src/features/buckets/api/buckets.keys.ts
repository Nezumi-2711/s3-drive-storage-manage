export const bucketKeys = {
  all: ["buckets"] as const,
  importCandidates: () => [...bucketKeys.all, "import-candidates"] as const,
}
