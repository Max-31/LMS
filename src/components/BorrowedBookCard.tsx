"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, calculateDaysLeft } from "@/lib/dateUtils"
import { PaymentModal } from "@/components/PaymentModal"
import { toast } from "sonner"
// import { useAuth } from "@/lib/AuthContext";

type BorrowedBookProps = {
  id: string
  title: string
  author: string
  issueDate: string
  returnDate: string
  fine: number
  coverImage: string
}

type UserData = {
  id?: string
  name?: string
  email?: string
  role?: string
}

const BorrowedBookCard = ({ id, title, author, issueDate, returnDate, fine, coverImage }: BorrowedBookProps) => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [localFine, setLocalFine] = useState(fine)
  const daysLeft = calculateDaysLeft(returnDate)
  const isOverdue = daysLeft < 0

  // Parse user data from localStorage
  let userData: UserData = {}
  try {
    const userString = localStorage.getItem("user")
    if (userString) {
      userData = JSON.parse(userString)
    }
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error)
  }

  const handlePaymentSuccess = () => {
    setLocalFine(0)
    toast.success(`Fine paid successfully for "${title}"`)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 flex">
        {/* Book cover */}
        <div className="w-24 h-32 bg-gray-200 flex-shrink-0">
          <img
            src={coverImage || "/placeholder.svg"}
            alt={`Cover of ${title}`}
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Book details */}
        <div className="p-4 flex-1">
          <h3 className="font-semibold text-base line-clamp-2">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{author}</p>

          <div className="mt-3 flex flex-col space-y-1">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <CalendarIcon className="h-3 w-3 mr-1" />
              <span>Borrowed: {formatDate(issueDate)}</span>
            </div>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <CalendarIcon className="h-3 w-3 mr-1" />
              <span>Due: {formatDate(returnDate)}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            {isOverdue ? (
              <Badge variant="destructive" className="text-xs">
                Overdue by {Math.abs(daysLeft)} days
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900 dark:border-blue-800 dark:text-blue-300"
              >
                {daysLeft} days left
              </Badge>
            )}

            {localFine > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                  Fine: ₹{localFine.toFixed(2)}
                </span>
                {(userData?.role === "student" || userData?.role === "faculty") && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={() => setIsPaymentOpen(true)}
                  >
                    Pay
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        setIsOpen={setIsPaymentOpen}
        amount={localFine}
        bookTitle={title}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </Card>
  )
}

export default BorrowedBookCard