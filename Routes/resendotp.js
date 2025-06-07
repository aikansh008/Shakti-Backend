const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const tempUsers = require("../tempUserStore");

// Configure Nodemailer transport using Gmail (or other service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shakti1374@gmail.com',
    pass: 'zuyh rxns ybrr wihh'  //Use an app-specific password for Gmail
  }
});

// Resend OTP function
const resendOtp = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required." });
    }

    const tempUser = tempUsers.get(sessionId);

    if (!tempUser) {
      return res.status(400).json({ message: "Invalid or expired session ID." });
    }

    // Check resend count to prevent spamming
    if (tempUser.resendCount >= 3) {
      return res.status(400).json({ message: "You have reached the maximum number of OTP resend attempts. Please try again later." });
    }

    // Check if OTP has expired
    if (tempUser.expiresAt && new Date() > new Date(tempUser.expiresAt)) {
      tempUsers.delete(sessionId); // Cleanup expired session
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Regenerate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    tempUser.otp = otp.toString(); // Store the new OTP as a string
    tempUser.resendCount = (tempUser.resendCount || 0) + 1; // Increment resend count
    tempUser.expiresAt = new Date(new Date().getTime() + 2 * 60000); // Set expiration time (e.g., 5 minutes)
    tempUsers.set(sessionId, tempUser); // Update the session data with new OTP

    // Send OTP email again
    const mailOptions = {
      from: 'aikanshtiwari007@gmail.com',
      to: tempUser.personalDetails.Email,
      subject: 'OTP Verification',
      text: `Hi ${tempUser.personalDetails.Full_Name},\n\nYour new OTP for signup is: ${otp}\n\nPlease enter this OTP to verify your email.\n\nRegards,\nTeam`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending OTP email:', error);
        return res.status(500).json({ message: "Error sending OTP email." });
      } else {
        console.log('OTP email resent:', info.response);
        res.status(200).json({ message: "OTP resent to email" });
      }
    });

  } catch (err) {
    console.error("Resend OTP Error:", err);
    res.status(500).json({ message: "Server error during OTP resend." });
  }
};

module.exports = { resendOtp };
