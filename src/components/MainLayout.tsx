"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import {
  BookOpen,
  Search,
  Calendar,
  UserRound,
  BellRing,
  Menu,
  X,
  LogOut,
  Plus,
  FileText,
  Users,
  RotateCcw,
  List,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { toast } from "sonner"

type SidebarProps = {
  children: React.ReactNode
}

interface User {
  _id: string
  name: string
  email: string
  role: string
  department?: string
  studentId?: string
  isActive: boolean
}

const MainLayout = ({ children }: SidebarProps) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Load user data from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("user")
      }
    }
  }, [])

  // Base navigation items for all users
  const baseNavItems = [
    { path: "/", label: "Dashboard", icon: <BookOpen className="h-5 w-5" /> },
    { path: "/search", label: "Search Books", icon: <Search className="h-5 w-5" /> },
  ]

  // Student/Faculty specific items
  const userNavItems = [
    { path: "/borrowed", label: "Borrowed Books", icon: <BookOpen className="h-5 w-5" /> },
    { path: "/due-dates", label: "Due Dates", icon: <Calendar className="h-5 w-5" /> },
    { path: "/profile", label: "Profile", icon: <UserRound className="h-5 w-5" /> },
    { path: "/notifications", label: "Notifications", icon: <BellRing className="h-5 w-5" /> },
  ]

  // Librarian/Admin specific items
  const librarianNavItems = [
    { path: "/book-management", label: "Manage Books", icon: <Plus className="h-5 w-5" /> },
    { path: "/genre-management", label: "Manage Genres", icon: <List className="h-5 w-5" /> },
    { path: "/borrow-requests", label: "Borrow Requests", icon: <FileText className="h-5 w-5" /> },
    { path: "/book-returns", label: "Book Returns", icon: <RotateCcw className="h-5 w-5" /> },
    { path: "/profile", label: "Profile", icon: <UserRound className="h-5 w-5" /> },
    { path: "/notifications", label: "Notifications", icon: <BellRing className="h-5 w-5" /> },
  ]

  // Admin specific items (includes user management)
  const adminNavItems = [
    { path: "/book-management", label: "Manage Books", icon: <Plus className="h-5 w-5" /> },
    { path: "/genre-management", label: "Manage Genres", icon: <List className="h-5 w-5" /> },
    { path: "/user-management", label: "Manage Users", icon: <Users className="h-5 w-5" /> },
    { path: "/borrow-requests", label: "Borrow Requests", icon: <FileText className="h-5 w-5" /> },
    { path: "/book-returns", label: "Book Returns", icon: <RotateCcw className="h-5 w-5" /> },
    { path: "/profile", label: "Profile", icon: <UserRound className="h-5 w-5" /> },
    { path: "/notifications", label: "Notifications", icon: <BellRing className="h-5 w-5" /> },
  ]

  // Determine navigation items based on user role
  const getNavItems = () => {
    if (!user) return baseNavItems

    if (user.role === "guest") {
      return baseNavItems
    } else if (user.role === "admin") {
      return [...baseNavItems, ...adminNavItems]
    } else if (user.role === "librarian") {
      return [
        ...baseNavItems,
        ...librarianNavItems,
        { path: "/user-management", label: "Manage Students", icon: <Users className="h-5 w-5" /> },
      ]
    } else {
      return [...baseNavItems, ...userNavItems]
    }
  }

  const navItems = getNavItems()

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen)
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    toast.success("Logged out successfully")
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4 md:hidden flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-lg">Library MS</span>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={toggleMobileNav} aria-label="Toggle menu">
            {isMobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      {/* Sidebar - Desktop always visible, mobile conditional */}
      <aside
        className={cn(
          "bg-white dark:bg-gray-800 w-64 shadow-md md:shadow-sm flex-shrink-0 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out",
          "fixed md:sticky top-0 md:top-0 h-full md:h-screen z-40",
          isMobileNavOpen ? "left-0" : "-left-full md:left-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 hidden md:block">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-lg">Library MS</span>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 flex items-center space-x-3 border-b border-gray-200 dark:border-gray-700">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-medium text-sm">{user?.name || "Loading..."}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || "guest"}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname === item.path
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                    )}
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              className="w-full text-sm flex items-center justify-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}

export default MainLayout