import * as React from "react"

export type Theme = "light" | "dark" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

interface ThemeContextType {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "s3-drive-ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored
      }
    } catch {
      // localStorage may be unavailable in some private browsing modes
    }
    return defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return theme
  })

  React.useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const applyTheme = () => {
      const currentResolved =
        theme === "system" ? (mediaQuery.matches ? "dark" : "light") : theme

      setResolvedTheme(currentResolved)
      root.classList.remove("light", "dark")
      root.classList.add(currentResolved)
      root.style.colorScheme = currentResolved
    }

    applyTheme()

    const listener = () => {
      if (theme === "system") {
        applyTheme()
      }
    }

    mediaQuery.addEventListener("change", listener)
    return () => mediaQuery.removeEventListener("change", listener)
  }, [theme])

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch {
        // ignore storage write errors
      }
      setThemeState(newTheme)
    },
    [storageKey]
  )

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextType {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
