import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/providers/ThemeProvider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
  variant?: "outline" | "ghost" | "default" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

export function ThemeToggle({
  className,
  showLabel = false,
  variant = "outline",
  size = "icon",
}: ThemeToggleProps) {
  const { theme, resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={cn(
        "h-9 w-9 rounded-xl transition-all duration-200 cursor-pointer shrink-0",
        className
      )}
      title={`Current: ${theme} (click to switch to ${isDark ? "light" : "dark"} mode)`}
      aria-label={`Current theme: ${theme}. Click to switch to ${isDark ? "light" : "dark"} mode.`}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Moon className="h-4 w-4 text-cyan-400 transition-transform duration-200 hover:scale-110" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500 transition-transform duration-200 hover:scale-110" />
        )}
      </div>
      {showLabel && (
        <span className="capitalize hidden min-[360px]:inline ml-1.5 text-xs">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </Button>
  )
}
