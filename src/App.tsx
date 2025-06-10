import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
// import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { ThemeProvider } from "@/lib/ThemeContext"
import Index from "./pages/Index"
import SearchBooks from "./pages/SearchBooks"
import BorrowedBooks from "./pages/BorrowedBooks"
import DueDates from "./pages/DueDates"
import Profile from "./pages/Profile"
import Notifications from "./pages/Notifications"
import BookManagement from "./pages/BookManagement"
import BorrowRequests from "./pages/BorrowRequests"
import UserManagement from "./pages/UserManagement"
import GenreManagement from "./pages/GenreManagement"
import BookReturns from "./pages/BookReturns"
import NotFound from "./pages/NotFound"
import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword"
import Signup from "./pages/Signup"

const queryClient = new QueryClient()

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("user")

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Role-based route protection
const RoleProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles: string[]
}) => {
  const userData = localStorage.getItem("user")

  if (!userData) {
    return <Navigate to="/login" replace />
  }

  try {
    const user = JSON.parse(userData)
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />
    }
  } catch (error) {
    console.error("Error parsing user data:", error)
    localStorage.removeItem("user")
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchBooks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/borrowed"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["student", "faculty"]}>
              <BorrowedBooks />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/due-dates"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["student", "faculty"]}>
              <DueDates />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book-management"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["librarian", "admin"]}>
              <BookManagement />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/genre-management"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["librarian", "admin"]}>
              <GenreManagement />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-management"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["librarian", "admin"]}>
              <UserManagement />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/borrow-requests"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["librarian", "admin"]}>
              <BorrowRequests />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/book-returns"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={["librarian", "admin"]}>
              <BookReturns />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      {/* <AuthProvider> */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
      {/* </AuthProvider> */}
    </ThemeProvider>
  </QueryClientProvider>
)

export default App