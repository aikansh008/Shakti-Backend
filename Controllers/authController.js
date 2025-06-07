const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PersonalDetails = require('../Models/User/PersonalDetailSignup');
const generatejwt = require('../Middlewares/generatejwt')

const loginUser = async (req, res) => {
  try {
    // Ensure req.body exists before destructuring
    if (!req.body) {
      return res.status(400).json({ message: "Request body missing" });
    }

    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({ message: "Email and Password are required" });
    }

    const user = await PersonalDetails.findOne({ 'personalDetails.Email': Email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.passwordDetails || !user.passwordDetails.Password) {
      return res.status(400).json({ message: "Password not set for user" });
    }

    // Check password
    const isMatch = await bcrypt.compare(Password, user.passwordDetails.Password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
const token = generatejwt(user._id, user.email)

// Generate token


    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: Email,
        name: user.personalDetails?.Full_Name || '',
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { loginUser };
