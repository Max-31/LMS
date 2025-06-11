"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/MainLayout"
import WelcomeBar from "@/components/WelcomeBar"
import BorrowedBookCard from "@/components/BorrowedBookCard"
import LMSInfo from "@/components/LMSInfo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { borrowedBooks, notifications } from "@/lib/data"
import NotificationItem from "@/components/NotificationItem"
import { calculateDaysLeft } from "@/lib/dateUtils"
import { BookOpen } from "lucide-react"

interface UserData {
  id: string
  name: string
  email: string
  role: string
  department: string
  memberSince: string
  studentId?: string
}

const Index = () => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const userString = localStorage.getItem("user")
      if (userString) {
        const parsedUser = JSON.parse(userString)
        setUserData(parsedUser)
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Default values for when no user is logged in
  const userName = userData?.name || "Guest User"
  const userRole = userData?.role || "guest"

  // Only show up to 3 books for the dashboard preview
  const recentBorrowedBooks = borrowedBooks.slice(0, 3)

  // Sort books by due date (closest first)
  const upcomingDueDates = [...borrowedBooks]
    .sort((a, b) => {
      const daysLeftA = calculateDaysLeft(a.returnDate)
      const daysLeftB = calculateDaysLeft(b.returnDate)
      return daysLeftA - daysLeftB
    })
    .filter((book) => calculateDaysLeft(book.returnDate) >= 0)
    .slice(0, 2)

  // Only show unread notifications for the dashboard
  const unreadNotifications = notifications.filter((notif) => !notif.read).slice(0, 3)

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <WelcomeBar UserName={userName} UserRole={userRole} />

        {/* LMS Information Section */}
        <LMSInfo />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recently Borrowed Books */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Recently Borrowed Books</CardTitle>
                <CardDescription>Your most recently borrowed items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentBorrowedBooks.length > 0 ? (
                  recentBorrowedBooks.map((book) => <BorrowedBookCard key={book.id} {...book} />)
                ) : (
                  <div className="text-center py-6">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-300" />
                    <p className="mt-2 text-gray-500">
                      {userData ? "You haven't borrowed any books yet" : "Please log in to view your borrowed books"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            {/* Upcoming Due Dates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Upcoming Due Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingDueDates.length > 0 ? (
                  upcomingDueDates.map((book) => {
                    const daysLeft = calculateDaysLeft(book.returnDate)
                    return (
                      <div key={book.id} className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <div>
                          <p className="font-medium text-sm">{book.title}</p>
                          <p className="text-xs text-gray-500">Due in {daysLeft} days</p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center py-2 text-gray-500 text-sm">No upcoming due dates</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Notifications */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {unreadNotifications.length > 0 ? (
                  unreadNotifications.map((notification) => (
                    <NotificationItem key={notification.id} {...notification} />
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-500 text-sm">No new notifications</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Index