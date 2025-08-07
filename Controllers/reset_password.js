const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const PersonalDetails = require('../Models/User/PersonalDetailSignup');
const bcrypt = require('bcrypt');

// ✅ Add this line to get the secret from .env or fallback to a default
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password are required" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await PersonalDetails.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.passwordDetails.Password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: "Token expired" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
