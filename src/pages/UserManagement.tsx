"use client"

import type React from "react"

import { useState, useEffect } from "react"
import MainLayout from "@/components/MainLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Edit, UserIcon, Search, UserX } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const API_URL = "http://localhost:5000"

type CurrentUserData = {
  _id: string
  name: string
  email: string
  role: string
  department?: string
  studentId?: string
  isActive: boolean
}

type UserData = {
  _id: string
  name: string
  email: string
  role: "student" | "faculty" | "librarian" | "admin" | "guest"
  department: string
  createdAt: string
  studentId?: string
  isActive: boolean
  inactiveRemark?: string
}

const UserManagement = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUserData | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [statusRemark, setStatusRemark] = useState("")

  // Load current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setCurrentUser(parsedUser)
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("user")
      }
    }
    setUserLoading(false)
  }, [])

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/users`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  // Filter users based on search query and filters
  useEffect(() => {
    let filtered = [...users]

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.studentId && user.studentId.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => (statusFilter === "active" ? user.isActive : !user.isActive))
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, roleFilter, statusFilter])

  // Fetch users when component mounts and currentUser is available
  useEffect(() => {
    if (currentUser) {
      fetchUsers()
    }
  }, [currentUser])

  // Update user
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      const response = await fetch(`${API_URL}/api/users/${editingUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          department: editingUser.department,
          studentId: editingUser.studentId,
          role: editingUser.role,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast.success("User profile updated successfully!")
      fetchUsers() // Refresh the users list
      setEditingUser(null)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Failed to update user profile. Please try again.")
    }
  }

  // Deactivate user
  const handleDeactivateUser = async () => {
    if (!selectedUser) return

    if (!statusRemark.trim()) {
      toast.error("Please provide a reason for deactivating the user")
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/users/${selectedUser._id}/deactivate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          remark: statusRemark,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast.success("User deactivated successfully!")
      fetchUsers() // Refresh the users list
      setIsStatusDialogOpen(false)
      setSelectedUser(null)
      setStatusRemark("")
    } catch (error) {
      console.error("Error deactivating user:", error)
      toast.error("Failed to deactivate user. Please try again.")
    }
  }

  const openEditDialog = (user: UserData) => {
    setEditingUser({ ...user })
    setIsEditDialogOpen(true)
  }

  const openStatusDialog = (user: UserData) => {
    setSelectedUser(user)
    setStatusRemark("")
    setIsStatusDialogOpen(true)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-50 text-red-700 border-red-100"
      case "librarian":
        return "bg-blue-50 text-blue-700 border-blue-100"
      case "faculty":
        return "bg-green-50 text-green-700 border-green-100"
      case "student":
        return "bg-yellow-50 text-yellow-700 border-yellow-100"
      case "guest":
        return "bg-gray-50 text-gray-700 border-gray-100"
      default:
        return ""
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Show loading while user data is being loaded
  if (userLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading user data...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Show message if no user is logged in
  if (!currentUser) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <p>Please log in to access user management.</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            <span className="text-sm text-gray-600">
              {currentUser?.role === "admin" ? "All Users" : "Students & Guests"}
            </span>
          </div>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search Users</Label>
                <Input
                  id="search"
                  placeholder="Search by name, email, or student ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="roleFilter">Filter by Role</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="librarian">Librarian</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="statusFilter">Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Users List ({filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"} found)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <p>Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <UserIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No users found matching your criteria.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Member Since</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.studentId || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.isActive ? "outline" : "secondary"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {!user.isActive && user.inactiveRemark && (
                            <span className="text-xs text-gray-500" title={user.inactiveRemark}>
                              (Remark available)
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.isActive && (
                            <Button variant="ghost" size="sm" onClick={() => openStatusDialog(user)}>
                              <UserX className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User Profile</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <Label htmlFor="editName">Name</Label>
                  <Input
                    id="editName"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editEmail">Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editDepartment">Department</Label>
                  <Input
                    id="editDepartment"
                    value={editingUser.department}
                    onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, department: e.target.value } : null))}
                    required
                  />
                </div>
                {editingUser.role === "student" && (
                  <div>
                    <Label htmlFor="editStudentId">Student ID</Label>
                    <Input
                      id="editStudentId"
                      value={editingUser.studentId || ""}
                      onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, studentId: e.target.value } : null))}
                      placeholder="Enter student ID"
                    />
                  </div>
                )}
                {currentUser?.role === "admin" && (
                  <div>
                    <Label htmlFor="editRole">Role</Label>
                    <Select
                      value={editingUser.role}
                      onValueChange={(value) =>
                        setEditingUser((prev) =>
                          prev
                            ? { ...prev, role: value as "student" | "faculty" | "librarian" | "admin" | "guest" }
                            : null,
                        )
                      }
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
                )}
                <Button type="submit" className="w-full">
                  Update User
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Deactivate User Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Deactivate User</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <p>
                  Are you sure you want to deactivate <strong>{selectedUser.name}</strong>?
                </p>
                <div>
                  <Label htmlFor="statusRemark">Reason for deactivation *</Label>
                  <Textarea
                    id="statusRemark"
                    value={statusRemark}
                    onChange={(e) => setStatusRemark(e.target.value)}
                    placeholder="Enter reason for deactivating this user..."
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setIsStatusDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={handleDeactivateUser}>
                    Deactivate User
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}

export default UserManagement