import axios from 'axios';

// Create axios instance with base URL for our dummy API
export const api = axios.create({
  baseURL: 'http://localhost:5000',
});

const API_URL= 'http://localhost:5000'

// TODO: Uncomment when backend is ready
// Auth endpoints
/*
export const login = async (email: string, password: string, role: string) => {
  try {
    const response = await api.post('/auth/login', { email, password, role });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
*/

// Dummy data for development
const dummyUserProfile = {
  id: "1",
  name: "Alex Johnson",
  email: "alex.johnson@university.edu",
  role: "student",
  department: "Computer Science",
  memberSince: "September 2023",
  studentId: "CS2023001"
};

const dummyBorrowedBooks = [
  {
    id: "1",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    issueDate: "2024-04-15",
    returnDate: "2024-05-15",
    fine: 0,
    coverImage: "/placeholder.svg",
    isbn: "978-0262033848"
  },
  {
    id: "2",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    issueDate: "2024-04-02",
    returnDate: "2024-05-02",
    fine: 2.50,
    coverImage: "/placeholder.svg",
    isbn: "978-0465050659"
  }
];

const dummyNotifications = [
  {
    id: "1",
    type: "due_date",
    title: "Book due soon",
    message: "\"The Design of Everyday Things\" is due in 3 days.",
    date: "2024-04-29",
    read: false
  }
];

// Define the borrow request type with all possible statuses and optional reviewNote
type BorrowRequest = {
  id: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'faculty' | 'librarian' | 'admin' | 'guest';
  bookId: string;
  bookTitle: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  reviewNote?: string;
  dueAmount?: number; // Add due amount for students
};

// Updated User type with isActive field
type User = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'librarian' | 'admin' | 'guest';
  department: string;
  memberSince: string;
  studentId?: string;
  isActive: boolean;
  inactiveRemark?: string;
};

// Genre type
type Genre = {
  id: string;
  name: string;
  description?: string;
};

// Borrowed book for return management with user role
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

// Dummy borrow requests data with proper typing including user roles
let borrowRequests: BorrowRequest[] = [
  {
    id: "1",
    userId: "1",
    userName: "Alex Johnson",
    userRole: "student",
    bookId: "5",
    bookTitle: "The Great Gatsby",
    requestDate: "2024-05-01",
    status: "pending",
    requestedBy: "student@test.com",
    dueAmount: 4.50 // Student has existing due amount
  },
  {
    id: "2",
    userId: "4",
    userName: "Dr. Emily Davis",
    userRole: "faculty",
    bookId: "7",
    bookTitle: "Physics for Scientists and Engineers",
    requestDate: "2024-04-30",
    status: "approved",
    requestedBy: "faculty@test.com"
  }
];

// Updated dummy users data for management with isActive field
let allUsers: User[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "student@test.com",
    role: "student",
    department: "Computer Science",
    memberSince: "September 2023",
    studentId: "CS2023001",
    isActive: true
  },
  {
    id: "2",
    name: "Sarah Wilson",
    email: "librarian@test.com",
    role: "librarian",
    department: "Library Services",
    memberSince: "January 2020",
    isActive: true
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "admin@test.com",
    role: "admin",
    department: "Administration",
    memberSince: "March 2019",
    isActive: true
  },
  {
    id: "4",
    name: "Dr. Emily Davis",
    email: "faculty@test.com",
    role: "faculty",
    department: "Mathematics",
    memberSince: "August 2018",
    isActive: true
  },
  {
    id: "5",
    name: "John Visitor",
    email: "guest@test.com",
    role: "guest",
    department: "Guest Access",
    memberSince: "December 2024",
    isActive: true
  },
  {
    id: "6",
    name: "Jane Smith",
    email: "jane.smith@university.edu",
    role: "student",
    department: "Physics",
    memberSince: "September 2023",
    studentId: "PH2023002",
    isActive: true
  }
];

// Dummy genres data
let genres: Genre[] = [
  { id: "1", name: "Computer Science", description: "Books related to computing and programming" },
  { id: "2", name: "Design", description: "Design and user experience books" },
  { id: "3", name: "Psychology", description: "Psychology and behavioral science" },
  { id: "4", name: "Fiction", description: "Fictional literature and novels" },
  { id: "5", name: "Physics", description: "Physics and related sciences" },
  { id: "6", name: "Mathematics", description: "Mathematics and computational theory" }
];

