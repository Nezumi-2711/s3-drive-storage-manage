import { useEffect, useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  value: string
  label?: string
  className?: string
}

/**
 * Ghost button that copies `value` to the clipboard and flips to a check mark for 2 seconds.
 */
export function CopyButton({ value, label, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => setCopied(true))
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={cn(
        "h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground",
        copied && "text-emerald-500 hover:text-emerald-500",
        className,
      )}
      title={copied ? "Copied" : "Copy"}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      {label !== undefined && <span className="text-xs">{copied ? "Copied" : label}</span>}
    </Button>
  )
}
