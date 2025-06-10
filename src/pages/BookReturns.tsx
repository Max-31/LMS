
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/MainLayout";
import { fetchBorrowedBooksForReturn, returnBook } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RotateCcw, Calendar, User, Book } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateDaysLeft, formatDate } from "@/lib/dateUtils";

type BorrowedBookForReturn = {
  id: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'faculty' | 'librarian' | 'admin' | 'guest';
  bookId: string;
  bookTitle: string;
  isbn: string;
  issueDate: string;
  returnDate: string;
  actualReturnDate?: string;
  fine: number;
  returned: boolean;
};

const BookReturns = () => {
  const queryClient = useQueryClient();

  const { data: borrowedBooks = [], isLoading } = useQuery({
    queryKey: ['borrowedBooksForReturn'],
    queryFn: fetchBorrowedBooksForReturn,
  });

  const returnBookMutation = useMutation({
    mutationFn: returnBook,
    onSuccess: (returnedBook) => {
      if (returnedBook.userRole === 'student' && returnedBook.fine > 0) {
        toast.success(`Book returned successfully! Fine: ₹${returnedBook.fine.toFixed(2)}`);
      } else {
        toast.success("Book returned successfully!");
      }
      queryClient.invalidateQueries({ queryKey: ['borrowedBooksForReturn'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: () => {
      toast.error("Failed to return book. Please try again.");
    }
  });

  const handleReturnBook = (borrowId: string, bookTitle: string) => {
    if (window.confirm(`Are you sure you want to return "${bookTitle}"?`)) {
      returnBookMutation.mutate(borrowId);
    }
  };

  const getStatusBadge = (returnDate: string, userRole: string) => {
    const daysLeft = calculateDaysLeft(returnDate);
    
    // Faculty and guests don't have overdue concept
    if (userRole === 'faculty' || userRole === 'guest') {
      if (daysLeft < 0) {
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Extended Access</Badge>;
      } else if (daysLeft <= 3) {
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Due Soon ({daysLeft} days)</Badge>;
      } else {
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{daysLeft} days left</Badge>;
      }
    }
    
    // Students have overdue fines
    if (daysLeft < 0) {
      return (
        <Badge variant="destructive">
          Overdue ({Math.abs(daysLeft)} days)
        </Badge>
      );
    } else if (daysLeft === 0) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Due Today</Badge>;
    } else if (daysLeft <= 3) {
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Due Soon ({daysLeft} days)</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{daysLeft} days left</Badge>;
    }
  };

  const calculatePotentialFine = (returnDate: string, userRole: string): number => {
    // Only students get fines
    if (userRole !== 'student') return 0;
    
    const today = new Date();
    const dueDate = new Date(returnDate);
    
    if (today > dueDate) {
      const daysLate = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysLate * 2; // ₹2 per day
    }
    return 0;
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      student: "bg-blue-50 text-blue-700 border-blue-200",
      faculty: "bg-green-50 text-green-700 border-green-200",
      guest: "bg-purple-50 text-purple-700 border-purple-200",
      librarian: "bg-orange-50 text-orange-700 border-orange-200",
      admin: "bg-red-50 text-red-700 border-red-200"
    };
    
    return (
      <Badge variant="outline" className={colors[role as keyof typeof colors] || "bg-gray-50 text-gray-700 border-gray-200"}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <p>Loading borrowed books...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Book Returns</h1>
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            <span className="text-sm text-gray-600">
              {borrowedBooks.length} books currently borrowed
            </span>
          </div>
        </div>

        {borrowedBooks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Book className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No books currently borrowed</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Borrowed Books
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book Details</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Fine</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {borrowedBooks.map((book: BorrowedBookForReturn) => {
                    const potentialFine = calculatePotentialFine(book.returnDate, book.userRole);
                    
                    return (
                      <TableRow key={book.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{book.bookTitle}</p>
                            <p className="text-sm text-gray-600">ISBN: {book.isbn}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {book.userName}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(book.userRole)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(book.issueDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(book.returnDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(book.returnDate, book.userRole)}
                        </TableCell>
                        <TableCell>
                          {book.userRole === 'student' ? (
                            potentialFine > 0 ? (
                              <span className="text-red-600 font-medium">
                                ₹{potentialFine.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-green-600">₹0.00</span>
                            )
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReturnBook(book.id, book.bookTitle)}
                            disabled={returnBookMutation.isPending}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Return
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Fine Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Fine Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>Students:</strong> Late return fine of ₹2.00 per day after due date</p>
              <p>• <strong>Faculty & Guests:</strong> No late fines, extended access privileges</p>
              <p>• Fines are calculated automatically when books are returned</p>
              <p>• Students with outstanding fines may have their borrowing privileges suspended</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default BookReturns;