// Dummy borrowed books for return management with user roles
let borrowedBooksForReturn: BorrowedBookForReturn[] = [
  {
    id: "1",
    userId: "1",
    userName: "Alex Johnson",
    userRole: "student",
    bookId: "1",
    bookTitle: "Introduction to Algorithms",
    isbn: "978-0262033848",
    issueDate: "2024-04-15",
    returnDate: "2024-05-15",
    fine: 0,
    returned: false
  },
  {
    id: "2",
    userId: "1",
    userName: "Alex Johnson",
    userRole: "student",
    bookId: "2",
    bookTitle: "The Design of Everyday Things", 
    isbn: "978-0465050659",
    issueDate: "2024-04-02",
    returnDate: "2024-05-02",
    fine: 2.50,
    returned: false
  },
  {
    id: "3",
    userId: "6",
    userName: "Jane Smith",
    userRole: "student",
    bookId: "3",
    bookTitle: "Clean Code",
    isbn: "978-0132350884",
    issueDate: "2024-04-20",
    returnDate: "2024-05-20",
    fine: 0,
    returned: false
  },
  {
    id: "4",
    userId: "4",
    userName: "Dr. Emily Davis",
    userRole: "faculty",
    bookId: "4",
    bookTitle: "Thinking, Fast and Slow",
    isbn: "978-0374533557",
    issueDate: "2024-04-10",
    returnDate: "2024-05-10",
    fine: 0,
    returned: false
  }
];

// Dummy books catalog with quantities and ISBN
let booksInventory = [
  {
    id: "1",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    genre: "Computer Science",
    isbn: "978-0262033848",
    totalQuantity: 3,
    availableQuantity: 0,
    coverImage: "/placeholder.svg"
  },
  {
    id: "2",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    genre: "Design",
    isbn: "978-0465050659",
    totalQuantity: 2,
    availableQuantity: 0,
    coverImage: "/placeholder.svg"
  },
  {
    id: "3",
    title: "Clean Code",
    author: "Robert C. Martin",
    genre: "Computer Science",
    isbn: "978-0132350884",
    totalQuantity: 4,
    availableQuantity: 1,
    coverImage: "/placeholder.svg"
  },
  {
    id: "4",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    genre: "Psychology",
    isbn: "978-0374533557",
    totalQuantity: 2,
    availableQuantity: 1,
    coverImage: "/placeholder.svg"
  },
  {
    id: "5",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Fiction",
    isbn: "978-0743273565",
    totalQuantity: 5,
    availableQuantity: 4,
    coverImage: "/placeholder.svg"
  },
  {
    id: "6",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    isbn: "978-0061120084",
    totalQuantity: 3,
    availableQuantity: 3,
    coverImage: "/placeholder.svg"
  },
  {
    id: "7",
    title: "Physics for Scientists and Engineers",
    author: "Serway & Jewett",
    genre: "Physics",
    isbn: "978-1133947271",
    totalQuantity: 2,
    availableQuantity: 1,
    coverImage: "/placeholder.svg"
  },
  {
    id: "8",
    title: "Calculus: Early Transcendentals",
    author: "James Stewart",
    genre: "Mathematics",
    isbn: "978-1285741550",
    totalQuantity: 4,
    availableQuantity: 4,
    coverImage: "/placeholder.svg"
  }
];

