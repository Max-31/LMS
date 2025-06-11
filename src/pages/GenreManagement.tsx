"use client"

import type React from "react"
import { useState, useEffect } from "react"
import MainLayout from "@/components/MainLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, Edit, Trash2, BookOpen, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
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

type Genre = {
  _id: string
  name: string
  description?: string
  isActive: boolean
}

type NewGenreData = {
  name: string
  description?: string
}

const GenreManagement = () => {
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [newGenre, setNewGenre] = useState<NewGenreData>({
    name: "",
    description: "",
  })
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [genreToDelete, setGenreToDelete] = useState<string | null>(null)
  const [actionInProgress, setActionInProgress] = useState(false)

  // Fetch all genres
  const fetchGenres = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/genres`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      // Filter only active genres if needed or handle on server side
      setGenres(data || [])
    } catch (error) {
      console.error("Error fetching genres:", error)
      toast.error("Failed to load genres. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Add a new genre
  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newGenre.name.trim()) {
      toast.error("Genre name is required")
      return
    }

    try {
      setActionInProgress(true)
      const response = await fetch(`${API_URL}/api/genres`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newGenre.name.trim(),
          description: newGenre.description?.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      toast.success("Genre added successfully!")
      setNewGenre({ name: "", description: "" })
      setIsAddDialogOpen(false)
      fetchGenres() // Refresh the genres list
    } catch (error) {
      console.error("Error adding genre:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add genre. Please try again.")
    } finally {
      setActionInProgress(false)
    }
  }

  // Update a genre
  const handleUpdateGenre = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingGenre || !editingGenre.name.trim()) {
      toast.error("Genre name is required")
      return
    }

    try {
      setActionInProgress(true)
      const response = await fetch(`${API_URL}/api/genres/${editingGenre._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingGenre.name.trim(),
          description: editingGenre.description?.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      toast.success("Genre updated successfully!")
      setIsEditDialogOpen(false)
      fetchGenres() // Refresh the genres list
    } catch (error) {
      console.error("Error updating genre:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update genre. Please try again.")
    } finally {
      setActionInProgress(false)
    }
  }

  // Delete a genre (soft delete by setting isActive to false)
  const handleDeleteGenre = async () => {
    if (!genreToDelete) return

    try {
      setActionInProgress(true)
      const response = await fetch(`${API_URL}/api/genres/${genreToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      toast.success("Genre deleted successfully!")
      setIsDeleteDialogOpen(false)
      setGenreToDelete(null)
      fetchGenres() // Refresh the genres list
    } catch (error) {
      console.error("Error deleting genre:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete genre. Please try again.")
    } finally {
      setActionInProgress(false)
    }
  }

  // Fetch a single genre by ID
  const fetchGenreById = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/genres/${id}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Error fetching genre ${id}:`, error)
      toast.error("Failed to load genre details. Please try again.")
      return null
    }
  }

  const openEditDialog = async (genre: Genre) => {
    try {
      // Fetch the latest genre data to ensure we have the most up-to-date information
      const freshGenreData = await fetchGenreById(genre._id)
      if (freshGenreData) {
        setEditingGenre(freshGenreData)
        setIsEditDialogOpen(true)
      }
    } catch (error) {
      console.error("Error opening edit dialog:", error)
    }
  }

  const openDeleteDialog = (genreId: string) => {
    setGenreToDelete(genreId)
    setIsDeleteDialogOpen(true)
  }

  // Load genres when component mounts
  useEffect(() => {
    fetchGenres()
  }, [])

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Genre Management</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Genre
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Genre</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddGenre} className="space-y-4">
                <div>
                  <Label htmlFor="name">Genre Name</Label>
                  <Input
                    id="name"
                    value={newGenre.name}
                    onChange={(e) => setNewGenre({ ...newGenre, name: e.target.value })}
                    placeholder="Enter genre name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newGenre.description || ""}
                    onChange={(e) => setNewGenre({ ...newGenre, description: e.target.value })}
                    placeholder="Enter genre description"
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={actionInProgress}>
                  {actionInProgress ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Genre"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Genres List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {genres.length > 0 ? (
                    genres.map((genre) => (
                      <TableRow key={genre._id}>
                        <TableCell className="font-medium">{genre.name}</TableCell>
                        <TableCell>{genre.description || "No description"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(genre)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(genre._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                        No genres found. Add some genres to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Genre Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Genre</DialogTitle>
            </DialogHeader>
            {editingGenre && (
              <form onSubmit={handleUpdateGenre} className="space-y-4">
                <div>
                  <Label htmlFor="editName">Genre Name</Label>
                  <Input
                    id="editName"
                    value={editingGenre.name}
                    onChange={(e) => setEditingGenre({ ...editingGenre, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editDescription">Description (Optional)</Label>
                  <Textarea
                    id="editDescription"
                    value={editingGenre.description || ""}
                    onChange={(e) => setEditingGenre({ ...editingGenre, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={actionInProgress}>
                  {actionInProgress ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Genre"
                  )}
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
                This will remove this genre. Any books with this genre will be affected. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionInProgress}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteGenre}
                className="bg-red-600 hover:bg-red-700"
                disabled={actionInProgress}
              >
                {actionInProgress ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  )
}

export default GenreManagement