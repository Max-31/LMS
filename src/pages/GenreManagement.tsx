
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/MainLayout";
import { fetchGenres, addGenre, updateGenre, deleteGenre } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type Genre = {
  id: string;
  name: string;
  description?: string;
};

const GenreManagement = () => {
  const [newGenre, setNewGenre] = useState({
    name: '',
    description: ''
  });
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: genres = [], isLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: fetchGenres,
  });

  const addGenreMutation = useMutation({
    mutationFn: addGenre,
    onSuccess: () => {
      toast.success("Genre added successfully!");
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      setNewGenre({ name: '', description: '' });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to add genre. Please try again.");
    }
  });

  const updateGenreMutation = useMutation({
    mutationFn: ({ genreId, genreData }: { genreId: string; genreData: { name: string; description?: string } }) =>
      updateGenre(genreId, genreData),
    onSuccess: () => {
      toast.success("Genre updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      setEditingGenre(null);
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to update genre. Please try again.");
    }
  });

  const deleteGenreMutation = useMutation({
    mutationFn: deleteGenre,
    onSuccess: () => {
      toast.success("Genre deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['genres'] });
    },
    onError: () => {
      toast.error("Failed to delete genre. Please try again.");
    }
  });

  const handleAddGenre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGenre.name) {
      toast.error("Please enter a genre name");
      return;
    }
    addGenreMutation.mutate(newGenre);
  };

  const handleUpdateGenre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGenre || !editingGenre.name) {
      toast.error("Please enter a valid genre name");
      return;
    }
    updateGenreMutation.mutate({
      genreId: editingGenre.id,
      genreData: { name: editingGenre.name, description: editingGenre.description }
    });
  };

  const handleDeleteGenre = (genreId: string, genreName: string) => {
    if (window.confirm(`Are you sure you want to delete the genre "${genreName}"?`)) {
      deleteGenreMutation.mutate(genreId);
    }
  };

  const openEditDialog = (genre: Genre) => {
    setEditingGenre({ ...genre });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading genres...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

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
                    value={newGenre.description}
                    onChange={(e) => setNewGenre({ ...newGenre, description: e.target.value })}
                    placeholder="Enter genre description"
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={addGenreMutation.isPending}>
                  {addGenreMutation.isPending ? "Adding..." : "Add Genre"}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {genres.map((genre: Genre) => (
                  <TableRow key={genre.id}>
                    <TableCell className="font-medium">{genre.name}</TableCell>
                    <TableCell>{genre.description || 'No description'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(genre)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGenre(genre.id, genre.name)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                    onChange={(e) => setEditingGenre(prev => 
                      prev ? { ...prev, name: e.target.value } : null
                    )}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editDescription">Description (Optional)</Label>
                  <Textarea
                    id="editDescription"
                    value={editingGenre.description || ''}
                    onChange={(e) => setEditingGenre(prev => 
                      prev ? { ...prev, description: e.target.value } : null
                    )}
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={updateGenreMutation.isPending}>
                  {updateGenreMutation.isPending ? "Updating..." : "Update Genre"}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default GenreManagement;