// API endpoints with dummy data
export const fetchUserProfile = async () => {
  try {
    // TODO: Uncomment when backend is ready
    /*
    const response = await api.get('/user/profile');
    return response.data;
    */
    
    // Return dummy data for now
    return dummyUserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const fetchBorrowedBooks = async () => {
  try {
    // TODO: Uncomment when backend is ready
    /*
    const response = await api.get('/user/borrowed-books');
    return response.data;
    */
    
    // Return dummy data for now
    return dummyBorrowedBooks;
  } catch (error) {
    console.error('Error fetching borrowed books:', error);
    throw error;
  }
};

export const fetchNotifications = async () => {
  try {
    // TODO: Uncomment when backend is ready
    /*
    const response = await api.get('/user/notifications');
    return response.data;
    */
    
    // Return dummy data for now
    return dummyNotifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const payFine = async (amount: number) => {
  try {
    // TODO: Uncomment when backend is ready
    /*
    const response = await api.post('/payment/create-order', { amount });
    return response.data;
    */
    
    // Return dummy success response with the expected structure for now
    return { 
      success: true, 
      id: 'dummy_order_123',
      amount: amount,
      orderId: 'dummy_order_123' 
    };
  } catch (error) {
    console.error('Error creating payment order:', error);
    throw error;
  }
};

// Books management APIs
export const fetchBooks = async () => {
  try {
    // const response = await fetch(`${API_URL}/api/users`)

    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`)
    // }

    // const data = await response.json()
    // setUsers(data)
    // setFilteredUsers(data)

    // return data.books;
    // console.log(data.books);
    // return data.books.map(
    //     book => ({
    //     ...book,
    //     available: book.availableCopies > 0
    //   })
    // )
    return booksInventory.map(book => ({
      ...book,
      available: book.availableQuantity > 0
    }));
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

export const addBook = async (bookData: {
  title: string;
  author: string;
  genre: string;
  isbn: string;
  quantity: number;
}) => {
  try {
    const newBook = {
      id: (booksInventory.length + 1).toString(),
      title: bookData.title,
      author: bookData.author,
      genre: bookData.genre,
      isbn: bookData.isbn,
      totalQuantity: bookData.quantity,
      availableQuantity: bookData.quantity,
      coverImage: "/placeholder.svg"
    };
    
    booksInventory.push(newBook);
    return newBook;
  } catch (error) {
    console.error('Error adding book:', error);
    throw error;
  }
};

export const updateBookQuantity = async (bookId: string, newQuantity: number) => {
  try {
    // TODO: Uncomment when backend is ready
    /*
    const response = await api.put(`/books/${bookId}/quantity`, { quantity: newQuantity });
    return response.data;
    */
    
    const bookIndex = booksInventory.findIndex(book => book.id === bookId);
    if (bookIndex !== -1) {
      const book = booksInventory[bookIndex];
      const borrowedCount = book.totalQuantity - book.availableQuantity;
      book.totalQuantity = newQuantity;
      book.availableQuantity = Math.max(0, newQuantity - borrowedCount);
      return book;
    }
    throw new Error('Book not found');
  } catch (error) {
    console.error('Error updating book quantity:', error);
    throw error;
  }
};

// Borrow request APIs
export const createBorrowRequest = async (bookId: string, userId: string, userName: string, bookTitle: string, userRole: string) => {
  try {
    // Get user's existing due amount if they are a student
    let dueAmount = 0;
    if (userRole === 'student') {
      const userBorrowedBooks = borrowedBooksForReturn.filter(book => book.userId === userId && !book.returned);
      dueAmount = userBorrowedBooks.reduce((total, book) => {
        const today = new Date();
        const returnDate = new Date(book.returnDate);
        if (today > returnDate) {
          const daysLate = Math.ceil((today.getTime() - returnDate.getTime()) / (1000 * 60 * 60 * 24));
          return total + (daysLate * 2);
        }
        return total;
      }, 0);
    }
    
    const newRequest: BorrowRequest = {
      id: (borrowRequests.length + 1).toString(),
      userId,
      userName,
      userRole: userRole as any,
      bookId,
      bookTitle,
      requestDate: new Date().toISOString().split('T')[0],
      status: "pending",
      requestedBy: `${userId}@test.com`,
      dueAmount: userRole === 'student' ? dueAmount : undefined
    };
    
    borrowRequests.push(newRequest);
    return newRequest;
  } catch (error) {
    console.error('Error creating borrow request:', error);
    throw error;
  }
};

export const fetchBorrowRequests = async () => {
  try {
    // TODO: Uncomment when backend is ready
    /*
    const response = await api.get('/borrow-requests');
    return response.data;
    */
    
    return borrowRequests;
  } catch (error) {
    console.error('Error fetching borrow requests:', error);
    throw error;
  }
};

export const updateBorrowRequestStatus = async (requestId: string, status: 'approved' | 'rejected', reviewNote?: string) => {
  try {
    // TODO: Uncomment when backend is ready
    /*
    const response = await api.put(`/borrow-requests/${requestId}`, { status, reviewNote });
    return response.data;
    */
    
    const requestIndex = borrowRequests.findIndex(req => req.id === requestId);
    if (requestIndex !== -1) {
      borrowRequests[requestIndex].status = status;
      if (reviewNote) {
        borrowRequests[requestIndex].reviewNote = reviewNote;
      }
      
      // If approved, reduce available quantity
      if (status === 'approved') {
        const request = borrowRequests[requestIndex];
        const bookIndex = booksInventory.findIndex(book => book.id === request.bookId);
        if (bookIndex !== -1 && booksInventory[bookIndex].availableQuantity > 0) {
          booksInventory[bookIndex].availableQuantity--;
        }
      }
      
      return borrowRequests[requestIndex];
    }
    throw new Error('Request not found');
  } catch (error) {
    console.error('Error updating borrow request:', error);
    throw error;
  }
};

// User management APIs
export const fetchUsers = async (userRole?: string) => {
  try {
    if (userRole === 'librarian') {
      // Librarians can only see students and guests
      return allUsers.filter(user => ['student', 'guest', 'faculty'].includes(user.role));
    }
    // Admins can see all users
    return allUsers;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, userData: Partial<User>) => {
  try {
    const userIndex = allUsers.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      allUsers[userIndex] = { ...allUsers[userIndex], ...userData };
      return allUsers[userIndex];
    }
    throw new Error('User not found');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const createUser = async (userData: {
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'guest';
  department: string;
  studentId?: string;
}) => {
  try {
    // Check if user already exists
    const existingUser = allUsers.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const newUser: User = {
      id: (allUsers.length + 1).toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      studentId: userData.studentId,
      isActive: true
    };
    
    allUsers.push(newUser);
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const toggleUserActiveStatus = async (userId: string, isActive: boolean, remark?: string) => {
  try {
    const userIndex = allUsers.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      allUsers[userIndex].isActive = isActive;
      if (!isActive && remark) {
        allUsers[userIndex].inactiveRemark = remark;
      } else if (isActive) {
        delete allUsers[userIndex].inactiveRemark;
      }
      return allUsers[userIndex];
    }
    throw new Error('User not found');
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

// Genre management APIs
export const fetchGenres = async () => {
  try {
    return genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
};

export const addGenre = async (genreData: { name: string; description?: string }) => {
  try {
    const newGenre: Genre = {
      id: (genres.length + 1).toString(),
      name: genreData.name,
      description: genreData.description
    };
    
    genres.push(newGenre);
    return newGenre;
  } catch (error) {
    console.error('Error adding genre:', error);
    throw error;
  }
};

export const updateGenre = async (genreId: string, genreData: { name: string; description?: string }) => {
  try {
    const genreIndex = genres.findIndex(genre => genre.id === genreId);
    if (genreIndex !== -1) {
      genres[genreIndex] = { ...genres[genreIndex], ...genreData };
      return genres[genreIndex];
    }
    throw new Error('Genre not found');
  } catch (error) {
    console.error('Error updating genre:', error);
    throw error;
  }
};

export const deleteGenre = async (genreId: string) => {
  try {
    const genreIndex = genres.findIndex(genre => genre.id === genreId);
    if (genreIndex !== -1) {
      genres.splice(genreIndex, 1);
      return { success: true };
    }
    throw new Error('Genre not found');
  } catch (error) {
    console.error('Error deleting genre:', error);
    throw error;
  }
};

// Book return management APIs
export const fetchBorrowedBooksForReturn = async () => {
  try {
    return borrowedBooksForReturn.filter(book => !book.returned);
  } catch (error) {
    console.error('Error fetching borrowed books for return:', error);
    throw error;
  }
};

export const returnBook = async (borrowId: string) => {
  try {
    const borrowIndex = borrowedBooksForReturn.findIndex(borrow => borrow.id === borrowId);
    if (borrowIndex !== -1) {
      const borrow = borrowedBooksForReturn[borrowIndex];
      const today = new Date();
      const returnDate = new Date(borrow.returnDate);
      
      // Calculate fine only for students (₹2 per day)
      let fine = 0;
      if (borrow.userRole === 'student' && today > returnDate) {
        const daysLate = Math.ceil((today.getTime() - returnDate.getTime()) / (1000 * 60 * 60 * 24));
        fine = daysLate * 2;
      }
      
      borrowedBooksForReturn[borrowIndex] = {
        ...borrow,
        returned: true,
        actualReturnDate: today.toISOString().split('T')[0],
        fine: fine
      };
      
      // Increase available quantity
      const bookIndex = booksInventory.findIndex(book => book.id === borrow.bookId);
      if (bookIndex !== -1) {
        booksInventory[bookIndex].availableQuantity++;
      }
      
      return borrowedBooksForReturn[borrowIndex];
    }
    throw new Error('Borrowed book not found');
  } catch (error) {
    console.error('Error returning book:', error);
    throw error;
  }
};

// Forgot password API
export const sendPasswordResetOTP = async (email: string) => {
  try {
    // TODO: Uncomment when backend is ready
    /*
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
    */
    
    // Simulate sending OTP
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'OTP sent to your email' };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

export const verifyOTPAndResetPassword = async (email: string, otp: string, newPassword: string) => {
  try {
    // TODO: Uncomment when backend is ready
    /*
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
    */
    
    // Simulate password reset
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (otp === '123456') { // Dummy OTP for testing
      return { success: true, message: 'Password reset successfully' };
    } else {
      throw new Error('Invalid OTP');
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};
