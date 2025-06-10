const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  // For development, use ethereal email (fake SMTP service)
  if (process.env.NODE_ENV === "development") {
    return nodemailer.createTransporter({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal.user@ethereal.email",
        pass: "ethereal.pass",
      },
    });
  }

  // For production, use your actual email service
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@library.com",
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("📧 Email would be sent:", mailOptions);
      console.log("📧 Email content:", options.text);
      return { success: true, messageId: "dev-mode" };
    }

    const result = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("📧 Email sending failed:", error);
    throw error;
  }
};

// Send notification email
const sendNotificationEmail = async (user, subject, message) => {
  try {
    await sendEmail({
      to: user.email,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Library Notification</h2>
          <p>Dear ${user.name},</p>
          <p>${message}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from the Library Management System.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
};

// Send overdue reminder
const sendOverdueReminder = async (user, borrowedBooks) => {
  const booksList = borrowedBooks
    .map(
      (book) =>
        `- ${book.book.title} (Due: ${new Date(
          book.dueDate
        ).toLocaleDateString()})`
    )
    .join("\n");

  const message = `
You have overdue books that need to be returned:

${booksList}

Please return these books as soon as possible to avoid additional fines.
Current total fine: $${borrowedBooks
    .reduce((total, book) => total + (book.fine || 0), 0)
    .toFixed(2)}

Thank you,
Library Management Team
  `;

  await sendNotificationEmail(user, "Overdue Books Reminder", message);
};

// Send due date reminder
const sendDueDateReminder = async (user, borrowedBooks) => {
  const booksList = borrowedBooks
    .map(
      (book) =>
        `- ${book.book.title} (Due: ${new Date(
          book.dueDate
        ).toLocaleDateString()})`
    )
    .join("\n");

  const message = `
The following books are due soon:

${booksList}

Please return or renew these books before the due date to avoid fines.

Thank you,
Library Management Team
  `;

  await sendNotificationEmail(user, "Books Due Soon", message);
};

module.exports = {
  sendEmail,
  sendNotificationEmail,
  sendOverdueReminder,
  sendDueDateReminder,
};
