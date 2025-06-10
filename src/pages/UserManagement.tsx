"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import MainLayout from "@/components/MainLayout"
import { fetchUsers, updateUserProfile, createUser, toggleUserActiveStatus } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Edit, User, Plus, UserX, UserCheck } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type CurrentUserData = {
  _id: string
  name: string
  email: string
  role: string
  department?: string
  studentId?: string
  isActive: boolean
}

const UserManagement = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUserData | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<{
    id: string
    name: string
    email: string
    role: "student" | "faculty" | "librarian" | "admin" | "guest"
    department: string
    memberSince: string
    studentId?: string
    isActive: boolean
    inactiveRemark?: string
  } | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{
    id: string
    name: string
    email: string
    role: "student" | "faculty" | "librarian" | "admin" | "guest"
    department: string
    memberSince: string
    studentId?: string
    isActive: boolean
    inactiveRemark?: string
  } | null>(null)
  const [statusRemark, setStatusRemark] = useState("")

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "student" as "student" | "faculty" | "librarian" | "admin" | "guest",
    department: "",
    studentId: "",
  })

  const queryClient = useQueryClient()

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

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users", currentUser?.role],
    queryFn: () => fetchUsers(currentUser?.role),
    enabled: !!currentUser, // Only fetch when currentUser is available
  })

  const updateUserMutation = useMutation({
    mutationFn: ({
      userId,
      userData,
    }: {
      userId: string
      userData: Partial<{
        id: string
        name: string
        email: string
        role: "student" | "faculty" | "librarian" | "admin" | "guest"
        department: string
        memberSince: string
        studentId?: string
        isActive: boolean
        inactiveRemark?: string
      }>
    }) => updateUserProfile(userId, userData),
    onSuccess: () => {
      toast.success("User profile updated successfully!")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setEditingUser(null)
      setIsEditDialogOpen(false)
    },
    onError: () => {
      toast.error("Failed to update user profile. Please try again.")
    },
  })

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success("User created successfully!")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setNewUser({ name: "", email: "", role: "student", department: "", studentId: "" })
      setIsCreateDialogOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create user. Please try again.")
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, isActive, remark }: { userId: string; isActive: boolean; remark?: string }) =>
      toggleUserActiveStatus(userId, isActive, remark),
    onSuccess: () => {
      toast.success("User status updated successfully!")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setIsStatusDialogOpen(false)
      setSelectedUser(null)
      setStatusRemark("")
    },
    onError: () => {
      toast.error("Failed to update user status. Please try again.")
    },
  })

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    updateUserMutation.mutate({
      userId: editingUser.id,
      userData: editingUser,
    })
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that the current user can create this role
    if (!canCreateRole(newUser.role)) {
      toast.error("You don't have permission to create users with this role")
      return
    }

    // Type assertion to match the API expectation
    const roleForAPI = newUser.role as "student" | "faculty" | "guest"

    createUserMutation.mutate({
      name: newUser.name,
      email: newUser.email,
      role: roleForAPI,
      department: newUser.department,
      studentId: newUser.role === "student" ? newUser.studentId : undefined,
    })
  }

  const openEditDialog = (user: {
    id: string
    name: string
    email: string
    role: "student" | "faculty" | "librarian" | "admin" | "guest"
    department: string
    memberSince: string
    studentId?: string
    isActive: boolean
    inactiveRemark?: string
  }) => {
    setEditingUser({ ...user })
    setIsEditDialogOpen(true)
  }

  const openStatusDialog = (user: {
    id: string
    name: string
    email: string
    role: "student" | "faculty" | "librarian" | "admin" | "guest"
    department: string
    memberSince: string
    studentId?: string
    isActive: boolean
    inactiveRemark?: string
  }) => {
    setSelectedUser(user)
    setStatusRemark("")
    setIsStatusDialogOpen(true)
  }

  const handleToggleStatus = (isActive: boolean) => {
    if (!selectedUser) return

    if (!isActive && !statusRemark.trim()) {
      toast.error("Please provide a reason for deactivating the user")
      return
    }

    toggleStatusMutation.mutate({
      userId: selectedUser.id,
      isActive,
      remark: !isActive ? statusRemark : undefined,
    })
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

  const canCreateRole = (role: string) => {
    if (currentUser?.role === "admin") {
      // Admins can create all roles except other admins (for security)
      return ["student", "faculty", "librarian", "guest"].includes(role)
    }
    if (currentUser?.role === "librarian") {
      // Librarians can only create these roles
      return ["student", "faculty", "guest"].includes(role)
    }
    return false
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

  // Show loading while users are being fetched
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading users...</p>
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
          <div className="flex items-center gap-4">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
            </Dialog>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="text-sm text-gray-600">
                {currentUser?.role === "admin" ? "All Users" : "Students & Guests"}
              </span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Users List</CardTitle>
          </CardHeader>
          <CardContent>
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
                {users.map(
                  (user: {
                    id: string
                    name: string
                    email: string
                    role: "student" | "faculty" | "librarian" | "admin" | "guest"
                    department: string
                    memberSince: string
                    studentId?: string
                    isActive: boolean
                    inactiveRemark?: string
                  }) => (
                    <TableRow key={user.id}>
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
                      <TableCell>{user.memberSince}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openStatusDialog(user)}>
                            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="createName">Name</Label>
                <Input
                  id="createName"
                  value={newUser.name}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="createEmail">Email</Label>
                <Input
                  id="createEmail"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="createRole">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) =>
                    setNewUser((prev) => ({
                      ...prev,
                      role: value as "student" | "faculty" | "librarian" | "admin" | "guest",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {canCreateRole("student") && <SelectItem value="student">Student</SelectItem>}
                    {canCreateRole("faculty") && <SelectItem value="faculty">Faculty</SelectItem>}
                    {canCreateRole("guest") && <SelectItem value="guest">Guest</SelectItem>}
                    {currentUser?.role === "admin" && canCreateRole("librarian") && (
                      <SelectItem value="librarian">Librarian</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="createDepartment">Department</Label>
                <Input
                  id="createDepartment"
                  value={newUser.department}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, department: e.target.value }))}
                  required
                />
              </div>
              {newUser.role === "student" && (
                <div>
                  <Label htmlFor="createStudentId">Student ID</Label>
                  <Input
                    id="createStudentId"
                    value={newUser.studentId}
                    onChange={(e) => setNewUser((prev) => ({ ...prev, studentId: e.target.value }))}
                    placeholder="Enter student ID"
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

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
                <Button type="submit" className="w-full" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Status Toggle Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedUser?.isActive ? "Deactivate User" : "Activate User"}</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <p>
                  Are you sure you want to {selectedUser.isActive ? "deactivate" : "activate"} {selectedUser.name}?
                </p>
                {selectedUser.isActive && (
                  <div>
                    <Label htmlFor="statusRemark">Reason for deactivation</Label>
                    <Textarea
                      id="statusRemark"
                      value={statusRemark}
                      onChange={(e) => setStatusRemark(e.target.value)}
                      placeholder="Enter reason for deactivating this user..."
                      required
                    />
                  </div>
                )}
                {!selectedUser.isActive && selectedUser.inactiveRemark && (
                  <div>
                    <Label>Previous deactivation reason:</Label>
                    <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">{selectedUser.inactiveRemark}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setIsStatusDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant={selectedUser.isActive ? "destructive" : "default"}
                    className="flex-1"
                    onClick={() => handleToggleStatus(!selectedUser.isActive)}
                    disabled={toggleStatusMutation.isPending}
                  >
                    {toggleStatusMutation.isPending
                      ? selectedUser.isActive
                        ? "Deactivating..."
                        : "Activating..."
                      : selectedUser.isActive
                        ? "Deactivate"
                        : "Activate"}
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