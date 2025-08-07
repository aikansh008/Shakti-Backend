const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const PersonalDetails = require('../Models/User/PersonalDetailSignup');

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/forgot-password', async (req, res) => {
  const { Email } = req.body;

  if (!Email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await PersonalDetails.findOne({ 'personalDetails.Email': Email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '15m' });

    // For production: email the resetToken
    res.status(200).json({
      message: "Password reset token generated",
      token: resetToken,
      // Optional frontend link: 
      // link: `https://your-frontend.com/reset-password/${resetToken}`
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
