"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface UserData {
  id: string
  name: string
  email: string
  role: string
  department: string
  memberSince: string
  studentId?: string
}

const ProfileForm = () => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    studentId: "",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load user data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userString = localStorage.getItem("user")
        if (userString) {
          const parsedUser = JSON.parse(userString)
          setUserData(parsedUser)
          setFormData({
            name: parsedUser.name || "",
            email: parsedUser.email || "",
            department: parsedUser.department || "",
            studentId: parsedUser.studentId || "",
          })
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error)
        toast.error("Error loading user profile")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Update user data in localStorage
      if (userData) {
        const updatedUser = {
          ...userData,
          name: formData.name,
          email: formData.email,
          department: formData.department,
          studentId: formData.studentId,
        }

        localStorage.setItem("user", JSON.stringify(updatedUser))
        setUserData(updatedUser)
      }

      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsEditing(false)
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Label>Student ID</Label>
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Label>Member Since</Label>
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No user data found. Please log in again.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing || isSaving}
              className="dark:bg-gray-800"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing || isSaving}
              className="dark:bg-gray-800"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={!isEditing || isSaving || userData?.role === "guest"}
              className="dark:bg-gray-800"
            />
          </div>

          {userData?.role === "student" && (
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                disabled={!isEditing || isSaving}
                className="dark:bg-gray-800"
                placeholder="Enter your student ID"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Member Since</Label>
            <Input value={userData?.memberSince || ""} disabled className="bg-gray-50 dark:bg-gray-800" />
          </div>

          <div className="flex justify-end space-x-3">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    // Reset form data to original values
                    setFormData({
                      name: userData.name || "",
                      email: userData.email || "",
                      department: userData.department || "",
                      studentId: userData.studentId || "",
                    })
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)} disabled={userData?.role === "guest"}>
                {userData?.role === "guest" ? "Guest accounts can't edit profile" : "Edit Profile"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default ProfileForm