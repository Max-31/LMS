const express = require("express")
const Genre = require("../models/Genre")

const router = express.Router()

// Get all genres
router.get("/", async (req, res) => {
  try {
    const genres = await Genre.find({ isActive: true }).sort({ name: 1 })
    res.json(genres)
  } catch (error) {
    console.error("Get genres error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create genre
router.post("/", async (req, res) => {
  try {
    const genre = new Genre(req.body)
    await genre.save()
    res.status(201).json(genre)
  } catch (error) {
    console.error("Create genre error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update genre
router.put("/:id", async (req, res) => {
  try {
    const genre = await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!genre) {
      return res.status(404).json({ message: "Genre not found" })
    }

    res.json(genre)
  } catch (error) {
    console.error("Update genre error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete genre
router.delete("/:id", async (req, res) => {
  try {
    const genre = await Genre.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })

    if (!genre) {
      return res.status(404).json({ message: "Genre not found" })
    }

    res.json({ message: "Genre deleted successfully" })
  } catch (error) {
    console.error("Delete genre error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router