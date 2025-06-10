const { body, param, query } = require("express-validator")

// Common validation rules
const commonValidations = {
  email: body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),

  password: body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),

  name: body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),

  objectId: (field) => param(field).isMongoId().withMessage(`Invalid ${field} ID format`),

  role: body("role").isIn(["student", "faculty", "librarian", "admin", "guest"]).withMessage("Invalid user role"),

  isbn: body("isbn")
    .matches(
      /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
    )
    .withMessage("Please provide a valid ISBN"),

  positiveInteger: (field) => body(field).isInt({ min: 1 }).withMessage(`${field} must be a positive integer`),

  date: (field) => body(field).isISO8601().toDate().withMessage(`${field} must be a valid date`),
}

// User validation rules
const userValidations = {
  register: [
    commonValidations.name,
    commonValidations.email,
    commonValidations.password,
    commonValidations.role,
    body("department")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Department must be between 2 and 100 characters"),
    body("studentId")
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage("Student ID must be between 1 and 50 characters"),
  ],

  login: [
    commonValidations.email,
    body("password").exists().withMessage("Password is required"),
    commonValidations.role,
  ],

  updateProfile: [
    body("name").optional().trim().isLength({ min: 2, max: 100 }),
    body("department").optional().trim().isLength({ min: 2, max: 100 }),
    body("phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),
  ],
}

// Book validation rules
const bookValidations = {
  create: [
    body("title").trim().isLength({ min: 1, max: 200 }).withMessage("Title must be between 1 and 200 characters"),
    body("author").trim().isLength({ min: 1, max: 100 }).withMessage("Author must be between 1 and 100 characters"),
    commonValidations.isbn,
    body("genre").isMongoId().withMessage("Invalid genre ID"),
    commonValidations.positiveInteger("totalCopies"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description must not exceed 1000 characters"),
    body("publisher").optional().trim().isLength({ max: 100 }).withMessage("Publisher must not exceed 100 characters"),
    body("publicationYear")
      .optional()
      .isInt({ min: 1000, max: new Date().getFullYear() })
      .withMessage("Publication year must be valid"),
  ],

  update: [
    body("title").optional().trim().isLength({ min: 1, max: 200 }),
    body("author").optional().trim().isLength({ min: 1, max: 100 }),
    body("totalCopies").optional().isInt({ min: 1 }),
    body("description").optional().trim().isLength({ max: 1000 }),
    body("publisher").optional().trim().isLength({ max: 100 }),
    body("publicationYear").optional().isInt({ min: 1000, max: new Date().getFullYear() }),
  ],
}

// Borrow validation rules
const borrowValidations = {
  request: [
    body("bookId").isMongoId().withMessage("Invalid book ID"),
    body("requestedDate").optional().isISO8601().toDate().withMessage("Invalid requested date"),
  ],

  approve: [
    body("dueDate")
      .isISO8601()
      .toDate()
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error("Due date must be in the future")
        }
        return true
      }),
  ],
}

// Genre validation rules
const genreValidations = {
  create: [
    body("name").trim().isLength({ min: 1, max: 50 }).withMessage("Genre name must be between 1 and 50 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Description must not exceed 200 characters"),
  ],
}

// Query validation rules
const queryValidations = {
  pagination: [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  ],

  search: [
    query("q")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Search query must be between 1 and 100 characters"),
  ],
}

module.exports = {
  commonValidations,
  userValidations,
  bookValidations,
  borrowValidations,
  genreValidations,
  queryValidations,
}