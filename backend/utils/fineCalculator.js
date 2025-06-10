// Fine calculation utilities

const FINE_RATES = {
  student: 0.5, // $0.50 per day
  faculty: 0.25, // $0.25 per day
  guest: 1.0, // $1.00 per day
  librarian: 0.0, // No fines for librarians
  admin: 0.0, // No fines for admins
}

const MAX_FINES = {
  student: 50.0, // Maximum $50
  faculty: 25.0, // Maximum $25
  guest: 100.0, // Maximum $100
  librarian: 0.0,
  admin: 0.0,
}

/**
 * Calculate fine for overdue book
 * @param {Date} dueDate - The due date of the book
 * @param {Date} returnDate - The return date (or current date if not returned)
 * @param {string} userRole - The role of the user (student, faculty, etc.)
 * @returns {number} Fine amount in dollars
 */
const calculateFine = (dueDate, returnDate = new Date(), userRole = "student") => {
  // No fine if returned on time or before
  if (returnDate <= dueDate) {
    return 0
  }

  // Calculate days overdue
  const timeDiff = returnDate.getTime() - dueDate.getTime()
  const daysOverdue = Math.ceil(timeDiff / (1000 * 3600 * 24))

  // Get fine rate for user role
  const dailyRate = FINE_RATES[userRole] || FINE_RATES.student
  const maxFine = MAX_FINES[userRole] || MAX_FINES.student

  // Calculate fine
  const calculatedFine = daysOverdue * dailyRate

  // Apply maximum fine limit
  return Math.min(calculatedFine, maxFine)
}

/**
 * Calculate total fines for multiple borrowed books
 * @param {Array} borrowedBooks - Array of borrowed book objects
 * @param {string} userRole - The role of the user
 * @returns {number} Total fine amount
 */
const calculateTotalFines = (borrowedBooks, userRole) => {
  return borrowedBooks.reduce((total, borrowedBook) => {
    const fine = calculateFine(
      new Date(borrowedBook.dueDate),
      borrowedBook.returnDate ? new Date(borrowedBook.returnDate) : new Date(),
      userRole,
    )
    return total + fine
  }, 0)
}

/**
 * Get fine rate information for a user role
 * @param {string} userRole - The role of the user
 * @returns {object} Fine rate information
 */
const getFineRateInfo = (userRole) => {
  return {
    dailyRate: FINE_RATES[userRole] || FINE_RATES.student,
    maxFine: MAX_FINES[userRole] || MAX_FINES.student,
    currency: "USD",
  }
}

/**
 * Check if a book is overdue
 * @param {Date} dueDate - The due date of the book
 * @param {Date} checkDate - The date to check against (default: current date)
 * @returns {boolean} True if overdue
 */
const isOverdue = (dueDate, checkDate = new Date()) => {
  return checkDate > dueDate
}

/**
 * Get days until due (negative if overdue)
 * @param {Date} dueDate - The due date of the book
 * @param {Date} checkDate - The date to check against (default: current date)
 * @returns {number} Days until due (negative if overdue)
 */
const getDaysUntilDue = (dueDate, checkDate = new Date()) => {
  const timeDiff = dueDate.getTime() - checkDate.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

module.exports = {
  calculateFine,
  calculateTotalFines,
  getFineRateInfo,
  isOverdue,
  getDaysUntilDue,
  FINE_RATES,
  MAX_FINES,
}