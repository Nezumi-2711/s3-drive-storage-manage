import type { GraceSeconds } from "../api/integration.types"

export const GRACE_OPTIONS: Array<{ value: GraceSeconds; label: string; hint: string }> = [
  { value: 0, label: "Revoke now", hint: "Old key stops working immediately" },
  { value: 3600, label: "1 hour", hint: "Short overlap for quick migrations" },
  { value: 86400, label: "24 hours", hint: "Recommended — a day to update clients" },
  { value: 604800, label: "7 days", hint: "Long overlap for slow rollouts" },
]
