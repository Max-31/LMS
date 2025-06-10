
import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { borrowedBooks } from "@/lib/data";
import { formatDate, calculateDaysLeft } from "@/lib/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DueDates = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Sort books by due date
  const sortedBooks = [...borrowedBooks].sort((a, b) => {
    const dateA = new Date(a.returnDate).getTime();
    const dateB = new Date(b.returnDate).getTime();
    return dateA - dateB;
  });

  const overdueBooks = sortedBooks.filter(
    (book) => calculateDaysLeft(book.returnDate) < 0
  );
  
  const upcomingBooks = sortedBooks.filter(
    (book) => calculateDaysLeft(book.returnDate) >= 0
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Due Dates</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBooks.length})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Overdue ({overdueBooks.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {upcomingBooks.length > 0 ? (
              <div className="space-y-4">
                {upcomingBooks.map((book) => (
                  <DueDateCard 
                    key={book.id}
                    book={book}
                    isOverdue={false}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No upcoming due dates</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="overdue">
            {overdueBooks.length > 0 ? (
              <div className="space-y-4">
                {overdueBooks.map((book) => (
                  <DueDateCard 
                    key={book.id}
                    book={book}
                    isOverdue={true}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No overdue books</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

type DueDateCardProps = {
  book: typeof borrowedBooks[0];
  isOverdue: boolean;
};

const DueDateCard = ({ book, isOverdue }: DueDateCardProps) => {
  const daysLeft = calculateDaysLeft(book.returnDate);
  
  return (
    <Card className={isOverdue ? "border-red-200" : ""}>
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className={`rounded-full p-2 ${isOverdue ? "bg-red-100" : "bg-blue-100"}`}>
            <Calendar className={`h-5 w-5 ${isOverdue ? "text-red-600" : "text-blue-600"}`} />
          </div>
          
          <div>
            <h3 className="font-medium">{book.title}</h3>
            <p className="text-sm text-gray-600">{book.author}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium">{formatDate(book.returnDate)}</span>
          
          {isOverdue ? (
            <Badge variant="destructive" className="mt-1">
              {Math.abs(daysLeft)} days overdue
            </Badge>
          ) : (
            <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-100">
              {daysLeft} days left
            </Badge>
          )}
          
          {book.fine > 0 && (
            <span className="text-xs font-medium text-red-600 mt-1">
              Fine: ${book.fine.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DueDates;
