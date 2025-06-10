"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import MainLayout from "@/components/MainLayout"
import BookSearchBox from "@/components/BookSearchBox"
import { fetchBooks, createBorrowRequest } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type SearchFilters = {
  query: string
  author: string
  genre: string
}

type Book = {
  id: string
  title: string
  author: string
  genre: string
  totalQuantity: number
  availableQuantity: number
  available: boolean
  coverImage: string
}

type UserData = {
  id: string
  name: string
  email: string
  role: "student" | "faculty" | "librarian" | "admin" | "guest"
  department: string
  memberSince: string
  studentId?: string
}

const SearchBooks = () => {
  const [searchResults, setSearchResults] = useState<Book[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const queryClient = useQueryClient()

  // Get user data from localStorage
  useEffect(() => {
    try {
      const userString = localStorage.getItem("user")
      if (userString) {
        const parsedUser = JSON.parse(userString)
        setUserData(parsedUser)
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error)
      setUserData(null)
    }
  }, [])

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
  })

  const borrowRequestMutation = useMutation({
    mutationFn: ({ bookId, bookTitle }: { bookId: string; bookTitle: string }) =>
      createBorrowRequest(bookId, userData?.id || "", userData?.name || "", bookTitle, userData?.role || "student"),
    onSuccess: () => {
      toast.success("Borrow request submitted successfully!")
      queryClient.invalidateQueries({ queryKey: ["borrow-requests"] })
    },
    onError: () => {
      toast.error("Failed to submit borrow request. Please try again.")
    },
  })

  useEffect(() => {
    if (books.length > 0) {
      setSearchResults(books)
    }
  }, [books])

  const handleSearch = (filters: SearchFilters) => {
    setIsSearching(true)

    // Filter books based on search criteria
    const results = books.filter((book) => {
      const matchesTitle = filters.query === "" || book.title.toLowerCase().includes(filters.query.toLowerCase())

      const matchesAuthor = filters.author === "" || book.author.toLowerCase().includes(filters.author.toLowerCase())

      // Handle "all" as a special case for genre
      const matchesGenre =
        filters.genre === "" || filters.genre === "all" || book.genre.toLowerCase() === filters.genre.toLowerCase()

      return matchesTitle && matchesAuthor && matchesGenre
    })

    setSearchResults(results)
    setIsSearching(false)
  }

  const handleBorrowRequest = (book: Book) => {
    if (!userData) {
      toast.error("Please log in to request books")
      return
    }

    if (userData.role === "guest") {
      toast.error("Guests cannot borrow books")
      return
    }

    if (book.availableQuantity <= 0) {
      toast.error("This book is currently not available")
      return
    }

    borrowRequestMutation.mutate({
      bookId: book.id,
      bookTitle: book.title,
    })
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading books...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Search Books</h1>

        <BookSearchBox onSearch={handleSearch} />

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">{searchResults.length} Books Found</h2>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((book) => (
                <Card key={book.id} className="overflow-hidden">
                  <div className="flex h-full">
                    <div className="w-1/3 bg-gray-200">
                      <img
                        src={book.coverImage || "/placeholder.svg"}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardContent className="w-2/3 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold line-clamp-2 mb-1">{book.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {book.genre}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            Available: {book.availableQuantity}/{book.totalQuantity}
                          </span>
                          <Badge
                            variant={book.available ? "outline" : "secondary"}
                            className={book.available ? "bg-green-50 text-green-700 border-green-100" : ""}
                          >
                            {book.available ? "Available" : "Out of Stock"}
                          </Badge>
                        </div>
                      </div>

                      {userData?.role !== "guest" && userData?.role !== "librarian" && userData?.role !== "admin" && (
                        <Button
                          size="sm"
                          className="w-full mt-2"
                          disabled={!book.available || borrowRequestMutation.isPending}
                          onClick={() => handleBorrowRequest(book)}
                        >
                          {borrowRequestMutation.isPending ? "Requesting..." : "Request to Borrow"}
                        </Button>
                      )}
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No books found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

export default SearchBooks