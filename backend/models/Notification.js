const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["due_date", "new_arrival", "fine", "request_approved", "request_rejected"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
    relatedBorrow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BorrowedBook",
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
notificationSchema.index({ user: 1, read: 1 })
notificationSchema.index({ createdAt: -1 })

module.exports = mongoose.model("Notification", notificationSchema)
