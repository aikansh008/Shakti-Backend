const bcrypt = require('bcrypt');
const PersonalDetails = require('../Models/User/PersonalDetailSignup');
const tempUsers = require("../tempUserStore");
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');  // Import Nodemailer

// Configure Nodemailer transport using Gmail (or other service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shakti1374@gmail.com',
    pass: 'zuyh rxns ybrr wihh'  // Replace with your email password (use an app-specific password for Gmail)
  }
});

// In-memory store for OTP request tracking (for rate limiting)
const otpRequestHistory = {};  // Format: { sessionId: { count: <number>, lastRequest: <timestamp> } }

const MAX_REQUESTS = 5; // Max OTP requests allowed
const WINDOW_TIME = 1* 60 * 1000; // 1 minutes window (in milliseconds)

const signupUser = async (req, res) => {
  try {
    const {
      personalDetails: { Full_Name, Email, Preferred_Languages },
      professionalDetails: { Business_Experience, Educational_Qualifications },
      passwordDetails: { Password, Create_Password }
    } = req.body;

    if (!Full_Name || !Email || !Preferred_Languages || !Business_Experience || !Educational_Qualifications || !Create_Password || !Password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    if (!Email.includes('@')) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    if (Create_Password !== Password) {
      return res.status(400).json({ message: "Passwords do not match!" });
    }

    // Rate limit check for OTP requests
    const sessionId = uuidv4();
    const currentTime = Date.now();

    // If the user has requested an OTP recently, check the rate limit
    if (otpRequestHistory[sessionId]) {
      const { count, lastRequest } = otpRequestHistory[sessionId];

      // Check if the request window has expired
      if (currentTime - lastRequest < WINDOW_TIME) {
        if (count >= MAX_REQUESTS) {
          return res.status(429).json({ message: `Too many OTP requests. Please try again after ${WINDOW_TIME / 1000 / 60} minutes.` });
        } else {
          otpRequestHistory[sessionId].count += 1;  // Increment the count for OTP requests
        }
      } else {
        // Reset the counter if the window has expired
        otpRequestHistory[sessionId] = { count: 1, lastRequest: currentTime };
      }
    } else {
      otpRequestHistory[sessionId] = { count: 1, lastRequest: currentTime }; // First OTP request
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(Create_Password, saltRounds);

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    // Store temporary user data
    tempUsers.set(sessionId, {
      personalDetails: {
        Full_Name,
        Email,
        Preferred_Languages
      },
      professionalDetails: {
        Business_Experience,
        Educational_Qualifications
      },
      passwordDetails: {
        HashedPassword: hashedPassword
      },
      otp: otp.toString() // store as string for comparison
    });

    const mailOptions = {
      from: 'aikanshtiwari007@gmail.com',
      to: Email,
      subject: 'OTP Verification',
      text: `Hi ${Full_Name},\n\nYour OTP for signup is: ${otp}\n\nPlease enter this OTP to verify your email.\n\nRegards,\nTeam`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: "Error sending OTP email." });
      } else {
        console.log('OTP email sent:', info.response);
        res.status(200).json({ message: "OTP sent to email", sessionId });
      }
    });

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error!" });
  }
};

module.exports = { signupUser };