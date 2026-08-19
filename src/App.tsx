import { QueryProvider } from "@/providers/QueryProvider"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { AppRouter } from "@/router"

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <QueryProvider>
        <AppRouter />
      </QueryProvider>
    </ThemeProvider>
  )
}
