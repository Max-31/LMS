
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/MainLayout";
import { fetchBooks, addBook, updateBookQuantity } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  totalQuantity: number;
  availableQuantity: number;
  available: boolean;
  coverImage: string;
};

const BookManagement = () => {
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    quantity: 1
  });
  const [editingBook, setEditingBook] = useState<{ id: string; quantity: number } | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: fetchBooks,
  });

  const addBookMutation = useMutation({
    mutationFn: addBook,
    onSuccess: () => {
      toast.success("Book added successfully!");
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setNewBook({ title: '', author: '', genre: '', isbn: '', quantity: 1 });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to add book. Please try again.");
    }
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ bookId, quantity }: { bookId: string; quantity: number }) =>
      updateBookQuantity(bookId, quantity),
    onSuccess: () => {
      toast.success("Book quantity updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setEditingBook(null);
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to update quantity. Please try again.");
    }
  });

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author || !newBook.genre || !newBook.isbn) {
      toast.error("Please fill in all fields");
      return;
    }
    addBookMutation.mutate(newBook);
  };

  const handleUpdateQuantity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook || editingBook.quantity < 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    updateQuantityMutation.mutate({
      bookId: editingBook.id,
      quantity: editingBook.quantity
    });
  };

  const openEditDialog = (book: Book) => {
    setEditingBook({ id: book.id, quantity: book.totalQuantity });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading books...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

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
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Psychology">Psychology</SelectItem>
                      <SelectItem value="Fiction">Fiction</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newBook.quantity}
                    onChange={(e) => setNewBook({ ...newBook, quantity: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={addBookMutation.isPending}>
                  {addBookMutation.isPending ? "Adding..." : "Add Book"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book: Book) => (
            <Card key={book.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(book)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{book.author}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">{book.genre}</Badge>
                    <Badge 
                      variant={book.available ? "outline" : "secondary"}
                      className={book.available ? "bg-green-50 text-green-700 border-green-100" : ""}
                    >
                      {book.available ? "Available" : "Out of Stock"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>ISBN: {book.isbn}</p>
                    <p>Total Quantity: {book.totalQuantity}</p>
                    <p>Available: {book.availableQuantity}</p>
                    <p>Borrowed: {book.totalQuantity - book.availableQuantity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Quantity Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Book Quantity</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateQuantity} className="space-y-4">
              <div>
                <Label htmlFor="editQuantity">New Total Quantity</Label>
                <Input
                  id="editQuantity"
                  type="number"
                  min="0"
                  value={editingBook?.quantity || 0}
                  onChange={(e) => setEditingBook(prev => 
                    prev ? { ...prev, quantity: parseInt(e.target.value) || 0 } : null
                  )}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: Available quantity will be adjusted automatically based on current borrows.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={updateQuantityMutation.isPending}>
                {updateQuantityMutation.isPending ? "Updating..." : "Update Quantity"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default BookManagement;
