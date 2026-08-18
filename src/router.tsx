import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import SignIn from "@/pages/SignIn"
import Dashboard from "@/pages/Dashboard"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
