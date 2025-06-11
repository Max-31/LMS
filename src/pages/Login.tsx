import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { BookOpen, User, Lock, Mail, Building, BadgeIcon as IdCard, ArrowLeft } from "lucide-react"

type AuthMode = "login" | "register" | "forgot-password"
const url = "http://localhost:5000"

const Login = () => {
  const [mode, setMode] = useState<AuthMode>("login")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    department: "",
    studentId: "",
    role: "student",
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${url}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          toast.error("Your account has been deactivated. Please contact administration.")
        } else if (response.status === 400) {
          toast.error(data.message || "Invalid credentials")
        } else {
          toast.error(data.message || "Login failed")
        }
        return
      }

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(data.user))
      toast.success("Login successful!")
      navigate("/")
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An unexpected error occurred during login.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const requestBody = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        studentId: formData.studentId,
      }

      console.log("Attempting registration with:", requestBody)

      const response = await fetch(`${url}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Registration response status:", response.status)

      const contentType = response.headers.get("content-type")
      let data = null

      if (contentType && contentType.includes("application/json")) {
        const text = await response.text()
        console.log("Registration response text:", text)
        if (text) {
          try {
            data = JSON.parse(text)
            console.log("Parsed registration data:", data)
          } catch (parseError) {
            console.error("JSON parse error:", parseError)
            toast.error("Invalid response from server")
            return
          }
        } else {
          console.error("Empty response body")
          toast.error("Server returned empty response")
          return
        }
      } else {
        const text = await response.text()
        console.error("Non-JSON response:", text)
        toast.error("Server returned an invalid response format")
        return
      }

      if (!response.ok) {
        if (response.status === 400) {
          toast.error(data?.message || "User already exists with this email")
        } else if (response.status === 404) {
          toast.error("Registration endpoint not found. Please check your server configuration.")
        } else if (response.status === 500) {
          toast.error(data?.message || "Server error during registration")
        } else {
          toast.error(data?.message || "Registration failed")
        }
        return
      }

      toast.success("Registration successful! Please login with your credentials.")
      setMode("login")
      // Clear form data except email for convenience
      setFormData((prev) => ({
        ...prev,
        password: "",
        name: "",
        department: "",
        studentId: "",
      }))
    } catch (error) {
      console.error("Registration error:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error("Unable to connect to server. Please check if the server is running on the correct port.")
      } else {
        toast.error("An unexpected error occurred during registration.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${url}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("No user found with this email address")
        } else {
          toast.error(data.message || "Failed to process password reset")
        }
        return
      }

      toast.success("Password reset instructions would be sent to your email")
      setMode("login")
    } catch (error) {
      console.error("Forgot password error:", error)
      toast.error("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const getTitle = () => {
    switch (mode) {
      case "register":
        return "Create Account"
      case "forgot-password":
        return "Reset Password"
      default:
        return "Library Management System"
    }
  }

  const getSubtitle = () => {
    switch (mode) {
      case "register":
        return "Create a new account to get started"
      case "forgot-password":
        return "Enter your email to reset your password"
      default:
        return "Sign in to access your account"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            {mode !== "login" && (
              <Button variant="ghost" size="sm" onClick={() => setMode("login")} className="absolute left-4 top-4">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">{getTitle()}</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">{getSubtitle()}</p>
        </CardHeader>
        <CardContent>
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: string) => handleInputChange("role", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="librarian">Librarian</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setMode("forgot-password")}
                  className="text-blue-600 hover:underline"
                >
                  Forgot your password?
                </button>
                <button type="button" onClick={() => setMode("register")} className="text-blue-600 hover:underline">
                  Create account
                </button>
              </div>
            </form>
          )}

          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Create a password"
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: string) => handleInputChange("role", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="librarian">Librarian</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="department"
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    placeholder="Enter your department"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {formData.role === "student" && (
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <div className="relative">
                    <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="studentId"
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange("studentId", e.target.value)}
                      placeholder="Enter your student ID"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <button type="button" onClick={() => setMode("login")} className="text-blue-600 hover:underline">
                  Sign in
                </button>
              </div>
            </form>
          )}

          {mode === "forgot-password" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Instructions"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Remember your password? </span>
                <button type="button" onClick={() => setMode("login")} className="text-blue-600 hover:underline">
                  Sign in
                </button>
              </div>
            </form>
          )}

          {mode === "login" && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Demo Credentials:</p>
              <div className="text-xs space-y-1 text-gray-500 dark:text-gray-500">
                <p>
                  <strong>Student:</strong> student@test.com
                </p>
                <p>
                  <strong>Faculty:</strong> faculty@test.com
                </p>
                <p>
                  <strong>Librarian:</strong> librarian@test.com
                </p>
                <p>
                  <strong>Admin:</strong> admin@test.com
                </p>
                <p>
                  <strong>Guest:</strong> guest@test.com
                </p>
                <p>
                  <strong>Password:</strong> password123
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Login