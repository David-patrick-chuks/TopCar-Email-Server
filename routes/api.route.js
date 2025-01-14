const express = require("express");
const nodemailer = require("nodemailer");
const Client = require("../model/Client"); // Import Client model
const router = express.Router();
require("dotenv").config();

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/send-email", async (req, res) => {
  const { email, message, firstName, lastName, messageType } = req.body;
const lastname = lastName
const firstname = firstName
  if (!email || !message || !firstname || !lastname || !messageType) {
    return res.status(400).send({ error: "All fields are required" });
  }

  try {
    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "draz.dev365@gmail.com", // Sending to yourself
      subject: `📧 New Message from ${firstname} ${lastname}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
          <h2 style="color: #e53935; text-align: center;">📩 New Message Received</h2>
          <p style="color: #555; font-size: 1.1em;">
            You have a new message submitted through your website. Here are the details:
          </p>
          
          <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #e53935; border-bottom: 1px solid #f0f0f0;">Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${firstname} ${lastname}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #e53935; border-bottom: 1px solid #f0f0f0;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">
                <a href="mailto:${email}" style="color: #e53935; text-decoration: none;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #e53935; border-bottom: 1px solid #f0f0f0;">Message Type:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">${messageType}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; color: #e53935; vertical-align: top;">Message:</td>
              <td style="padding: 10px; background: #f9f9f9; border-radius: 5px; border: 1px solid #f0f0f0;">
                ${message}
              </td>
            </tr>
          </table>
          
          <p style="color: #555; font-size: 0.9em;">
            <strong>Note:</strong> This inquiry was submitted through your website. Make sure to follow up promptly to maintain excellent customer service.
          </p>
          
          <footer style="text-align: center; margin-top: 20px; color: #999; font-size: 0.85em;">
            <p>&copy; ${new Date().getFullYear()} TopCars. All rights reserved.</p>
            <p style="margin: 0;">This email was sent automatically. Please do not reply to this email.</p>
          </footer>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Save to MongoDB
    const newClient = new Client({
      email,
      firstname,
      lastname,
      message,
      messageType,
    });
    await newClient.save();

    res
      .status(200)
      .send({ message: "Email sent and client data saved successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to send email or save data" });
  }
});

router.get("/", (req, res) => {
  res.send({ message: "API is working 🚀" });
});

module.exports = router;
