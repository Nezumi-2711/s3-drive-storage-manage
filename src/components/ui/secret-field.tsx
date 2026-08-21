import { Eye, EyeOff } from "lucide-react"
import { Button } from "./button"
import { CopyButton } from "./copy-button"
import { cn } from "@/lib/utils"

interface SecretFieldProps {
  value: string
  onReveal: () => void
  isRevealing: boolean
  className?: string
}

/**
 * Masked secret value with an eye toggle (reveal can lazily fetch) and a copy button
 * that only appears once the value is visible.
 */
export function SecretField({ value, onReveal, isRevealing, className }: SecretFieldProps) {
  const revealed = value.length > 0

  return (
    <div className={cn("flex items-center gap-1 min-w-0", className)}>
      <span className="font-mono text-xs truncate flex-1" title={revealed ? value : undefined}>
        {revealed ? value : "••••••••••••••••••••"}
      </span>
      {revealed && <CopyButton value={value} />}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onReveal}
        disabled={isRevealing || revealed}
        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
        title={revealed ? "Secret revealed" : isRevealing ? "Revealing..." : "Reveal secret"}
      >
        {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </Button>
    </div>
  )
}
