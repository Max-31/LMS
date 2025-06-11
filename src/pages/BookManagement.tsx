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
import { toast } from "sonner"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// API base URL
const API_URL = "http://localhost:5000"

type Book = {
  _id: string
  title: string
  author: string
  genre: { _id: string; name: string }
  isbn: string
  totalCopies: number
  availableCopies: number
  isActive: boolean
  coverImage?: string
}

type NewBookData = {
  title: string
  author: string
  genre: string
  isbn: string
  totalCopies: number
}

const BookManagement = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [newBook, setNewBook] = useState<NewBookData>({
    title: "",
    author: "",
    genre: "",
    isbn: "",
    totalCopies: 1,
  })
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [bookToDelete, setBookToDelete] = useState<string | null>(null)
  const [genres, setGenres] = useState<{ _id: string; name: string }[]>([])

  // Fetch all books
  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/books`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setBooks(data.books || [])
    } catch (error) {
      console.error("Error fetching books:", error)
      toast.error("Failed to load books. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch genres for the dropdown
  const fetchGenres = async () => {
    try {
      const response = await fetch(`${API_URL}/api/genres`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setGenres(data || [])
    } catch (error) {
      console.error("Error fetching genres:", error)
      toast.error("Failed to load genres. Please try again.")
    }
  }

  // Fetch a single book by ID
  const fetchBookById = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/books/${id}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Error fetching book ${id}:`, error)
      toast.error("Failed to load book details. Please try again.")
      return null
    }
  }

  // Add a new book
  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newBook.title || !newBook.author || !newBook.genre || !newBook.isbn) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newBook.title,
          author: newBook.author,
          genre: newBook.genre,
          isbn: newBook.isbn,
          totalCopies: newBook.totalCopies,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      toast.success("Book added successfully!")
      setNewBook({
        title: "",
        author: "",
        genre: "",
        isbn: "",
        totalCopies: 1,
      })
      setIsAddDialogOpen(false)
      fetchBooks() // Refresh the books list
    } catch (error) {
      console.error("Error adding book:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add book. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Update a book
  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingBook) return

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/books/${editingBook._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingBook.title,
          author: editingBook.author,
          genre: editingBook.genre._id,
          isbn: editingBook.isbn,
          totalCopies: editingBook.totalCopies,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      toast.success("Book updated successfully!")
      setIsEditDialogOpen(false)
      fetchBooks() // Refresh the books list
    } catch (error) {
      console.error("Error updating book:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update book. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Delete a book (soft delete by setting isActive to false)
  const handleDeleteBook = async () => {
    if (!bookToDelete) return

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/books/${bookToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      toast.success("Book deleted successfully!")
      setIsDeleteDialogOpen(false)
      setBookToDelete(null)
      fetchBooks() // Refresh the books list
    } catch (error) {
      console.error("Error deleting book:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete book. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = async (book: Book) => {
    try {
      // Fetch the latest book data to ensure we have the most up-to-date information
      const freshBookData = await fetchBookById(book._id)
      if (freshBookData) {
        setEditingBook(freshBookData)
        setIsEditDialogOpen(true)
      }
    } catch (error) {
      console.error("Error opening edit dialog:", error)
    }
  }

  const openDeleteDialog = (bookId: string) => {
    setBookToDelete(bookId)
    setIsDeleteDialogOpen(true)
  }

  // Load books and genres when component mounts
  useEffect(() => {
    fetchBooks()
    fetchGenres()
  }, [])

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Book Management</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Book
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Book</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddBook} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    placeholder="Enter book title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    placeholder="Enter author name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    placeholder="Enter ISBN (e.g., 978-0262033848)"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={newBook.genre} onValueChange={(value) => setNewBook({ ...newBook, genre: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre._id} value={genre._id}>
                          {genre.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="totalCopies">Quantity</Label>
                  <Input
                    id="totalCopies"
                    type="number"
                    min="1"
                    value={newBook.totalCopies}
                    onChange={(e) => setNewBook({ ...newBook, totalCopies: Number.parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Adding..." : "Add Book"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading && books.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p>Loading books...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.length > 0 ? (
              books.map((book) => (
                <Card key={book._id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(book)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(book._id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{book.author}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">{book.genre.name}</Badge>
                        <Badge
                          variant={book.availableCopies > 0 ? "outline" : "secondary"}
                          className={book.availableCopies > 0 ? "bg-green-50 text-green-700 border-green-100" : ""}
                        >
                          {book.availableCopies > 0 ? "Available" : "Out of Stock"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>ISBN: {book.isbn}</p>
                        <p>Total Copies: {book.totalCopies}</p>
                        <p>Available: {book.availableCopies}</p>
                        <p>Borrowed: {book.totalCopies - book.availableCopies}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No books found. Add some books to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Edit Book Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Book</DialogTitle>
            </DialogHeader>
            {editingBook && (
              <form onSubmit={handleUpdateBook} className="space-y-4">
                <div>
                  <Label htmlFor="editTitle">Title</Label>
                  <Input
                    id="editTitle"
                    value={editingBook.title}
                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editAuthor">Author</Label>
                  <Input
                    id="editAuthor"
                    value={editingBook.author}
                    onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editIsbn">ISBN</Label>
                  <Input
                    id="editIsbn"
                    value={editingBook.isbn}
                    onChange={(e) => setEditingBook({ ...editingBook, isbn: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editGenre">Genre</Label>
                  <Select
                    value={editingBook.genre._id}
                    onValueChange={(value) => {
                      const selectedGenre = genres.find((g) => g._id === value)
                      setEditingBook({
                        ...editingBook,
                        genre: {
                          _id: value,
                          name: selectedGenre ? selectedGenre.name : editingBook.genre.name,
                        },
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre._id} value={genre._id}>
                          {genre.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editTotalCopies">Total Copies</Label>
                  <Input
                    id="editTotalCopies"
                    type="number"
                    min={editingBook.totalCopies - editingBook.availableCopies}
                    value={editingBook.totalCopies}
                    onChange={(e) =>
                      setEditingBook({
                        ...editingBook,
                        totalCopies: Number.parseInt(e.target.value) || editingBook.totalCopies,
                      })
                    }
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Note: You cannot set total copies lower than {editingBook.totalCopies - editingBook.availableCopies}{" "}
                    (currently borrowed)
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Updating..." : "Update Book"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the book from the library. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteBook} className="bg-red-600 hover:bg-red-700">
                {loading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  )
}

export default BookManagement