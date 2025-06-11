"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import MainLayout from "@/components/MainLayout"
import ProfileForm from "@/components/ProfileForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { borrowedBooks } from "@/lib/data"
import { fetchBorrowedBooks } from "@/lib/api"
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

const Profile = () => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [userLoading, setUserLoading] = useState(true)

  // Load user data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userString = localStorage.getItem("user")
        if (userString) {
          const parsedUser = JSON.parse(userString)
          setUserData(parsedUser)
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error)
      } finally {
        setUserLoading(false)
      }
    }

    loadUserData()
  }, [])

  const { data: apiBooks, isLoading } = useQuery({
    queryKey: ["borrowedBooks"],
    queryFn: fetchBorrowedBooks,
    // Use local data as fallback if API call fails
    meta: {
      onError: (err: Error) => {
        console.error("Error fetching borrowed books:", err)
      },
    },
  })

  // Use API data if available, otherwise fall back to local data
  const books = apiBooks || borrowedBooks

  // Some statistics for the profile page
  const booksBorrowed = books.length
  const booksOverdue = books.filter((book) => new Date(book.returnDate) < new Date()).length
  const totalFines = books.reduce((sum, book) => sum + book.fine, 0)

  // Check if user should see library usage stats
  const shouldShowStats = userData?.role !== "librarian" && userData?.role !== "admin"

  // Show loading state while user data is being loaded
  if (userLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Profile</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (!userData) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Profile</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <p>Please log in to view your profile.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProfileForm />
          </div>

          <div className="space-y-6">
            {/* Library Card */}
            <Card className="bg-gradient-to-r from-blue-500 to-blue-700 text-white dark:from-blue-700 dark:to-blue-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Library Card</CardTitle>
              </CardHeader>
              <CardContent>
                <h2 className="text-xl font-bold mb-1">{userData.name}</h2>
                <p className="text-sm text-blue-100">{userData.department}</p>
                <div className="mt-6 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-blue-200">Member Since</p>
                    <p className="text-sm">{userData.memberSince}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-200">Role</p>
                    <p className="text-sm capitalize">{userData.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {
                    shouldShowStats? "Library Usage" : ""
                  }
                  {/* Library Usage */}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : shouldShowStats ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Books Borrowed</span>
                      <span className="font-semibold">{booksBorrowed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Books Overdue</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">{booksOverdue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Current Fines</span>
                      <span className="font-semibold">₹{totalFines.toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div></div>
                  // <div className="text-center py-4">
                  //   <p className="text-gray-500 text-sm">
                  //     Library usage statistics are not available for {userData.role} accounts.
                  //   </p>
                  // </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Profile