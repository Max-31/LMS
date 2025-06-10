const express = require("express")
const BorrowRequest = require("../models/BorrowRequest")
const BorrowedBook = require("../models/BorrowedBook")
const Book = require("../models/Book")

const router = express.Router()

// Create borrow request
router.post("/request", async (req, res) => {
  try {
    const { userId, bookId } = req.body

    // Check if book is available
    const book = await Book.findById(bookId)
    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ message: "Book is not available" })
    }

    // Check if user already has a pending request for this book
    const existingRequest = await BorrowRequest.findOne({
      user: userId,
      book: bookId,
      status: "pending",
    })

    if (existingRequest) {
      return res.status(400).json({ message: "You already have a pending request for this book" })
    }

    const borrowRequest = new BorrowRequest({
      user: userId,
      book: bookId,
    })

    await borrowRequest.save()

    const populatedRequest = await BorrowRequest.findById(borrowRequest._id)
      .populate("user", "name email")
      .populate("book", "title author")

    res.status(201).json(populatedRequest)
  } catch (error) {
    console.error("Create borrow request error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get borrow requests
router.get("/requests", async (req, res) => {
  try {
    const { status, userId } = req.query
    const query = {}

    if (status) query.status = status
    if (userId) query.user = userId

    const requests = await BorrowRequest.find(query)
      .populate("user", "name email role department")
      .populate("book", "title author isbn")
      .sort({ createdAt: -1 })

    res.json(requests)
  } catch (error) {
    console.error("Get borrow requests error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Approve/Reject borrow request
router.put("/requests/:id", async (req, res) => {
  try {
    const { status, approvedBy, remarks } = req.body

    const borrowRequest = await BorrowRequest.findById(req.params.id)
    if (!borrowRequest) {
      return res.status(404).json({ message: "Borrow request not found" })
    }

    borrowRequest.status = status
    borrowRequest.approvedBy = approvedBy
    borrowRequest.approvedDate = new Date()
    borrowRequest.remarks = remarks

    await borrowRequest.save()

    // If approved, create borrowed book record
    if (status === "approved") {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 14) // 2 weeks borrowing period

      const borrowedBook = new BorrowedBook({
        user: borrowRequest.user,
        book: borrowRequest.book,
        dueDate,
        issuedBy: approvedBy,
      })

      await borrowedBook.save()

      // Update book availability
      await Book.findByIdAndUpdate(borrowRequest.book, {
        $inc: { availableCopies: -1 },
      })
    }

    const populatedRequest = await BorrowRequest.findById(borrowRequest._id)
      .populate("user", "name email")
      .populate("book", "title author")

    res.json(populatedRequest)
  } catch (error) {
    console.error("Update borrow request error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get borrowed books
router.get("/borrowed", async (req, res) => {
  try {
    const { userId, status } = req.query
    const query = {}

    if (userId) query.user = userId
    if (status) query.status = status

    const borrowedBooks = await BorrowedBook.find(query)
      .populate("user", "name email role department")
      .populate("book", "title author isbn")
      .populate("issuedBy", "name")
      .sort({ borrowDate: -1 })

    res.json(borrowedBooks)
  } catch (error) {
    console.error("Get borrowed books error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Return book
router.put("/return/:id", async (req, res) => {
  try {
    const { returnedTo, fine } = req.body

    const borrowedBook = await BorrowedBook.findById(req.params.id)
    if (!borrowedBook) {
      return res.status(404).json({ message: "Borrowed book record not found" })
    }

    borrowedBook.returnDate = new Date()
    borrowedBook.status = "returned"
    borrowedBook.returnedTo = returnedTo
    borrowedBook.fine = fine || 0

    await borrowedBook.save()

    // Update book availability
    await Book.findByIdAndUpdate(borrowedBook.book, {
      $inc: { availableCopies: 1 },
    })

    const populatedBorrowedBook = await BorrowedBook.findById(borrowedBook._id)
      .populate("user", "name email")
      .populate("book", "title author")

    res.json(populatedBorrowedBook)
  } catch (error) {
    console.error("Return book error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router