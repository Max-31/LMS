
// Mock data for the Library Management System

// User data
export const userData = {
  id: "1",
  name: "Alex Johnson",
  role: "Student",
  email: "alex.johnson@university.edu",
  department: "Computer Science",
  memberSince: "September 2023",
  avatar: "/placeholder.svg"
};

// Borrowed books data
export const borrowedBooks = [
  {
    id: "1",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    issueDate: "2024-04-15",
    returnDate: "2024-05-15",
    fine: 0,
    coverImage: "/placeholder.svg"
  },
  {
    id: "2",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    issueDate: "2024-04-02",
    returnDate: "2024-05-02",
    fine: 2.50,
    coverImage: "/placeholder.svg"
  },
  {
    id: "3",
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    issueDate: "2024-03-20",
    returnDate: "2024-04-20",
    fine: 5.75,
    coverImage: "/placeholder.svg"
  },
  {
    id: "4",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    issueDate: "2024-04-10",
    returnDate: "2024-05-10",
    fine: 0,
    coverImage: "/placeholder.svg"
  }
];

// Book catalog data with inventory management
export const bookCatalog = [
  {
    id: "1",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    genre: "Computer Science",
    totalQuantity: 3,
    availableQuantity: 0,
    available: false,
    coverImage: "/placeholder.svg"
  },
  {
    id: "2",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    genre: "Design",
    totalQuantity: 2,
    availableQuantity: 0,
    available: false,
    coverImage: "/placeholder.svg"
  },
  {
    id: "3",
    title: "Clean Code",
    author: "Robert C. Martin",
    genre: "Computer Science",
    totalQuantity: 4,
    availableQuantity: 1,
    available: true,
    coverImage: "/placeholder.svg"
  },
  {
    id: "4",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    genre: "Psychology",
    totalQuantity: 2,
    availableQuantity: 1,
    available: true,
    coverImage: "/placeholder.svg"
  },
  {
    id: "5",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Fiction",
    totalQuantity: 5,
    availableQuantity: 4,
    available: true,
    coverImage: "/placeholder.svg"
  },
  {
    id: "6",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Fiction",
    totalQuantity: 3,
    availableQuantity: 3,
    available: true,
    coverImage: "/placeholder.svg"
  },
  {
    id: "7",
    title: "Physics for Scientists and Engineers",
    author: "Serway & Jewett",
    genre: "Physics",
    totalQuantity: 2,
    availableQuantity: 1,
    available: true,
    coverImage: "/placeholder.svg"
  },
  {
    id: "8",
    title: "Calculus: Early Transcendentals",
    author: "James Stewart",
    genre: "Mathematics",
    totalQuantity: 4,
    availableQuantity: 4,
    available: true,
    coverImage: "/placeholder.svg"
  }
];

// Define the NotificationType to match the one in NotificationItem component
export type NotificationType = "due_date" | "new_arrival" | "fine";

// Notifications data
export const notifications = [
  {
    id: "1",
    type: "due_date" as NotificationType,
    title: "Book due soon",
    message: "\"The Design of Everyday Things\" is due in 3 days.",
    date: "2024-04-29",
    read: false
  },
  {
    id: "2",
    type: "new_arrival" as NotificationType,
    title: "New Arrival",
    message: "\"The Pragmatic Programmer\" is now available in the library.",
    date: "2024-04-28",
    read: false
  },
  {
    id: "3",
    type: "fine" as NotificationType,
    title: "Fine Notice",
    message: "You have a $5.75 fine for \"Clean Code\".",
    date: "2024-04-25",
    read: true
  },
  {
    id: "4",
    type: "new_arrival" as NotificationType,
    title: "New Arrival",
    message: "\"Designing Data-Intensive Applications\" is now available.",
    date: "2024-04-20",
    read: true
  }
];

// Genre options for search filtering
export const genreOptions = [
  { label: "All Genres", value: "" },
  { label: "Computer Science", value: "Computer Science" },
  { label: "Design", value: "Design" },
  { label: "Psychology", value: "Psychology" },
  { label: "Fiction", value: "Fiction" },
  { label: "Physics", value: "Physics" },
  { label: "Mathematics", value: "Mathematics" },
];
