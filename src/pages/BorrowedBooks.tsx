
import MainLayout from "@/components/MainLayout";
import BorrowedBookCard from "@/components/BorrowedBookCard";
import { borrowedBooks } from "@/lib/data";
import { calculateDaysLeft } from "@/lib/dateUtils";

const BorrowedBooks = () => {
  // Sort books by due date (closest first)
  const sortedBooks = [...borrowedBooks].sort((a, b) => {
    const daysLeftA = calculateDaysLeft(a.returnDate);
    const daysLeftB = calculateDaysLeft(b.returnDate);
    return daysLeftA - daysLeftB;
  });

  const overdueBooks = sortedBooks.filter(
    (book) => calculateDaysLeft(book.returnDate) < 0
  );
  
  const currentBooks = sortedBooks.filter(
    (book) => calculateDaysLeft(book.returnDate) >= 0
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Borrowed Books</h1>
        
        {overdueBooks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-red-600 mb-4">
              Overdue ({overdueBooks.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {overdueBooks.map((book) => (
                <BorrowedBookCard key={book.id} {...book} />
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Current Borrows ({currentBooks.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentBooks.map((book) => (
              <BorrowedBookCard key={book.id} {...book} />
            ))}
          </div>
          
          {borrowedBooks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">You haven't borrowed any books yet.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default BorrowedBooks;
