const express = require("express")
const User = require("../models/User")

const router = express.Router()

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, department, studentId } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" })
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role: role || "student",
      department,
      studentId,
    })

    await user.save()

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error during registration" })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check role
    if (user.role !== role) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact administration.",
      })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    res.json({
      message: "Login successful",
      user: userResponse,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error during login" })
  }
})

// Forgot Password (simplified - just check if user exists)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" })
    }

    res.json({
      message: "Password reset instructions would be sent to your email",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router