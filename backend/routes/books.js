const express = require("express")
const Book = require("../models/Book")
const Genre = require("../models/Genre")

const router = express.Router()

// Get all books
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, search, genre, author } = req.query

    const query = { isActive: true }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } },
      ]
    }

    if (genre) {
      query.genre = genre
    }

    if (author) {
      query.author = { $regex: author, $options: "i" }
    }

    const books = await Book.find(query)
      .populate("genre", "name")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await Book.countDocuments(query)

    res.json({
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    console.error("Get books error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get book by ID
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("genre", "name")

    if (!book) {
      return res.status(404).json({ message: "Book not found" })
    }

    res.json(book)
  } catch (error) {
    console.error("Get book error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create book (librarian/admin only - simplified without auth)
router.post("/", async (req, res) => {
  try {
    const bookData = req.body
    bookData.availableCopies = bookData.totalCopies

    console.log(bookData)

    const book = new Book(bookData)
    await book.save()

    const populatedBook = await Book.findById(book._id).populate("genre", "name")
    res.status(201).json(populatedBook)
  } catch (error) {
    console.error("Create book error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update book
router.put("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(
      "genre",
      "name",
    )

    if (!book) {
      return res.status(404).json({ message: "Book not found" })
    }

    res.json(book)
  } catch (error) {
    console.error("Update book error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete book
router.delete("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })

    if (!book) {
      return res.status(404).json({ message: "Book not found" })
    }

    res.json({ message: "Book deleted successfully" })
  } catch (error) {
    console.error("Delete book error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router