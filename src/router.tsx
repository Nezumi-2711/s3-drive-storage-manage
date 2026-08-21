import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import SignIn from "@/pages/SignIn"
import Dashboard from "@/pages/Dashboard"
import BucketBrowser from "@/pages/BucketBrowser"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { PublicOnlyRoute } from "@/components/PublicOnlyRoute"

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/sign-in"
          element={
            <PublicOnlyRoute>
              <SignIn />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buckets/:bucket"
          element={
            <ProtectedRoute>
              <BucketBrowser />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
