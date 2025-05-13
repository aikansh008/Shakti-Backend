const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PersonalDetails = require('../Models/PersonalDetailSignup');
const nodemailer = require('nodemailer');  // Import Nodemailer
const tempUsers = require('../tempUserStore');

// Configure Nodemailer transport using Gmail (or other service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shakti1374@gmail.com',
    pass: 'zuyh rxns ybrr wihh'  // Re  // Replace with your email password (use an app-specific password for Gmail)
  }
});
const loginUser = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Log the request body to check for missing data
    console.log('Request Body:', req.body);

    if (!Password) {
      return res.status(400).json({ message: "Password is required!" });
    }

    const user = await PersonalDetails.findOne({ 'personalDetails.Email': Email });

    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    if (!user.passwordDetails || !user.passwordDetails.Password) {
      return res.status(400).json({ message: "User password not found!" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(Password, user.passwordDetails.Password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    // Continue with OTP generation and sending email...
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error!" });
  }
};


// OTP verification endpoint
const verifyOtp = async (req, res) => {
  try {
    const { Email, otp } = req.body;

    // Check if the OTP exists for the provided email
    if (!tempUsers.has(Email)) {
      return res.status(400).json({ message: "OTP not found or expired." });
    }

    const userData = tempUsers.get(Email);

    // Check if the OTP is expired
    if (Date.now() > userData.otpExpiration) {
      tempUsers.delete(Email); // Delete expired OTP
      return res.status(400).json({ message: "OTP has expired. Please request a new OTP." });
    }

    // Check if the OTP matches
    if (userData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // OTP is valid, proceed with generating JWT and login
    const user = await PersonalDetails.findOne({ 'personalDetails.Email': Email });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with JWT token
    

    // Clean up OTP from temporary storage after successful verification
    tempUsers.delete(Email);

  } catch (err) {
    console.error("OTP Verification Error:", err);
    res.status(500).json({ message: "Server error!" });
  }
};

module.exports = { loginUser, verifyOtp };
