const express = require("express")
const User = require("../models/User")

const router = express.Router()

// Get all users
router.get("/", async (req, res) => {
  try {
    const { role, isActive } = req.query
    const query = {}

    if (role) query.role = role
    if (isActive !== undefined) query.isActive = isActive === "true"

    const users = await User.find(query).select("-password").sort({ createdAt: -1 })

    res.json(users)
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user
router.put("/:id", async (req, res) => {
  try {
    const { password, ...updateData } = req.body

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select(
      "-password",
    )

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Deactivate user
router.put("/:id/deactivate", async (req, res) => {
  try {
    // const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select("-password")
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({ message: "User deactivated successfully", user })
  } catch (error) {
    console.error("Deactivate user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Activate user
// router.put("/:id/activate", async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true }).select("-password")

//     if (!user) {
//       return res.status(404).json({ message: "User not found" })
//     }

//     res.json({ message: "User activated successfully", user })
//   } catch (error) {
//     console.error("Activate user error:", error)
//     res.status(500).json({ message: "Server error" })
//   }
// })

module.exports = router