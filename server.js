// server.js

// 1) Load environment variables from .env
require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 2) Middleware to parse URL-encoded form data (from booking.html)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 3) Serve everything in /public/ as static assets
app.use(express.static(path.join(__dirname, 'public')));

// 4) Configure Nodemailer transport using your Gmail credentials (from .env)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // your Gmail address, e.g. "yourname@gmail.com"
    pass: process.env.GMAIL_PASS  // your generated App Password
  }
});

// 5) POST handler for booking form submissions
app.post('/book', (req, res) => {
  // Extract form fields from the request body
  const { name, email, phone, checkin, checkout, offer } = req.body;

  // Compose the email content
  const mailOptions = {
    from: process.env.GMAIL_USER,         // Sender (your Gmail)
    to: process.env.GMAIL_USER,           // You also send it to yourself
    subject: 'New Booking Request',
    text: `
A new booking has been made:

Name: ${name}
Email: ${email}
Phone: ${phone}
Offer Selected: ${offer}
Check-in: ${checkin}
Check-out: ${checkout}

Please follow up with the guest as soon as possible.
    `,
    html: `
      <h2>New Booking Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Offer Selected:</strong> ${offer}</p>
      <p><strong>Check-in:</strong> ${checkin}</p>
      <p><strong>Check-out:</strong> ${checkout}</p>
      <hr>
      <p>Please follow up with the guest as soon as possible.</p>
    `
  };

  // 5a) Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending booking email:', error);
      // Optionally, you can send back a JSON error and let the front-end show a message.
      return res.status(500).send('There was an error processing your booking. Please try again later.');
    }
    console.log('Booking email sent:', info.response);
    // 5b) Respond to the browser: simple thank-you page or redirect
    return res.sendFile(path.join(__dirname, 'public', 'booking-success.html'));
  });
});

// 6) Fallback: if no route matched, redirect to home (optional)
app.use((req, res, next) => {
  res.redirect('/');
});

// 7) Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
