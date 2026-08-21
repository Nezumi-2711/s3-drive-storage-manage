export const integrationKeys = {
  all: ["integration"] as const,
  info: () => [...integrationKeys.all, "info"] as const,
}
