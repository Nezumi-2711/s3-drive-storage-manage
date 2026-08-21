export const objectKeys = {
  all: ["objects"] as const,
  lists: () => [...objectKeys.all, "list"] as const,
  list: (bucket: string, prefix = "") => [...objectKeys.lists(), bucket, prefix] as const,
  details: () => [...objectKeys.all, "detail"] as const,
  metadata: (bucket: string, key: string) => [...objectKeys.details(), bucket, key] as const,
}
